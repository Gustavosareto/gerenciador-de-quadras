
export interface CalculateFeesOptions {
    feeMode: string; // 'FIXED' | 'PERCENTAGE'
    feeValue: number;
}

export interface CalculateFeesResult {
    basePrice: number;
    serviceFee: number;
    totalAmount: number;
}

export class PaymentService {
    constructor(private gateway: any) { }

    calculateFees(basePrice: number, options: CalculateFeesOptions): CalculateFeesResult {
        let serviceFee = 0;

        if (options.feeMode === 'FIXED') {
            serviceFee = options.feeValue;
        } else if (options.feeMode === 'PERCENTAGE') {
            serviceFee = basePrice * (options.feeValue / 100);
        }

        // Garantir 2 casas decimais
        serviceFee = Math.round(serviceFee * 100) / 100;
        const totalAmount = basePrice + serviceFee;

        return {
            basePrice,
            serviceFee,
            totalAmount
        };
    }
}

export interface CreatePixChargeParams {
    reservationId: string;
    companyId: string;
    customerId: string;
    amount: number;
    basePrice: number;
    serviceFee: number;
    description: string;
    customerName?: string;
    customerPhone?: string;
    customerDocument?: string;
}

export interface PixChargeResult {
    providerChargeId: string;
    pixCopyPaste: string;
    pixQrCodeUrl: string;
    expiresAt: Date;
    platformFee?: number;
}

export class AbacatePayGateway {
    private apiKey: string;
    private apiUrl = 'https://api.abacatepay.com/v1/pixQrCode/create';

    constructor() {
        this.apiKey = process.env.ABACATE_PAY_API_KEY || process.env.ABACATEPAY_API_KEY || '';
        if (!this.apiKey) {
            console.error('⚠️ ABACATEPAY_API_KEY is not set');
        }
    }

    async createPixCharge(params: CreatePixChargeParams): Promise<PixChargeResult> {
        if (!this.apiKey) {
            throw new Error('Gateway config error: Missing API Key');
        }

        const amountInCents = Math.round(params.amount * 100);

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    amount: amountInCents,
                    expiresIn: 300, // 5 minutes
                    description: params.description || 'Reserva de Quadra',
                    customer: {
                        name: params.customerName || 'Cliente Arena',
                        cellphone: params.customerPhone || '5511999999999',
                        taxId: params.customerDocument || '00000000000',
                        email: 'noreply@arena.com'
                    },
                    metadata: {
                        reservationId: params.reservationId,
                        companyId: params.companyId,
                        serviceFee: String(params.serviceFee),
                        basePrice: String(params.basePrice)
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`AbacatePay Error: ${errorText}`);
            }

            const jsonResponse = await response.json();
            const pixData = jsonResponse.data;

            if (!pixData) {
                throw new Error('Resposta do AbacatePay não contém dados');
            }

            return {
                providerChargeId: pixData.id,
                pixCopyPaste: pixData.brCode,
                pixQrCodeUrl: pixData.brCodeBase64 || pixData.brCode,
                expiresAt: new Date(pixData.expiresAt),
                platformFee: pixData.platformFee
            };

        } catch (error) {
            console.error('AbacatePay Gateway Error:', error);
            throw error;
        }
    }
}
