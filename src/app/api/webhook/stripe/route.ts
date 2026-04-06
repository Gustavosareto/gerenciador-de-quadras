import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { inngest } from '@/lib/inngest/client';

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Enviar para a Inngest de forma assíncrona
    await inngest.send({
        name: "stripe/webhook.received",
        id: event.id, // Garante que o Inngest recuse envios duplicados deste exato webhook
        data: {
            type: event.type,
            session: session,
            subscription: event.type === 'customer.subscription.deleted' ? event.data.object : undefined,
        },
    });

    console.log(`[Stripe Webhook] Evento ${event.type} enfileirado no Inngest com sucesso.`);
    return NextResponse.json({ received: true });
}
