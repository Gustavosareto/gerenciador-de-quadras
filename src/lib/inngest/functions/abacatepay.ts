import { inngest } from "../client";
import { prisma } from "@/lib/prisma";

export const processAbacatePayWebhook = inngest.createFunction(
  { 
    id: "process-abacatepay-webhook", 
    retries: 5,
    triggers: [{ event: "abacatepay/webhook.received" }]
  },
  async ({ event, step }: any) => {
    const { payload, webhookEventId } = event.data;

    await step.run("process-payment-status", async () => {
      try {
        if (payload.event === "pixQrCode.paid") {
          await handlePaymentPaid(payload);
        } else if (payload.event === "pixQrCode.expired") {
          await handlePaymentExpired(payload);
        }

        // Marcar como processado
        await prisma.webhookEvent.update({
          where: { id: webhookEventId },
          data: {
            status: "PROCESSED",
            processedAt: new Date(),
          },
        });
      } catch (error) {
        // Registrar erro
        await prisma.webhookEvent.update({
          where: { id: webhookEventId },
          data: {
            status: "FAILED",
            errorLog: error instanceof Error ? error.message : "Unknown error",
          },
        });
        throw error;
      }
    });

    return { message: "Pagamento processado com sucesso via Inngest" };
  }
);

async function handlePaymentPaid(payload: any) {
  const pixChargeId = payload.data.id;

  const payment = await prisma.payment.findFirst({
    where: { providerChargeId: pixChargeId },
  });

  if (!payment) {
    throw new Error(`Pagamento não encontrado para pixChargeId: ${pixChargeId}`);
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: new Date() },
    }),
    prisma.reservation.update({
      where: { id: payment.reservationId },
      data: { status: "CONFIRMED" },
    }),
    prisma.ledgerEntry.create({
      data: {
        companyId: payment.companyId,
        paymentId: payment.id,
        type: "CREDIT_RESERVATION",
        amount: payment.baseAmount,
        direction: "IN",
        description: `Pagamento recebido - Reserva ${payment.reservationId}`,
      },
    }),
    prisma.company.update({
      where: { id: payment.companyId },
      data: { balancePending: { increment: payment.baseAmount } },
    }),
  ]);
}

async function handlePaymentExpired(payload: any) {
  const pixChargeId = payload.data.id;

  const payment = await prisma.payment.findFirst({
    where: { providerChargeId: pixChargeId },
  });

  if (!payment) return;

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED" },
    }),
    prisma.reservation.update({
      where: { id: payment.reservationId },
      data: { status: "CANCELLED" },
    }),
  ]);
}
