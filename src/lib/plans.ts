export const PLANS = {
    ESSENCIAL: {
        id: 'essencial',
        name: 'Essencial',
        price: 0,
        priceId: null,
    },
    PROFISSIONAL: {
        id: 'profissional',
        name: 'Profissional',
        price: 49.90,
        priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PROFESSIONAL || 'price_1SzSbPRrTLG7SUs4QDAfIkpK', 
    },
};
