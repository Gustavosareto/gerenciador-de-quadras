'use client';

import { PartyPopper, Trophy, Calendar, MapPin, Phone, Download, Share2, Timer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils';

interface ConfirmationStepProps {
    bookingData: {
        courtName: string;
        courtPrice: number; // Hourly rate
        date: Date | null;
        time: string | null;
        duration: number;
        customerName: string;
        customerDocument: string;
        customerPhone: string;
    };
    tenantName: string;
    bookingCode: string;
}

const SERVICE_FEE = 5.00;

export default function ConfirmationStep({ bookingData, tenantName, bookingCode }: ConfirmationStepProps) {
    const totalCourtPrice = bookingData.courtPrice * bookingData.duration;
    const totalAmount = totalCourtPrice + SERVICE_FEE;

    const endTime = bookingData.time ? (() => {
        const [hours, minutes] = bookingData.time.split(':').map(Number);
        const endHour = hours + bookingData.duration;
        return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    })() : '';

    const downloadReceipt = async () => {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;

        const doc = new jsPDF();

        // Cores
        const accentColor = [204, 255, 0]; // #CCFF00

        // Cabeçalho
        doc.setFillColor(30, 30, 30);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(tenantName.toUpperCase(), 105, 20, { align: 'center' });

        doc.setFontSize(10);
        doc.text('COMPROVANTE DE RESERVA', 105, 30, { align: 'center' });

        // Código da Reserva
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text('Código da Reserva:', 20, 55);
        doc.setFontSize(18);
        doc.setTextColor(150, 180, 0);
        doc.text(bookingCode, 20, 65);

        // Informações Principais
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        autoTable(doc, {
            startY: 75,
            head: [['INFORMAÇÕES DA RESERVA', '']],
            body: [
                ['Quadra', bookingData.courtName],
                ['Data', bookingData.date ? format(bookingData.date, "dd/MM/yyyy", { locale: ptBR }) : ''],
                ['Horário', `${bookingData.time} às ${endTime}`],
                ['Duração', `${bookingData.duration}h`],
                ['Cliente', bookingData.customerName],
                ['CPF/Documento', bookingData.customerDocument],
                ['WhatsApp', bookingData.customerPhone],
                ['Status do Pagamento', 'APROVADO (PIX)']
            ],
            theme: 'striped',
            headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } }
        });

        // Financeiro
        const finalY = (doc as any).lastAutoTable.finalY + 10;

        autoTable(doc, {
            startY: finalY,
            head: [['DETALHAMENTO FINANCEIRO', 'VALOR']],
            body: [
                [`Valor da Quadra (${bookingData.duration}h)`, formatCurrency(bookingData.courtPrice * bookingData.duration)],
                ['Taxa de Serviço', formatCurrency(SERVICE_FEE)],
                ['TOTAL PAGO', formatCurrency((bookingData.courtPrice * bookingData.duration) + SERVICE_FEE)]
            ],
            theme: 'grid',
            headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] },
            columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
        });

        // Rodapé
        const pageHeight = doc.internal.pageSize.height;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Este é um documento gerado automaticamente e serve como comprovante de pagamento.', 105, pageHeight - 20, { align: 'center' });
        doc.text('Gerado em: ' + format(new Date(), "dd/MM/yyyy HH:mm:ss"), 105, pageHeight - 15, { align: 'center' });

        doc.save(`reserva-${bookingCode.toLowerCase()}.pdf`);
    };


    return (
        <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-accent-500 rounded-full mb-6 shadow-[0_0_40px_rgba(204,255,0,0.4)]">
                    <PartyPopper size={40} className="text-black" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">Reserva Confirmada!</h2>
                <p className="text-lg text-zinc-400">Pagamento aprovado com sucesso</p>
            </div>

            {/* Booking Code */}
            <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-accent-500/20 via-accent-500/5 to-transparent border border-accent-500/30 rounded-2xl p-6 text-center">
                    <p className="text-sm text-zinc-400 mb-2 uppercase tracking-wider font-semibold">
                        Código da Reserva
                    </p>
                    <p className="text-3xl font-bold text-accent-500 font-mono tracking-wider">
                        {bookingCode}
                    </p>
                    <p className="text-xs text-zinc-500 mt-2">
                        Use este código para consultar ou cancelar sua reserva
                    </p>
                </div>
            </div>

            {/* Booking Details */}
            <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-accent-500/10 rounded-xl">
                            <Trophy size={24} className="text-accent-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
                                Quadra Reservada
                            </p>
                            <p className="text-xl font-bold text-white">{bookingData.courtName}</p>
                            <p className="text-sm text-zinc-400 mt-1">{tenantName}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-accent-500/10 rounded-xl">
                            <Calendar size={24} className="text-accent-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-1">
                                Data e Horário
                            </p>
                            <p className="text-xl font-bold text-white">
                                {bookingData.date && format(bookingData.date, "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                            <p className="text-sm text-zinc-400 mt-1">
                                {bookingData.time} - {endTime}
                                <span className="ml-2 px-2 py-0.5 bg-accent-500/10 text-accent-500 text-[10px] font-bold rounded-full border border-accent-500/20">
                                    {bookingData.duration}H TOTAL
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Summary */}
            <div className="max-w-2xl mx-auto bg-black/40 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-3xl -mr-16 -mt-16" />

                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-6 bg-accent-500 rounded-full" />
                    Resumo do Pagamento
                </h3>

                <div className="space-y-4">
                    <div className="flex justify-between items-center text-zinc-400">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">Valor da quadra</span>
                            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                                {bookingData.duration} {bookingData.duration === 1 ? 'HORA' : 'HORAS'} X {formatCurrency(bookingData.courtPrice)}
                            </span>
                        </div>
                        <span className="font-bold text-white text-lg">{formatCurrency(totalCourtPrice)}</span>
                    </div>

                    <div className="flex justify-between items-center text-zinc-400">
                        <span className="text-sm font-medium">Taxa de serviço</span>
                        <span className="font-bold text-white text-lg">{formatCurrency(SERVICE_FEE)}</span>
                    </div>

                    <div className="pt-6 mt-2 border-t border-white/5 flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Total Pago</span>
                            <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit uppercase">
                                Liquitado
                            </span>
                        </div>
                        <span className="text-4xl font-black text-accent-500 italic">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-8 mt-4 border-t border-white/5">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Método</p>
                            <p className="text-white font-bold flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-accent-500" />
                                PIX
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Horas Totais</p>
                            <p className="text-white font-bold flex items-center gap-2">
                                <Timer size={14} className="text-accent-500" />
                                {bookingData.duration} {bookingData.duration === 1 ? 'hora' : 'horas'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>


            {/* Contact Info */}
            <div className="max-w-2xl mx-auto bg-accent-500/5 border border-accent-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                    <Phone size={20} className="text-accent-500 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <p className="text-white font-semibold mb-1">Precisa de ajuda?</p>
                        <p className="text-sm text-zinc-400">
                            Entre em contato conosco caso precise alterar sua reserva.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="max-w-2xl mx-auto flex justify-center">
                <button
                    onClick={downloadReceipt}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-10 py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl w-full sm:w-auto"
                >
                    <Download size={20} />
                    <span>Baixar Comprovante</span>
                </button>
            </div>
        </div>
    );
}