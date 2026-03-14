import { prisma } from "@/lib/prisma";
import { CustomersClient } from "./CustomersClient";
import { User } from "@/types";
import { notFound } from "next/navigation";
import { startOfDay } from "date-fns";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function CustomersPage({ params }: PageProps) {
  const { tenantSlug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!company) return notFound();

  // 1. Fetch customers with their reservation stats for this company
  const dbCustomers = await prisma.customer.findMany({
    where: {
      reservations: {
        some: {
          companyId: company.id,
        },
      },
    },
    include: {
      reservations: {
        where: {
          companyId: company.id,
          status: "CONFIRMED",
        },
        orderBy: {
          startAt: "desc",
        },
      },
    },
  });

  // 2. Map to UI format
  const customers = dbCustomers.map((c) => {
    const confirmedReservations = c.reservations;
    const totalSpent = confirmedReservations.reduce(
      (sum, res) => sum + Number(res.totalPrice),
      0,
    );
    const lastVisit =
      confirmedReservations[0]?.startAt.toLocaleDateString("pt-BR") || "-";

    return {
      id: c.id,
      name: c.name,
      email: c.email || "",
      role: "customer" as const,
      tenantId: company.id,
      phone: c.phone || undefined,
      cpf: c.cpf || undefined,
      totalSpent,
      bookingsCount: confirmedReservations.length,
      lastVisit,
    };
  });

  // 3. Calculate Global Stats
  const totalCustomers = customers.length;

  // Average Ticket
  const allConfirmedReservations = await prisma.reservation.findMany({
    where: {
      companyId: company.id,
      status: "CONFIRMED",
    },
  });
  const totalRevenue = allConfirmedReservations.reduce(
    (sum, res) => sum + Number(res.totalPrice),
    0,
  );
  const avgTicket =
    allConfirmedReservations.length > 0
      ? totalRevenue / allConfirmedReservations.length
      : 0;

  // New Customers Today (Simplified: customers whose FIRST reservation was today)
  // For now, let's just count customers created today if we had a createdAt date on Customer model (we do)
  const today = startOfDay(new Date());
  const newCustomersToday = await prisma.customer.count({
    where: {
      createdAt: { gte: today },
      reservations: {
        some: { companyId: company.id },
      },
    },
  });

  const stats = {
    totalCustomers,
    avgTicket,
    newCustomersToday,
    trends: {
      total: "", // To implement
      ticket: "", // To implement
      newToday: "", // To implement
    },
  };

  return (
    <CustomersClient
      tenantSlug={tenantSlug}
      initialCustomers={customers}
      stats={stats}
    />
  );
}
