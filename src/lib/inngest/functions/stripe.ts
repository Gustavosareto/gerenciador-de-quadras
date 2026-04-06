import { inngest } from "../client";
import { prisma } from "@/lib/prisma";

export const processStripeWebhook = inngest.createFunction(
  { 
    id: "process-stripe-webhook", 
    retries: 5,
    triggers: [{ event: "stripe/webhook.received" }]
  },
  async ({ event }: any) => {
    const { type, session, subscription } = event.data;

    switch (type) {
      case "checkout.session.completed":
        {
          const tenantSlug = session?.metadata?.tenantSlug;

          if (tenantSlug) {
            await prisma.company.update({
              where: { slug: tenantSlug },
              data: {
                planType: "PROFISSIONAL",
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
              },
            });
            console.log(`Plan upgraded for tenant: ${tenantSlug}`);
          }
        }
        break;

      case "customer.subscription.deleted":
        {
          const slug = subscription?.metadata?.tenantSlug;

          if (slug) {
            await prisma.company.update({
              where: { slug },
              data: {
                planType: "FREE",
              },
            });
            console.log(`Plan downgraded for tenant: ${slug}`);
          }
        }
        break;

      default:
        console.log(`Unhandled stripe event type ${type}`);
    }

    return { success: true };
  }
);
