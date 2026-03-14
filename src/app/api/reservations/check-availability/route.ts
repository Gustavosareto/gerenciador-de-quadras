import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const courtId = searchParams.get('courtId');
        const dateStr = searchParams.get('date');

        if (!courtId || !dateStr) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const date = new Date(dateStr);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const reservations = await prisma.reservation.findMany({
            where: {
                courtId,
                status: { in: ['CONFIRMED', 'PENDING_PAYMENT', 'HOLD'] },
                AND: [
                    { startAt: { lt: dayEnd } },
                    { endAt: { gt: dayStart } }
                ]
            },
            select: {
                startAt: true,
                endAt: true
            }
        });

        // Filter out expired HOLDs if necessary? 
        // For now, let's keep it simple and return all non-cancelled/non-completed.

        const busySlots = reservations.map(res => ({
            start: res.startAt,
            end: res.endAt
        }));

        return NextResponse.json({ busySlots });
    } catch (error) {
        console.error('Error checking availability:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
