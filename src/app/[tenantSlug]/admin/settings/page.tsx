import { prisma } from "@/lib/prisma";
import SettingsClient from "@/components/admin/SettingsClient";
import { stripe } from "@/lib/stripe";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function SettingsPage({ params }: PageProps) {
  const { tenantSlug } = await params;

  const tenant = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!tenant) return <div>Tenant not found</div>;

  let subscriptionDetails = null;

  if (tenant.planType === "PROFISSIONAL" && tenant.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        tenant.stripeSubscriptionId,
      );
      const price = subscription.items.data[0].price.unit_amount || 0;

      subscriptionDetails = {
        nextBillingDate: format(
          new Date((subscription as any).current_period_end * 1000),
          "dd/MM/yy",
        ),
        amount: price / 100,
        status:
          subscription.status === "active" ? "Ativo" : subscription.status,
        id: subscription.id,
      };
    } catch (error) {
      console.error("Error fetching subscription:", error);
    }
  }

  const openingHours = tenant.openingHours as {
    open: string;
    close: string;
  } | null;

  const initialData = {
    name: tenant.name,
    address: (tenant as any).addressStreet || tenant.address || "",
    addressStreet: (tenant as any).addressStreet || "",
    addressCep: (tenant as any).addressCep || "",
    addressNumber: (tenant as any).addressNumber || "",
    addressCity: (tenant as any).addressCity || "",
    addressState: (tenant as any).addressState || "",
    phone: tenant.phone || "",
    whatsapp: tenant.whatsapp || "",
    email: tenant.email || "",
    instagram: tenant.instagram || "",
    openTime: openingHours?.open || "06:00",
    closeTime: openingHours?.close || "23:00",
    logo: (tenant as any).logo || null,
  };

  return (
    <SettingsClient
      tenantSlug={tenantSlug}
      initialData={initialData}
      planType={tenant.planType || "FREE"}
      subscriptionDetails={subscriptionDetails}
    />
  );
}
