import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AbacatePayGateway } from '@/modules/payments/services/payment.service';

console.log('🔄 API Route carregada: api/payments/create-pix');

// Initialize Gateway once
const gateway = new AbacatePayGateway();

/**
 * Cria uma cobrança PIX usando AbacatePay
 * 
 * Documentação: https://docs.abacatepay.com
 * Endpoint: POST /v1/pixQrCode/create
 * 
 * IMPORTANTE: Configure as variáveis de ambiente:
 * - ABACATEPAY_API_KEY
 * - ABACATEPAY_DEV_MODE=true (para testes)
 */

interface CreatePixRequest {
    amount: number;
    customerName: string;
    customerDocument: string;
    customerPhone: string;
    description: string;
    reservationId?: string;
    companyId: string;
    courtId?: string;
    bookingDate?: string;
    bookingTime?: string;
    duration?: number;
}

interface AbacatePayPixResponse {
    data: {
        id: string;
        amount: number;
        status: string;
        devMode: boolean;
        brCode: string;
        brCodeBase64: string;
        platformFee: number;
        createdAt: string;
        updatedAt: string;
        expiresAt: string;
    } | null;
    error: string | null;
}

export async function POST(request: NextRequest) {
    try {
        console.log('📥 Recebendo requisição de criação de PIX...');

        const body: CreatePixRequest = await request.json();
        console.log('✅ Body parseado:', { ...body, customerDocument: '***' });

        const apiKey = process.env.ABACATEPAY_API_KEY;
        const devMode = process.env.ABACATEPAY_DEV_MODE === 'true';

        console.log('🔑 API Key configurada?', !!apiKey);
        console.log('🧪 Dev Mode?', devMode);

        if (!apiKey) {
            console.error('❌ ABACATEPAY_API_KEY não configurada');
            return NextResponse.json(
                { error: 'ABACATEPAY_API_KEY não configurada' },
                { status: 500 }
            );
        }

        console.log('💾 Conectando ao banco de dados...');

        // Criar ou buscar cliente
        // Priorizar busca por TELEFONE que é único
        let customer = await prisma.customer.findUnique({
            where: { phone: body.customerPhone }
        });

        if (!customer && body.customerDocument) {
            // Tentar por CPF se não achou por telefone
            const existingByCpf = await prisma.customer.findFirst({
                where: { cpf: body.customerDocument }
            });
            if (existingByCpf) {
                customer = existingByCpf;
            }
        }

        if (!customer) {
            console.log('👤 Criando novo cliente...');
            try {
                customer = await prisma.customer.create({
                    data: {
                        name: body.customerName,
                        phone: body.customerPhone,
                        cpf: body.customerDocument,
                    },
                });
                console.log('✅ Cliente criado:', customer.id);
            } catch (error) {
                // Se falhar por Unique Constraint (race condition), tenta buscar de novo
                console.warn('⚠️ Falha ao criar cliente (provável duplicidade), tentando buscar novamente...', error);
                customer = await prisma.customer.findUnique({
                    where: { phone: body.customerPhone }
                });

                if (!customer) throw new Error("Falha ao criar ou recuperar cliente");
            }
        } else {
            console.log('✅ Cliente encontrado:', customer.id);
            // Opcional: Atualizar dados se necessário?
        }

        // Check company plan limits before creating reservation
        const company = await prisma.company.findUnique({ where: { id: body.companyId } });
        if (company) {
            const isFreePlan = !company.planType || company.planType === 'FREE';
            if (isFreePlan) {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

                const bookingsCount = await prisma.reservation.count({
                    where: {
                        companyId: company.id,
                        createdAt: {
                            gte: startOfMonth,
                            lte: endOfMonth
                        }
                    }
                });

                if (bookingsCount >= 30) {
                    return NextResponse.json(
                        { error: 'A empresa atingiu o limite de agendamentos do plano Grátis.' },
                        { status: 403 }
                    );
                }
            }
        }

        // Criar reserva se não existir
        let reservationId = body.reservationId;

        if (!reservationId) {
            if (body.courtId && body.bookingDate && body.bookingTime) {
                console.log('📅 Criando nova reserva...', { courtId: body.courtId, date: body.bookingDate, time: body.bookingTime });

                // Calcular datas
                const startAt = new Date(body.bookingDate);
                const [hours, minutes] = body.bookingTime.split(':').map(Number);
                startAt.setHours(hours, minutes, 0, 0);

                const duration = body.duration || 1;
                const endAt = new Date(startAt);
                endAt.setHours(endAt.getHours() + duration);

                // Validar Conflitos (Overlap)
                const conflict = await prisma.reservation.findFirst({
                    where: {
                        courtId: body.courtId,
                        status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'HOLD'] },
                        AND: [
                            { startAt: { lt: endAt } },
                            { endAt: { gt: startAt } }
                        ]
                    }
                });

                if (conflict) {
                    // Verificação de Idempotência:
                    // Se o conflito for do MESMO cliente, no MESMO horário e estiver PENDENTE,
                    // assumimos que é uma retentativa (ex: refresh da página ou React Strict Mode)
                    const isSameCustomer = conflict.customerId === customer.id;
                    const isSameTime = conflict.startAt.getTime() === startAt.getTime() && conflict.endAt.getTime() === endAt.getTime();
                    const isPending = conflict.status === 'PENDING_PAYMENT';

                    if (isSameCustomer && isSameTime && isPending) {
                        console.log("⚠️ Reserva já existe para este usuário (PENDING), reutilizando...", conflict.id);
                        reservationId = conflict.id;
                    } else {
                        console.error('❌ Conflito de horário detectado:', { startAt, endAt, conflictId: conflict.id });
                        return NextResponse.json(
                            { error: 'Este horário já foi reservado por outro cliente enquanto você preenchia os dados. Por favor, escolha outro horário.' },
                            { status: 409 }
                        );
                    }
                }

                if (!reservationId) {
                    const reservation = await prisma.reservation.create({
                        data: {
                            companyId: body.companyId,
                            customerId: customer.id,
                            courtId: body.courtId,
                            startAt: startAt,
                            endAt: endAt,
                            status: 'PENDING_PAYMENT',
                            totalPrice: body.amount,
                        }
                    });
                    reservationId = reservation.id;
                    console.log('✅ Reserva criada:', reservationId);
                }
            } else {
                // Fallback apocalíptico: se não tiver dados da reserva, mas precisarmos salvar o pagamento...
                // NÃO PODEMOS salvar o pagamento sem reserva válida (FK).
                // Solução: Erro explícito
                console.error('❌ Faltando dados para criar a reserva (courtId, date, time)');
                return NextResponse.json(
                    { error: 'Dados incompletos para criar a reserva.' },
                    { status: 400 }
                );
            }
        }

        console.log('🥑 Chamando AbacatePay Gateway...');

        // Criar cobrança no AbacatePay usando o Gateway padronizado
        const pixCharge = await gateway.createPixCharge({
            reservationId: reservationId,
            companyId: body.companyId,
            customerId: customer.id,
            amount: body.amount,
            basePrice: body.amount - 2.00, // Service fee default?
            serviceFee: 2.00,
            description: body.description,
            customerName: body.customerName,
            customerPhone: body.customerPhone,
            customerDocument: body.customerDocument
        });

        console.log('✅ AbacatePay respondeu:', { id: pixCharge.providerChargeId });

        console.log('💾 Salvando pagamento no banco...');

        // Salvar pagamento no banco
        const payment = await prisma.payment.create({
            data: {
                companyId: body.companyId,
                reservationId: reservationId,
                totalAmount: body.amount,
                baseAmount: body.amount - 2.00, // Service fee
                serviceFee: 2.00,
                gatewayFee: (pixCharge.platformFee || 0) / 100, // Converter de centavos
                provider: 'ABACATE_PAY',
                providerChargeId: pixCharge.providerChargeId,
                pixCopyPaste: pixCharge.pixCopyPaste,
                pixQrCodeUrl: pixCharge.pixQrCodeUrl, // Base64 ou URL
                status: 'PENDING',
                expiresAt: pixCharge.expiresAt,
                metadata: {
                    devMode: true, // Asumido ou vindo do process.env
                    customerName: body.customerName,
                    description: body.description,
                },
            },
        });

        console.log('✅ Pagamento salvo:', payment.id);
        console.log('🎉 PIX gerado com sucesso!');

        return NextResponse.json({
            paymentId: payment.id,
            pixChargeId: pixCharge.providerChargeId,
            pixCode: pixCharge.pixCopyPaste,
            qrCodeBase64: pixCharge.pixQrCodeUrl,
            amount: body.amount,
            status: 'PENDING',
            expiresAt: pixCharge.expiresAt,
            platformFee: (pixCharge.platformFee || 0) / 100,
            devMode: true,
        });

    } catch (error) {
        console.error('💥 ERRO GERAL:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A');
        console.error('Tipo do erro:', typeof error);

        return NextResponse.json(
            {
                error: 'Erro ao gerar código PIX',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
