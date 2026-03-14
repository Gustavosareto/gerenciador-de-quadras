import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const { tenantSlug } = await req.json();

        if (!tenantSlug) {
            return NextResponse.json({ error: 'Missing tenantSlug' }, { status: 400 });
        }

        console.log(`[SYNC] Syncing subscription for tenant: ${tenantSlug}`);

        // Find subscription by metadata (tenantSlug)
        const subscriptions = await stripe.subscriptions.search({
            query: `metadata['tenantSlug']:'${tenantSlug}' AND status:'active'`,
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            console.log(`[SYNC] No active subscription found for tenant: ${tenantSlug}`);
            return NextResponse.json({ synced: false, message: 'No active subscription found' });
        }

        const subscription = subscriptions.data[0];
        console.log(`[SYNC] Found subscription: ${subscription.id} for customer: ${subscription.customer}`);

        // Update company record
        await prisma.company.update({
            where: { slug: tenantSlug },
            data: {
                planType: 'PROFISSIONAL',
                stripeCustomerId: subscription.customer as string,
                stripeSubscriptionId: subscription.id,
            },
        });

        console.log(`[SYNC] Updated company plan to PROFISSIONAL`);

        return NextResponse.json({ success: true, synced: true });

    } catch (error: any) {
        console.error('Subscription Sync Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
