import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { inngest } from '@/lib/inngest/client';

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
        const rawBody = await request.text();
        const body: AbacatePayWebhookPayload = JSON.parse(rawBody);

        // Security: Check for Signature or Secret Presence
        const signature = request.headers.get('x-abacatepay-signature');
        const internalSecret = process.env.ABACATEPAY_WEBHOOK_SECRET;

        // Validação estrita do HMAC
        if (internalSecret) {
            if (!signature) {
                console.error("⚠️ Security Alert: Webhook recebido sem assinatura.");
                return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
            }

            const expectedSignature = crypto
                .createHmac('sha256', internalSecret)
                .update(rawBody)
                .digest('hex');

            if (signature !== expectedSignature) {
                console.error("⚠️ Security Alert: Assinatura do webhook inválida.", { signature, expectedSignature });
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        } else {
            console.warn("⚠️ Security Warning: ABACATEPAY_WEBHOOK_SECRET não configurado. Aceitando webhook inseguro (não faça isso em produção).");
        }

        // Idempotência: verificar se já processamos este evento
        const existingEvent = await prisma.webhookEvent.findUnique({
            where: { eventId: `${body.event}_${body.data.id}` },
        });

        if (existingEvent?.status === 'PROCESSED') {
            return NextResponse.json({ received: true, duplicate: true });
        }

        // Salvar evento no DB como Fila Inicial
        const webhookEvent = await prisma.webhookEvent.create({
            data: {
                eventId: `${body.event}_${body.data.id}`,
                provider: 'ABACATE_PAY',
                payload: body as any,
                status: 'PROCESSING', // Será atualizado pela Inngest no background
            },
        });

        // Enviar evento para a Inngest de forma assíncrona (A API não espera o processamento)
        await inngest.send({
            name: "abacatepay/webhook.received",
            id: webhookEvent.eventId, // Idempotência nativa do Inngest via ID do evento
            data: {
                payload: body,
                webhookEventId: webhookEvent.id,
            },
        });

        // Responder ao Gateway de Pagamento instantaneamente ("Tudo certo, anotado!")
        return NextResponse.json({ received: true });

    } catch (error) {
        console.error('Erro no webhook:', error);
        return NextResponse.json(
            { error: 'Erro ao processar webhook' },
            { status: 500 }
        );
    }
}

