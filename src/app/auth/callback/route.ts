import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (!code) {
        return NextResponse.redirect(`${origin}/login?error=missing_code`);
    }

    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
        console.error('[AUTH CALLBACK] Erro ao trocar code por sessão:', error);
        return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    const user = data.user;
    const isOAuthUser = user.app_metadata?.provider === 'google';

    // Para usuários Google, verificar se já tem empresa. Se não, criar.
    if (isOAuthUser) {
        try {
            const existing = await prisma.company.findFirst({
                where: { ownerId: user.id },
                select: { slug: true },
            });

            if (existing?.slug) {
                // Usuário Google já tem empresa — redireciona direto
                return NextResponse.redirect(`${origin}/${existing.slug}/admin`);
            }

            // Novo usuário Google — criar empresa automaticamente
            const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Arena';
            const rawSlug = displayName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            const slugConflict = await prisma.company.findFirst({ where: { slug: rawSlug } });
            const finalSlug = slugConflict ? `${rawSlug}-${Math.floor(Math.random() * 1000)}` : rawSlug;

            const company = await prisma.company.create({
                data: {
                    name: displayName,
                    slug: finalSlug,
                    ownerId: user.id,
                    planType: 'FREE',
                    email: user.email,
                },
            });

            return NextResponse.redirect(`${origin}/${company.slug}/admin`);
        } catch (err) {
            console.error('[AUTH CALLBACK] Erro ao criar empresa para usuário Google:', err);
            // Tenta redirecionar para setup manual mesmo assim
            return NextResponse.redirect(`${origin}/login?google_setup_needed=true`);
        }
    }

    // Login tradicional (email/senha que confirma email via link) — respeita `next`
    const forwardTo = next.startsWith('/') ? next : '/';
    return NextResponse.redirect(`${origin}${forwardTo}`);
}
