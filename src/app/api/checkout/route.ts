import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase-server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { priceId, tenantSlug, userId, userEmail } = await req.json();

        console.log(`[API/CHECKOUT] Iniciando checkout:`, { priceId, tenantSlug, userId, userEmail });

        if (!priceId) {
            console.error('[API/CHECKOUT] Erro: Price ID não fornecido ou está vazio.');
            return NextResponse.json({ error: 'Price ID é obrigatório. Verifique se as variáveis de ambiente do Stripe estão configuradas corretamente.' }, { status: 400 });
        }

        let targetUser = { id: userId, email: userEmail };

        // 🟢 Segurança: Garantir que quem está assinando é um usuário logado e dono da empresa
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Você precisa estar logado para assinar um plano.' }, { status: 401 });
        }

        const company = await prisma.company.findUnique({ where: { slug: tenantSlug } });
        if (!company || company.ownerId !== user.id) {
            return NextResponse.json({ error: 'Acesso negado: Você não tem permissão para assinar planos nesta empresa.' }, { status: 403 });
        }

        targetUser = { id: user.id, email: user.email as string };

        const origin = req.headers.get('origin');

        // Criar a sessão de checkout do Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'], // PIX em assinaturas requer configuração extra no Stripe, mantendo cartão por enquanto para simplicidade
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${origin}/${tenantSlug}/admin/plan?success=true`,
            cancel_url: `${origin}/${tenantSlug}/admin/plan?canceled=true`,
            customer_email: targetUser.email,
            metadata: {
                tenantSlug,
                userId: targetUser.id,
            },
            subscription_data: {
                metadata: {
                    tenantSlug,
                    userId: targetUser.id,
                },
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('Stripe Checkout Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
