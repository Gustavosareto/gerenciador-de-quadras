'use client';

import { useState, useEffect, useRef } from 'react';
import { Copy, Check, Loader2, AlertCircle, Trophy, Calendar, User } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PaymentStepProps {
    courtPrice: number; // Total court price (hourly * duration)
    companyId: string;
    bookingData: {
        courtId: string;
        courtName: string;
        courtPrice: number; // Hourly rate
        date: Date | null;
        time: string | null;
        customerName: string;
        customerDocument: string;
        customerPhone: string;
        duration: number;
    };
    onPaymentConfirm: (paymentId: string, pixCode: string) => void;
}

const SERVICE_FEE = 5.00;

interface PixResponse {
    paymentId: string;
    pixChargeId: string;
    pixCode: string;
    qrCodeBase64: string;
    amount: number;
    status: string;
    expiresAt: string;
    platformFee: number;
    devMode: boolean;
}

export default function PaymentStep({ courtPrice, companyId, bookingData, onPaymentConfirm }: PaymentStepProps) {
    const [pixData, setPixData] = useState<PixResponse | null>(null);
    const [copied, setCopied] = useState(false);
    const [isGeneratingPix, setIsGeneratingPix] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalAmount = courtPrice + SERVICE_FEE;

    const hasFetchedRef = useRef(false);

    // Gera o código PIX real através da API
    useEffect(() => {
        const generatePix = async () => {
            if (hasFetchedRef.current) return;
            hasFetchedRef.current = true;

            try {
                setIsGeneratingPix(true);
                setError(null);

                const response = await fetch('/api/payments/create-pix', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: totalAmount,
                        customerName: bookingData.customerName,
                        customerDocument: bookingData.customerDocument,
                        customerPhone: bookingData.customerPhone,
                        description: `Reserva ${bookingData.courtName} - ${bookingData.date && format(bookingData.date, 'dd/MM/yyyy')} às ${bookingData.time}`,
                        companyId: companyId,
                        // Dados para criar a reserva
                        courtId: bookingData.courtId,
                        bookingDate: bookingData.date?.toISOString(),
                        bookingTime: bookingData.time,
                        duration: bookingData.duration,
                    }),
                });

                console.log('Response status:', response.status);
                // ... (rest of logic)
                console.log('Response statusText:', response.statusText);

                if (!response.ok) {
                    console.error('❌ Resposta com erro:', {
                        status: response.status,
                        statusText: response.statusText,
                        headers: Object.fromEntries(response.headers.entries())
                    });

                    let errorMessage = `Erro ${response.status}: ${response.statusText}`;
                    let errorDetails = '';

                    try {
                        // Tentar clonar para ler duas vezes se necessário
                        const resClone = response.clone();

                        try {
                            const errorData = await response.json();
                            console.error('📋 Erro da API (JSON):', errorData);
                            errorMessage = errorData.error || errorMessage;
                            errorDetails = errorData.details ? `\nDetalhes: ${errorData.details}` : '';
                        } catch (jsonError) {
                            // Se falhar JSON, tenta ler texto do clone
                            const textError = await resClone.text();
                            console.error('📋 Erro da API (texto):', textError);
                            if (textError) {
                                // Se for HTML (comum em erro 500 do Next.js), tentar extrair mensagem ou usar genérico
                                if (textError.includes('<!DOCTYPE html>')) {
                                    errorMessage = 'Erro interno do servidor (HTML response)';
                                } else {
                                    errorMessage = textError;
                                }
                            }
                        }
                    } catch (e) {
                        console.error('❌ Falha ao processar corpo da resposta:', e);
                    }

                    throw new Error(errorMessage + errorDetails);
                }

                const data: PixResponse = await response.json();

                if (!data || !data.pixCode) {
                    throw new Error('Resposta inválida da API de pagamento');
                }

                setPixData(data);
                setIsGeneratingPix(false);

            } catch (err) {
                console.error('Erro ao gerar PIX:', err);
                const errorMessage = err instanceof Error ? err.message : 'Erro ao gerar código PIX';
                setError(errorMessage);
                setIsGeneratingPix(false);
            }
        };

        generatePix();
    }, [totalAmount, bookingData, companyId]);

    const copyPixCode = () => {
        if (!pixData) return;
        navigator.clipboard.writeText(pixData.pixCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const checkPaymentStatus = async () => {
        if (!pixData) return;

        setIsProcessingPayment(true);

        // Simulação básica (Em produção usaríamos WebSocket ou Polling inteligente)
        try {
            // Chamamos nossa API de simulação de pagamento confirmando no banco
            const response = await fetch('/api/payments/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentId: pixData.paymentId })
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Falha ao confirmar pagamento na simulação:', response.status, text);
            }
        } catch (error) {
            console.error('Erro na requisição de simulação:', error);
        }

        setTimeout(() => {
            setIsProcessingPayment(false);
            onPaymentConfirm(pixData.paymentId, pixData.pixCode);
        }, 1500);
    };

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Pagamento via PIX</h2>
                <p className="text-zinc-400">Escaneie o QR Code ou copie o código PIX</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Resumo da Reserva */}
                <div className="space-y-6">
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4">Resumo da Reserva</h3>

                        <div className="space-y-3">
                            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                                <div className="p-2 bg-accent-500/10 rounded-lg">
                                    <Trophy size={18} className="text-accent-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-zinc-500 font-medium">Quadra</p>
                                    <p className="text-white font-semibold">{bookingData.courtName}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                                <div className="p-2 bg-accent-500/10 rounded-lg">
                                    <Calendar size={18} className="text-accent-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-zinc-500 font-medium">Data e Horário</p>
                                    <p className="text-white font-semibold">
                                        {bookingData.date && format(bookingData.date, "d 'de' MMMM", { locale: ptBR })} às {bookingData.time}
                                        {bookingData.duration > 0 && ` (${bookingData.duration}h)`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                                <div className="p-2 bg-accent-500/10 rounded-lg">
                                    <User size={18} className="text-accent-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-zinc-500 font-medium">Cliente</p>
                                    <p className="text-white font-semibold">{bookingData.customerName}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Valores */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white mb-4">Detalhamento de Valores</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="text-zinc-400 text-sm">Valor da quadra</span>
                                    <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                                        {bookingData.duration} {bookingData.duration === 1 ? 'hora' : 'horas'} x {formatCurrency(bookingData.courtPrice)}
                                    </span>
                                </div>
                                <span className="text-white font-bold">{formatCurrency(courtPrice)}</span>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-white/10">
                                <span className="text-zinc-400 text-sm">Taxa de serviço</span>
                                <span className="text-zinc-400 font-medium">{formatCurrency(SERVICE_FEE)}</span>
                            </div>

                            <div className="flex justify-between items-end pt-2">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-1">Total a Pagar</span>
                                    <span className="text-3xl font-black text-accent-500 italic">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* PIX */}
                <div className="space-y-6">
                    {/* Erro */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-red-400">
                                    <p className="font-semibold mb-1">Erro ao gerar PIX</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QR Code */}
                    <div className="bg-black/30 border border-white/10 rounded-2xl p-8 flex flex-col items-center">
                        {isGeneratingPix ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 size={48} className="text-accent-500 animate-spin mb-4" />
                                <p className="text-zinc-400 font-medium">Gerando código PIX real...</p>
                                <p className="text-xs text-zinc-500 mt-2">Conectando com gateway de pagamento</p>
                            </div>
                        ) : pixData ? (
                            <>
                                <div className="bg-white p-6 rounded-2xl mb-4 shadow-2xl">
                                    <img
                                        src={pixData.qrCodeBase64}
                                        alt="QR Code PIX"
                                        className="w-[220px] h-[220px]"
                                    />
                                </div>
                                <p className="text-sm text-zinc-500 text-center">
                                    Escaneie com o aplicativo do seu banco
                                </p>
                                <p className="text-xs text-zinc-600 mt-2">
                                    Expira em: {format(new Date(pixData.expiresAt), "HH:mm 'de' dd/MM", { locale: ptBR })}
                                </p>
                                {pixData.devMode && (
                                    <div className="mt-3 px-3 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                        <p className="text-xs text-yellow-500 text-center font-semibold">
                                            🧪 MODO DE TESTE
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </div>

                    {/* Código PIX */}
                    {!isGeneratingPix && pixData && (
                        <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                                Ou pague com PIX Copia e Cola
                            </h4>

                            <div className="bg-black/40 border border-white/5 rounded-xl p-4">
                                <p className="text-xs text-zinc-400 font-mono break-all leading-relaxed">
                                    {pixData.pixCode}
                                </p>
                            </div>

                            <button
                                onClick={copyPixCode}
                                className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-500/30 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                            >
                                {copied ? (
                                    <>
                                        <Check size={20} className="text-accent-500" />
                                        <span>Código Copiado!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy size={20} />
                                        <span>Copiar Código PIX</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* Botão Confirmar Pagamento */}
                    {!isGeneratingPix && pixData && (
                        <button
                            onClick={checkPaymentStatus}
                            disabled={isProcessingPayment}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isProcessingPayment
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-accent-500 hover:bg-accent-400 text-black shadow-[0_0_30px_rgba(204,255,0,0.3)] hover:scale-[1.02]'
                                }`}
                        >
                            {isProcessingPayment ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Verificando pagamento...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={20} />
                                    <span>Já fiz o pagamento</span>
                                </>
                            )}
                        </button>
                    )}

                    {/* Info */}
                    <div className="p-4 bg-accent-500/5 border border-accent-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle size={18} className="text-accent-500 flex-shrink-0 mt-0.5" />
                            <div className="text-xs text-zinc-400">
                                <p className="font-semibold text-white mb-1">Aguardando pagamento</p>
                                <p>
                                    Após realizar o pagamento, clique no botão "Já fiz o pagamento" para confirmar.
                                    O processo pode levar até 2 minutos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
