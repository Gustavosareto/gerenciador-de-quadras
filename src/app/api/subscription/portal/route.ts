import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Não autorizado. Faça login novamente.' }, { status: 401 });
        }

        const { tenantSlug } = await req.json();

        if (!tenantSlug) {
            return NextResponse.json({ error: 'Tenant Slug não informado.' }, { status: 400 });
        }

        const company = await prisma.company.findUnique({
            where: { slug: tenantSlug }
        });

        if (!company) {
            return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 });
        }

        if (company.ownerId !== user.id) {
            return NextResponse.json({ error: 'Você não tem permissão para gerenciar esta assinatura.' }, { status: 403 });
        }

        if (!company.stripeCustomerId) {
            return NextResponse.json({ error: 'Nenhum histórico de pagamento encontrado no Stripe.' }, { status: 400 });
        }

        const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

        // Criar sessão do Portal do Cliente
        const session = await stripe.billingPortal.sessions.create({
            customer: company.stripeCustomerId,
            return_url: `${origin}/${tenantSlug}/admin/settings`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Portal Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
