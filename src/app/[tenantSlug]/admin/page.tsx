import { prisma } from "@/lib/prisma";
import {
  TrendingUp,
  ArrowRight,
  Trophy,
  Activity,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { DashboardPeriodSelector } from "@/components/admin/DashboardPeriodSelector";
import Link from "next/link";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  isBefore,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Prisma } from "@prisma/client";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

type ReservationWithDetails = Prisma.ReservationGetPayload<{
  include: { customer: true; court: true };
}>;

export default async function AdminDashboardPage({ params }: PageProps) {
  const { tenantSlug } = await params;

  // 1. Fetch Tenant & Basic Info
  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
    include: {
      courts: true,
    },
  });

  if (!company) return <div>Tenant não encontrado</div>;

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // 2. Parallelize Data Fetching using Promise.all
  const [
    todayReservations,
    upcomingReservations,
    monthlyAggregates,
    todayStats,
    customerRef,
  ] = await Promise.all([
    // Query 1: Today's Reservations (List)
    prisma.reservation.findMany({
      where: {
        companyId: company.id,
        startAt: { gte: todayStart, lte: todayEnd },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: {
        customer: true,
        court: true,
      },
      orderBy: { startAt: "asc" },
    }),

    // Query 2: Upcoming Reservations (List)
    prisma.reservation.findMany({
      where: {
        companyId: company.id,
        startAt: { gte: addDays(todayStart, 1), lte: addDays(todayEnd, 7) },
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: {
        customer: true,
        court: true,
      },
      orderBy: { startAt: "asc" },
      take: 6,
    }),

    // Query 3: Monthly Aggregates
    prisma.reservation.aggregate({
      _sum: { totalPrice: true },
      _count: { id: true },
      where: {
        companyId: company.id,
        status: { in: ["CONFIRMED", "COMPLETED"] },
        startAt: { gte: monthStart, lte: monthEnd },
      },
    }),

    // Query 4: Today's Stats
    prisma.reservation.groupBy({
      by: ["status"],
      where: {
        companyId: company.id,
        startAt: { gte: todayStart, lte: todayEnd },
      },
      _sum: { totalPrice: true },
      _count: { id: true },
    }),

    // Query 5: Total Distinct Customers
    prisma.reservation.groupBy({
      by: ["customerId"],
      where: { companyId: company.id },
    }),
  ]);

  // Process aggregated data
  const monthlyRevenue = Number(monthlyAggregates._sum.totalPrice || 0);
  const confirmedBookingsCount = monthlyAggregates._count.id;

  const todayPendingData = todayStats.find(
    (s) => s.status === "PENDING_PAYMENT",
  );

  const todayRevenue = todayReservations.reduce(
    (acc, res) => acc + Number(res.totalPrice),
    0,
  );

  const todayConfirmed = todayReservations.length;
  const todayPending = todayPendingData?._count.id || 0;

  const availableTotalSlots = (company.courts.length || 1) * 10;
  const occupancyRate = Math.min(
    100,
    Math.round((todayReservations.length / availableTotalSlots) * 100),
  );

  const mainStats = [
    {
      label: "Receita de Hoje",
      value: `R$ ${todayRevenue.toLocaleString("pt-BR")}`,
      change: `${todayReservations.length} reservas`,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Reservas Confirmadas",
      value: todayConfirmed.toString(),
      change:
        todayPending > 0 ? `${todayPending} pendentes` : "Tudo confirmado",
      icon: CheckCircle2,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Ocupação Hoje",
      value: `${occupancyRate}%`,
      change: `${todayReservations.length}/${availableTotalSlots} slots`,
      icon: Activity,
      color: "text-accent-500",
      bg: "bg-accent-500/10",
    },
    {
      label: "Faturamento Mensal",
      value: `R$ ${monthlyRevenue.toLocaleString("pt-BR")}`,
      change: `${confirmedBookingsCount} reservas`,
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
      case "COMPLETED":
        return (
          <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
            Confirmada
          </span>
        );
      case "PENDING_PAYMENT":
        return (
          <span className="px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-[10px] font-bold uppercase">
            Pendente
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">
            Cancelada
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full bg-zinc-500/10 text-zinc-400 text-[10px] font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  const isCurrentlyActive = (startAt: Date, endAt: Date) => {
    return isWithinInterval(now, {
      start: new Date(startAt),
      end: new Date(endAt),
    });
  };

  const isPast = (endAt: Date) => {
    return isBefore(new Date(endAt), now);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
            Dashboard
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })} •{" "}
            <span className="text-white font-medium">{company.name}</span>
          </p>
        </div>
        <DashboardPeriodSelector />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {mainStats.map((stat, i) => (
          <Card
            key={i}
            className="border-white/5 bg-zinc-900/50 hover:border-white/10 transition-all group"
          >
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={18} className="sm:hidden" />
                  <stat.icon size={24} className="hidden sm:block" />
                </div>
              </div>
              <h3 className="text-zinc-500 text-xs sm:text-sm font-medium leading-tight">
                {stat.label}
              </h3>
              <p className="text-xl sm:text-3xl font-black mt-1 text-white tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs text-zinc-600 mt-1.5">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-white/5 bg-zinc-900/50 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-6">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Calendar size={20} className="text-accent-500" />
                Reservas de Hoje
              </CardTitle>
              <p className="text-xs text-zinc-500 mt-1">
                {todayReservations.length} reservas • {todayConfirmed}{" "}
                confirmadas
              </p>
            </div>
            <div className="text-xs font-bold text-accent-500">
              {format(now, "HH:mm")}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {todayReservations.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {todayReservations.map((res: ReservationWithDetails) => {
                  const isActive = isCurrentlyActive(res.startAt, res.endAt);
                  const isCompleted = isPast(res.endAt);

                  return (
                    <div
                      key={res.id}
                      className={`
                        p-4 rounded-2xl border transition-all
                        ${isActive
                          ? "border-accent-500/50 bg-accent-500/5 shadow-lg shadow-accent-500/10"
                          : isCompleted
                            ? "border-white/5 bg-white/[0.02] opacity-60"
                            : "border-white/5 bg-white/[0.02] hover:border-white/10"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div
                            className={`
                              flex flex-col items-center justify-center px-3 py-2 rounded-xl border
                              ${isActive ? "border-accent-500/30 bg-accent-500/10" : "border-white/10 bg-zinc-800/50"}
                            `}
                          >
                            <span
                              className={`text-xs font-bold ${isActive ? "text-accent-500" : "text-white"}`}
                            >
                              {format(new Date(res.startAt), "HH:mm")}
                            </span>
                            <span className="text-[10px] text-zinc-600">-</span>
                            <span
                              className={`text-xs font-bold ${isActive ? "text-accent-500" : "text-zinc-500"}`}
                            >
                              {format(new Date(res.endAt), "HH:mm")}
                            </span>
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-bold text-white">
                                {res.customer.name}
                              </h4>
                              {isActive && (
                                <span className="px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-500 text-[10px] font-bold uppercase flex items-center gap-1">
                                  <Activity size={10} /> Em andamento
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                              <span className="flex items-center gap-1">
                                <Trophy size={12} className="text-zinc-600" />
                                {res.court.name}
                              </span>
                              <span className="text-zinc-700">•</span>
                              {getStatusBadge(res.status)}
                            </div>
                            <div className="mt-2 text-xs text-zinc-600">
                              {res.customer.phone || "Sem telefone"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-black text-white">
                            R$ {Number(res.totalPrice).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-800/50 border border-white/5 flex items-center justify-center mx-auto mb-4">
                  <Calendar size={24} className="text-zinc-600" />
                </div>
                <p className="text-sm text-zinc-500 font-medium">
                  Nenhuma reserva para hoje
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  As reservas aparecerão aqui automaticamente
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-zinc-900/50">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              Próximas Reservas
            </CardTitle>
            <p className="text-xs text-zinc-500 mt-1">Próximos 7 dias</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {upcomingReservations.length > 0 ? (
                upcomingReservations.map((res: ReservationWithDetails) => (
                  <div
                    key={res.id}
                    className="p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-bold text-white leading-none">
                          {res.customer.name}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-1.5">
                          <Trophy size={10} className="text-zinc-600" />
                          {res.court.name}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-white/40 whitespace-nowrap">
                        R$ {Number(res.totalPrice).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-600">
                      <span>{format(new Date(res.startAt), "dd/MM")}</span>
                      <span>•</span>
                      <span>{format(new Date(res.startAt), "HH:mm")}</span>
                      <span>-</span>
                      <span>{format(new Date(res.endAt), "HH:mm")}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-sm text-zinc-500 italic">
                    Nenhuma reserva próxima
                  </p>
                </div>
              )}
            </div>
            {upcomingReservations.length > 0 && (
              <Link href={`/${tenantSlug}/admin/bookings`}>
                <button className="w-full p-4 text-xs font-bold text-blue-500 uppercase tracking-widest hover:bg-blue-500/5 transition-all flex items-center justify-center gap-2 border-t border-white/5">
                  Ver todas <ArrowRight size={14} />
                </button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {company.courts.map((court) => {
          const courtToday = todayReservations.filter(
            (r) => r.courtId === court.id,
          );
          const currentReservation = courtToday.find((r) =>
            isCurrentlyActive(r.startAt, r.endAt),
          );

          return (
            <Card
              key={court.id}
              className="border-white/5 bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 ${currentReservation
                        ? "bg-accent-500/10 text-accent-500"
                        : court.isActive
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                        }`}
                    >
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {court.name}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        {currentReservation ? (
                          <span className="text-accent-500 font-bold flex items-center gap-1">
                            <Activity size={10} /> Em uso agora
                          </span>
                        ) : court.isActive ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle2 size={10} /> Disponível
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <XCircle size={10} /> Manutenção
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <Link href={`/${tenantSlug}/admin/courts`}>
                    <div className="p-2 rounded-lg bg-white/5 hover:bg-accent-500/20 hover:text-accent-500 transition-colors cursor-pointer">
                      <ArrowRight size={16} />
                    </div>
                  </Link>
                </div>
                <div className="text-xs text-zinc-600 flex items-center justify-between">
                  <span>{courtToday.length} reservas hoje</span>
                  <span>
                    R${" "}
                    {courtToday
                      .reduce(
                        (acc, r) => acc + Number(r.totalPrice),
                        0,
                      )
                      .toFixed(0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
