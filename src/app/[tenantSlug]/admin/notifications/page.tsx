import { prisma } from "@/lib/prisma";
import NotificationsClient, {
  Notification,
} from "@/components/admin/NotificationsClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function NotificationsPage({ params }: PageProps) {
  const { tenantSlug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!company) return notFound();

  const dbNotifications = await prisma.notificationJob.findMany({
    where: { companyId: company.id },
    orderBy: { scheduledAt: "desc" },
    include: {
      customer: true,
      reservation: true,
    },
  });

  const notifications: Notification[] = dbNotifications.map((job) => ({
    id: job.id,
    type: job.type as any,
    status: job.status as any,
    scheduledAt: job.scheduledAt,
    title: job.templateName.replace(/_/g, " "),
    message: `Notificação enviada via ${job.channel}`,
    reservationId: job.reservationId || "N/A",
    customerName: job.customer?.name || "Desconhecido",
    customerPhone: job.customer?.phone || "N/A",
  }));

  return <NotificationsClient initialNotifications={notifications} />;
}
