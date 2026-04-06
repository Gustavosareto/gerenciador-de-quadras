import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisHost = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisHost && redisToken ? Redis.fromEnv() : null;

const strictRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/strict'
}) : null;

const standardRateLimit = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit/standard'
}) : null;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  /* --- 1. RATE LIMITING --- */
  if (path.startsWith('/api') && redis && strictRateLimit && standardRateLimit) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    let limitResult;

    if (path.startsWith('/api/auth') || path.startsWith('/api/checkout')) {
      limitResult = await strictRateLimit.limit(`strict_${ip}`);
    } else if (path.startsWith('/api/payments/webhook') || path.startsWith('/api/webhook/stripe')) {
      limitResult = await standardRateLimit.limit(`standard_${ip}`);
    }

    if (limitResult && !limitResult.success) {
      console.warn(`🛑 [Rate Limiting] Bloqueando IP ${ip} em ${path}`);
      return NextResponse.json(
        { error: 'Você fez muitas requisições. Rate Limiting Edge Acionado. Tente novamente em alguns segundos.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limitResult.limit.toString(),
            'X-RateLimit-Remaining': limitResult.remaining.toString(),
            'X-RateLimit-Reset': limitResult.reset.toString(),
          }
        }
      );
    }
  }

  /* --- 2. SUPABASE AUTH & TENANT ROUTING --- */
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return response;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  // ROTA PROTEGIDA: /:slug/admin
  const adminRegex = /^\/([^/]+)\/admin(\/.*)?$/;
  const match = path.match(adminRegex);

  if (match) {
    const tenantSlug = match[1];

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }

    const userCompanySlug = user.user_metadata?.company_slug;

    if (userCompanySlug && userCompanySlug !== tenantSlug) {
      const url = request.nextUrl.clone();
      url.pathname = `/${userCompanySlug}/admin`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
