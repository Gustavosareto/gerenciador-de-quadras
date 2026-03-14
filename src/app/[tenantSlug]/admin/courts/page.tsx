import { prisma } from "@/lib/prisma";
import { CourtsClient } from "./CourtsClient";
import { notFound } from "next/navigation";
import { Tenant, PlanType, Court, CourtType } from "@/types";

function mapPlanType(plan: string): PlanType {
  if (plan === "PRO") return "profissional";
  return "essencial";
}

function mapCourtType(dbType: string): CourtType {
  const normalized = dbType.toUpperCase().replace(/\s/g, "");
  const map: Record<string, CourtType> = {
    FUTEBOL: "futsal",
    FUTSAL: "futsal",
    TENIS: "tennis",
    TENNIS: "tennis",
    VOLEI: "volleyball",
    VOLEIBOL: "volleyball",
    VOLLEYBALL: "volleyball",
    BASKET: "basketball",
    BASKETBALL: "basketball",
    BASQUETE: "basketball",
    BEACH: "beach-tennis",
    BEACHTENNIS: "beach-tennis",
  };
  return map[normalized] || "futsal";
}

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function AdminCourtsPage({ params }: PageProps) {
  const { tenantSlug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!company) return notFound();

  const dbCourts = await prisma.court.findMany({
    where: { companyId: company.id },
  });

  const tenant: Tenant = {
    id: company.id,
    name: company.name,
    slug: company.slug || tenantSlug,
    plan: mapPlanType(company.planType || "FREE"),
    pixKey: company.payoutPixKey || undefined,
    // Default missing fields
    logo: undefined,
    description: undefined,
    primaryColor: undefined,
    address: undefined,
  };

  const courts: Court[] = dbCourts.map((c: typeof dbCourts[number]) => ({
    id: c.id,
    tenantId: c.companyId,
    name: c.name,
    type: mapCourtType(c.type),
    hourlyRate: Number(c.hourlyRate),
    reservationType: (c.reservationType as "FIXED" | "OPEN") || "FIXED",
    image: c.image || undefined,
    images: c.images || [],
    description: c.description || undefined,
    isMaintenance: !c.isActive,
    useCompanyAddress: c.useCompanyAddress ?? true,
    customAddress: c.customAddress || undefined,
    minPlayers: c.minPlayers || undefined,
    maxPlayers: c.maxPlayers || undefined,
    surface: c.surface || undefined,
    dimensions: c.dimensions || undefined,
  }));

  return (
    <CourtsClient
      initialCourts={courts}
      tenant={tenant}
      tenantSlug={tenantSlug}
    />
  );
}
