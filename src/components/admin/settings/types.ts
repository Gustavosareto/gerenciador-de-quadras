export interface SettingsData {
    name: string;
    address: string;
    addressStreet?: string;
    addressCep: string;
    addressNumber: string;
    addressCity: string;
    addressState: string;
    phone: string;
    whatsapp: string;
    email: string;
    instagram: string;
    openTime: string;
    closeTime: string;
    logo?: string | null;
}

export interface SettingsClientProps {
    tenantSlug: string;
    initialData: SettingsData;
    planType?: string;
    subscriptionDetails?: {
        nextBillingDate: string;
        amount: number;
        status: string;
        id: string;
    } | null;
}

export type TabId = 'profile' | 'security' | 'plans' | 'support';
