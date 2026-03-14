import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ROTA PROTEGIDA: /:slug/admin
  // Verifica se a URL corresponde ao padrão /algo/admin
  const path = request.nextUrl.pathname;
  const adminRegex = /^\/([^/]+)\/admin(\/.*)?$/;
  const match = path.match(adminRegex);

  if (match) {
    const tenantSlug = match[1];

    // 1. Verificar se está logado
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', path);
      return NextResponse.redirect(url);
    }

    // 2. Verificar se o usuário pertence a este tenant
    // (Otimização: Verificar metadados do usuário para evitar query no banco se possível)
    const userCompanySlug = user.user_metadata?.company_slug;

    // Se tiver o slug nos metadados e for diferente da URL, bloqueia
    // Nota: Se o usuário tiver múltiplas empresas, essa lógica simples precisa ser aprimorada
    // para verificar uma lista de slugs ou consultar o banco.
    // Por enquanto, assumimos 1 usuário = 1 empresa principal.
    if (userCompanySlug && userCompanySlug !== tenantSlug) {
      // Redireciona para o admin da empresa correta dele
      const url = request.nextUrl.clone();
      url.pathname = `/${userCompanySlug}/admin`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes - handled separately or protected properly)
     * - login, register, etc (public auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|login|register|forgot-password|reset-password).*)',
  ],
};
