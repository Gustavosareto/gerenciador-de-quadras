import { prisma } from "@/lib/prisma";
import { Booking, Court, CourtType, BookingStatus } from "@/types";
import { notFound } from "next/navigation";
import { BookingCalendar } from "@/components/admin/BookingCalendar";

// Helper to map DB Court Type to Frontend Court Type
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

function mapBookingStatus(status: string): BookingStatus {
  const map: Record<string, BookingStatus> = {
    PENDING_PAYMENT: "pending_payment",
    CONFIRMED: "confirmed",
    CANCELED: "cancelled",
    CANCELLED: "cancelled",
    COMPLETED: "completed",
  };
  return map[status] || "pending_payment";
}

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function BookingsPage({ params }: PageProps) {
  const { tenantSlug } = await params;

  // 1. Fetch Company (Tenant)
  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!company) {
    return notFound();
  }

  // 2. Fetch Courts
  const dbCourts = await prisma.court.findMany({
    where: { companyId: company.id },
  });

  const courts: Court[] = dbCourts.map((c) => ({
    id: c.id,
    tenantId: c.companyId,
    name: c.name,
    type: mapCourtType(c.type),
    description: "",
    hourlyRate: Number(c.hourlyRate),
    reservationType: (c.reservationType as "FIXED" | "OPEN") || "FIXED",
    imageUrl: c.image || undefined,
    isMaintenance: !c.isActive,
  }));

  // 3. Fetch Reservations
  const dbReservations = await prisma.reservation.findMany({
    where: { companyId: company.id },
    include: { customer: true },
    orderBy: { startAt: "desc" },
  });

  const bookings: Booking[] = dbReservations.map((r) => ({
    id: r.id,
    courtId: r.courtId,
    startTime: r.startAt.toISOString(),
    endTime: r.endAt.toISOString(),
    customerName: r.customer?.name || "Cliente Removido",
    customerPhone: r.customer?.phone || "",
    status: mapBookingStatus(r.status),
    totalPrice: Number(r.totalPrice),
    pixCode: undefined,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1">
          Agenda de Reservas
        </h1>
        <p className="text-zinc-400 text-sm">
          Gerencie a ocupação das quadras em tempo real.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <BookingCalendar
          initialBookings={bookings}
          courts={courts}
          tenantSlug={tenantSlug}
        />
      </div>
    </div>
  );
}
