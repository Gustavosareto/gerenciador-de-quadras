export type CourtType = 'futsal' | 'society' | 'tennis' | 'beach-tennis' | 'volleyball' | 'basketball' | 'padel';

export interface Court {
    id: string;
    tenantId?: string;
    name: string;
    type: CourtType;
    hourlyRate: number;
    image?: string;
    images?: string[];
    description?: string;
    reservationType?: 'FIXED' | 'OPEN';
    isMaintenance?: boolean;
    useCompanyAddress?: boolean;
    customAddress?: string;
    minPlayers?: number;
    maxPlayers?: number;
    surface?: string;
    dimensions?: string;
}

export type PlanType = 'essencial' | 'profissional';

export interface Tenant {
    id: string;
    slug: string;
    name: string;
    logo?: string;
    courts?: Court[];
    plan: PlanType;
    description?: string;
    primaryColor?: string;
    address?: string;
    pixKey?: string;
    whatsapp?: string;
    instagram?: string;
    email?: string;
    openingHours?: {
        open: string;
        close: string;
    };
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'pending_payment' | 'completed';

export interface Booking {
    id: string;
    courtId: string;
    startTime: string; // ISO String
    endTime: string;   // ISO String
    customerName: string;
    customerPhone: string;
    status: BookingStatus;
    totalPrice: number;
    pixCode?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'staff' | 'customer';
    tenantId: string;
    phone?: string;
    cpf?: string;
    photo?: string;
}
