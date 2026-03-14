import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

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

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            // Quando um checkout é finalizado com sucesso
            const tenantSlug = session.metadata?.tenantSlug;
            const userId = session.metadata?.userId;

            if (tenantSlug) {
                await prisma.company.update({
                    where: { slug: tenantSlug },
                    data: {
                        planType: 'PROFISSIONAL',
                        stripeCustomerId: session.customer as string,
                        stripeSubscriptionId: session.subscription as string,
                    },
                });
                console.log(`Plan upgraded for tenant: ${tenantSlug}`);
            }
            break;

        case 'customer.subscription.deleted':
            // Quando a assinatura é cancelada ou expira
            const subscription = event.data.object as Stripe.Subscription;
            const slug = subscription.metadata?.tenantSlug;

            if (slug) {
                await prisma.company.update({
                    where: { slug },
                    data: {
                        planType: 'FREE',
                    },
                });
                console.log(`Plan downgraded for tenant: ${slug}`);
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
