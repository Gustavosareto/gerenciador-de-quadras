import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { NotificationService } from '@/modules/notifications/services/notification.service';

/**
 * Webhook para receber notificações de pagamento do AbacatePay
 * 
 * Configure no painel: https://app.abacatepay.com/
 * URL do webhook: https://seudominio.com/api/payments/webhook
 * 
 * Documentação: https://docs.abacatepay.com
 * 
 * Eventos:
 * - pixQrCode.paid - Pagamento confirmado
 * - pixQrCode.expired - PIX expirado
 */

interface AbacatePayWebhookPayload {
    event: string; // 'pixQrCode.paid', 'pixQrCode.expired', etc
    data: {
        id: string;
        amount: number;
        status: string; // PENDING, PAID, EXPIRED
        devMode: boolean;
        brCode: string;
        brCodeBase64: string;
        platformFee: number;
        createdAt: string;
        updatedAt: string;
        expiresAt: string;
        metadata?: {
            externalId?: string;
            companyId?: string;
            customerName?: string;
        };
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: AbacatePayWebhookPayload = await request.json();

        // Security: Check for Signature or Secret Presence
        const signature = request.headers.get('x-abacatepay-signature');
        const internalSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

        // TODO: Implement proper HMAC validation using 'signature' and 'internalSecret'
        // For now, we assume if it hits the endpoint it's valid, but this is INSECURE for production.
        // Recommended: Compute HMAC(body, secret) and compare with signature.
        if (!signature && internalSecret) {
            console.warn("⚠️ Security Warning: Webhook received without signature.");
        }

        // Idempotência: verificar se já processamos este evento
        const existingEvent = await prisma.webhookEvent.findUnique({
            where: { eventId: `${body.event}_${body.data.id}` },
        });

        if (existingEvent?.status === 'PROCESSED') {
            return NextResponse.json({ received: true, duplicate: true });
        }

        // Salvar evento
        const webhookEvent = await prisma.webhookEvent.create({
            data: {
                eventId: `${body.event}_${body.data.id}`,
                provider: 'ABACATE_PAY',
                payload: body as any,
                status: 'PROCESSING',
            },
        });

        try {
            // Processar webhook baseado no tipo
            if (body.event === 'pixQrCode.paid') {
                await handlePaymentPaid(body);
            } else if (body.event === 'pixQrCode.expired') {
                await handlePaymentExpired(body);
            }

            // Marcar como processado
            await prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: {
                    status: 'PROCESSED',
                    processedAt: new Date(),
                },
            });

            return NextResponse.json({ received: true });

        } catch (error) {
            // Registrar erro
            await prisma.webhookEvent.update({
                where: { id: webhookEvent.id },
                data: {
                    status: 'FAILED',
                    errorLog: error instanceof Error ? error.message : 'Unknown error',
                },
            });

            throw error;
        }

    } catch (error) {
        console.error('Erro no webhook:', error);
        return NextResponse.json(
            { error: 'Erro ao processar webhook' },
            { status: 500 }
        );
    }
}

async function handlePaymentPaid(payload: AbacatePayWebhookPayload) {
    const pixChargeId = payload.data.id;

    // Buscar pagamento no banco
    const payment = await prisma.payment.findFirst({
        where: { providerChargeId: pixChargeId },
        include: { reservation: true },
    });

    if (!payment) {
        console.error(`Pagamento não encontrado para pixChargeId: ${pixChargeId}`);
        return;
    }

    // Atualizar status do pagamento
    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: 'PAID',
            paidAt: new Date(),
        },
    });

    // Atualizar status da reserva
    await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: {
            status: 'CONFIRMED',
        },
    });

    // Criar entrada no ledger
    await prisma.ledgerEntry.create({
        data: {
            companyId: payment.companyId,
            paymentId: payment.id,
            type: 'CREDIT_RESERVATION',
            amount: payment.baseAmount,
            direction: 'IN',
            description: `Pagamento recebido - Reserva ${payment.reservationId}`,
        },
    });

    // Atualizar saldo da empresa
    await prisma.company.update({
        where: { id: payment.companyId },
        data: {
            balancePending: {
                increment: payment.baseAmount,
            },
        },
    });

    // Enviar notificações - DESATIVADO AUTOMATICAMENTE (Solicitação do Cliente)
    // Agora o envio é manual pelo painel admin
    /*
    try {
        const notify = new NotificationService();
        const customer = await prisma.customer.findUnique({
            where: { id: payment.reservation.customerId }
        });
        const company = await prisma.company.findUnique({
            where: { id: payment.companyId }
        });
        const court = await prisma.court.findUnique({
            where: { id: payment.reservation.courtId }
        });

        if (customer && company && customer.phone) {
            await notify.onReservationConfirmed({
                companyId: payment.companyId,
                customerId: customer.id,
                customerPhone: customer.phone,
                reservationId: payment.reservationId,
                startAt: payment.reservation.startAt,
                companyName: company.name,
                courtName: court?.name || 'Quadra',
                address: (company as any).address || 'Endereço da Arena',
                contactRawLink: `https://wa.me/${(company as any).whatsapp || company.payoutPixKey || ''}`
            });
        }
    } catch (notifyError) {
        console.error('Erro ao processar notificações:', notifyError);
    }
    */
}

async function handlePaymentExpired(payload: AbacatePayWebhookPayload) {
    const pixChargeId = payload.data.id;

    const payment = await prisma.payment.findFirst({
        where: { providerChargeId: pixChargeId },
    });

    if (!payment) {
        console.error(`Pagamento não encontrado para pixChargeId: ${pixChargeId}`);
        return;
    }

    // Atualizar status do pagamento
    await prisma.payment.update({
        where: { id: payment.id },
        data: {
            status: 'FAILED',
        },
    });

    // Atualizar status da reserva
    await prisma.reservation.update({
        where: { id: payment.reservationId },
        data: {
            status: 'EXPIRED',
        },
    });

    console.log(`⏰ Pagamento ${payment.id} expirou`);
}
