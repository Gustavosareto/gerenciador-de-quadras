import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { paymentId } = body;

        if (!paymentId) {
            return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
        }

        // Buscar pagamento no banco
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: { reservation: true },
        });

        if (!payment) {
            return NextResponse.json({ error: 'Pagamento não encontrado' }, { status: 404 });
        }

        if (payment.status === 'PAID') {
            return NextResponse.json({ message: 'Pagamento já estava confirmado' });
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

        // Criar entrada no ledger (simulando webhook)
        await prisma.ledgerEntry.create({
            data: {
                companyId: payment.companyId,
                paymentId: payment.id,
                type: 'CREDIT_RESERVATION',
                amount: payment.baseAmount, // Base amount without fees
                direction: 'IN',
                description: `Reserva confirmada (Simulação)`,
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

        return NextResponse.json({ success: true, message: 'Simulação de pagamento confirmada!' });

    } catch (error) {
        console.error('Erro ao simular pagamento:', error);
        return NextResponse.json(
            { error: 'Erro ao processar simulação de pagamento' },
            { status: 500 }
        );
    }
}
