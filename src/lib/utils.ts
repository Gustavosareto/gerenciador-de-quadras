import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}

export function generateTimeSlots(startHour: number, endHour: number) {
    const slots = [];
    for (let i = startHour; i < endHour; i++) {
        slots.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return slots;
}
