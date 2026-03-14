import { prisma } from "@/lib/prisma";
import PublicBookingFlow from "@/components/booking/PublicBookingFlow";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ tenantSlug: string; courtId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tenantSlug, courtId } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
    include: { courts: { where: { id: courtId } } },
  });

  if (!company || company.courts.length === 0) {
    return {
      title: "Quadra não encontrada",
    };
  }

  return {
    title: `Reservar ${company.courts[0].name} | ${company.name}`,
    description: `Agende seu horário na ${company.courts[0].name} em poucos cliques.`,
  };
}

export default async function BookingPage({ params }: PageProps) {
  const { tenantSlug, courtId } = await params;

  // 1. Fetch Tenant
  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!company) return notFound();

  // 2. Fetch All Courts (for context and valid object construction)
  const dbCourts = await prisma.court.findMany({
    where: { companyId: company.id, isActive: true },
  });

  // 3. Verify if requested court exists in this tenant
  const requestedCourt = dbCourts.find((c) => c.id === courtId);
  if (!requestedCourt) return notFound();

  // 4. Map to Component Props
  const courts = dbCourts.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    hourlyRate: Number(c.hourlyRate),
    reservationType: ((c as any).reservationType === "OPEN"
      ? "OPEN"
      : "FIXED") as "OPEN" | "FIXED",
    image: c.image || undefined,
    images: (c as any).images || [],
    useCompanyAddress: (c as any).useCompanyAddress ?? true,
    customAddress: (c as any).customAddress || undefined,
  }));

  const tenant = {
    id: company.id,
    name: company.name,
    slug: company.slug || tenantSlug,
    logo: company.logo || undefined,
    address: company.address || undefined,
  };

  return (
    <PublicBookingFlow
      tenant={tenant}
      courts={courts} // Although we are in a specific court page, passing all allows the component to know about others if needed, though strictly we might just need the one. PublicBookingFlow expects array.
      tenantSlug={tenantSlug}
      initialCourtId={courtId}
    />
  );
}
