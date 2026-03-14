import { prisma } from "@/lib/prisma";
import PublicBookingFlow from "@/components/booking/PublicBookingFlow";
import { Tenant, CourtType } from "@/types";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function PublicBookingPage({ params }: PageProps) {
  const { tenantSlug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!company) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Estabelecimento não encontrado
          </h1>
          <p className="text-zinc-400">Verifique se o link está correto</p>
        </div>
      </div>
    );
  }

  const prismaCourts = await prisma.court.findMany({
    where: { companyId: company.id, isActive: true },
  });

  // Map Prisma data to expected interfaces
  const tenant: Tenant = {
    id: company.id,
    name: company.name,
    slug: company.slug || "",
    logo: company.logo || undefined,
    address: company.address || undefined,
    plan:
      (company.planType || "").toLowerCase() === "pro"
        ? "profissional"
        : "essencial",
    pixKey: company.payoutPixKey || undefined,
    whatsapp: company.whatsapp || undefined,
    instagram: company.instagram || undefined,
    email: company.email || undefined,
    openingHours: company.openingHours as { open: string; close: string; } || undefined,
  };

  const courts = prismaCourts.map((c) => ({
    id: c.id,
    tenantId: c.companyId,
    name: c.name,
    type: c.type as CourtType,
    hourlyRate: Number(c.hourlyRate),
    reservationType: (c as any).reservationType || "FIXED",
    image: c.image || undefined,
    images: (c as any).images || [],
    useCompanyAddress: (c as any).useCompanyAddress ?? true,
    customAddress: (c as any).customAddress || undefined,
    minPlayers: (c as any).minPlayers || undefined,
    maxPlayers: (c as any).maxPlayers || undefined,
    surface: (c as any).surface || undefined,
    dimensions: (c as any).dimensions || undefined,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <PublicBookingFlow
        tenant={tenant}
        courts={courts}
        tenantSlug={tenantSlug}
      />
    </div>
  );
}
