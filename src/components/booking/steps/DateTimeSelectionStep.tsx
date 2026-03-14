'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Timer, Info } from 'lucide-react';
import { format, addDays, startOfToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateTimeSelectionStepProps {
    courtId: string;
    tenantSlug: string;
    selectedDate: Date | null;
    selectedTime: string | null;
    selectedDuration: number;
    court: {
        id: string;
        name: string;
        reservationType: 'FIXED' | 'OPEN';
        hourlyRate: number;
    };
    openingHours?: {
        open: string;
        close: string;
    };
    onSelectDateTime: (date: Date, time: string, duration?: number) => void;
}

export default function DateTimeSelectionStep({
    courtId,
    tenantSlug,
    selectedDate,
    selectedTime,
    selectedDuration,
    court,
    openingHours,
    onSelectDateTime
}: DateTimeSelectionStepProps) {
    const [availableDates, setAvailableDates] = useState<Date[]>([]);
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [localSelectedDate, setLocalSelectedDate] = useState<Date | null>(selectedDate);
    const [busySlots, setBusySlots] = useState<{ start: Date; end: Date }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Gerar próximos 14 dias
    useEffect(() => {
        const today = startOfToday();
        const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));
        setAvailableDates(dates);
    }, []);

    // Carregar horários ocupados quando a data muda
    useEffect(() => {
        async function fetchBusySlots() {
            if (!localSelectedDate) return;

            try {
                setIsLoading(true);
                const response = await fetch(`/api/reservations/check-availability?courtId=${courtId}&date=${localSelectedDate.toISOString()}`);
                const data = await response.json();

                if (data.busySlots) {
                    // Guardar como objetos Date para comparação precisa
                    const formattedBusy = data.busySlots.map((slot: any) => ({
                        start: new Date(slot.start),
                        end: new Date(slot.end)
                    }));
                    setBusySlots(formattedBusy);
                }
            } catch (error) {
                console.error('Erro ao carregar disponibilidade:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchBusySlots();
    }, [localSelectedDate, courtId]);

    // Carregar horários disponíveis quando os horários ocupados ou data mudar
    useEffect(() => {
        if (localSelectedDate) {
            const times = [];
            const isFixed = court.reservationType === 'FIXED';
            const now = new Date();

            // Default opening hours if not provided
            const openH = openingHours ? parseInt(openingHours.open.split(':')[0]) : 6;
            const closeH = openingHours ? parseInt(openingHours.close.split(':')[0]) : 23;

            for (let hour = openH; hour < closeH; hour++) {
                // Horário :00
                const slotStart00 = new Date(localSelectedDate);
                slotStart00.setHours(hour, 0, 0, 0);

                // Bloquear horários passados
                if (slotStart00 < now) {
                    continue;
                }

                const isBusy00 = busySlots.some(busy => {
                    return slotStart00 >= busy.start && slotStart00 < busy.end;
                });

                if (!isBusy00) {
                    times.push(`${hour.toString().padStart(2, '0')}:00`);
                }
            }
            setAvailableTimes(times);
        } else {
            setAvailableTimes([]);
        }
    }, [localSelectedDate, court.reservationType, busySlots]);

    const handleDateSelect = (date: Date) => {
        setLocalSelectedDate(date);
    };

    const handleTimeSelect = (time: string) => {
        if (localSelectedDate) {
            onSelectDateTime(localSelectedDate, time, selectedDuration);
        }
    };

    const handleDurationSelect = (duration: number) => {
        if (localSelectedDate && selectedTime) {
            onSelectDateTime(localSelectedDate, selectedTime, duration);
        }
    };

    const isFixed = court.reservationType === 'FIXED';

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Data e Horário</h2>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-zinc-500">Agendamento para:</span>
                    <span className="text-white font-bold">{court.name}</span>
                </div>
            </div>

            {/* Passo 1: Selecionar o Dia */}
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-black font-bold text-sm">1</div>
                    <h3 className="text-lg font-bold text-white">Selecione o Dia</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                    {availableDates.map((date, index) => {
                        const isSelected = localSelectedDate && isSameDay(date, localSelectedDate);
                        const isTodayDate = isSameDay(date, startOfToday());

                        return (
                            <button
                                key={index}
                                onClick={() => handleDateSelect(date)}
                                className={`relative p-4 rounded-2xl border-2 transition-all duration-200 ${isSelected
                                    ? 'border-accent-500 bg-accent-500/10 shadow-[0_0_20px_rgba(204,255,0,0.2)]'
                                    : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-black/60'
                                    }`}
                            >
                                {isTodayDate && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent-500 text-black text-[9px] font-black rounded-full uppercase tracking-tighter">
                                        HOJE
                                    </span>
                                )}

                                <div className="text-center">
                                    <p className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-accent-500' : 'text-zinc-500'}`}>
                                        {format(date, 'EEE', { locale: ptBR })}
                                    </p>
                                    <p className={`text-xl font-black ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                                        {format(date, 'd', { locale: ptBR })}
                                    </p>
                                    <p className={`text-[10px] uppercase font-bold mt-1 ${isSelected ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                        {format(date, 'MMM', { locale: ptBR })}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Passo 2: Selecionar o Horário e Duração */}
            {localSelectedDate && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className={`bg-white/5 p-6 rounded-3xl border border-white/10 transition-all ${selectedTime ? 'border-accent-500/30' : ''}`}>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-black font-bold text-sm">2</div>
                            <h3 className="text-lg font-bold text-white">Selecione o Horário de Início</h3>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-11 rounded-xl bg-white/5 animate-pulse" />
                                ))
                            ) : availableTimes.length > 0 ? (
                                availableTimes.map((time) => {
                                    const isSelected = selectedTime === time;

                                    return (
                                        <button
                                            key={time}
                                            onClick={() => handleTimeSelect(time)}
                                            className={`py-3 px-4 rounded-xl border-2 font-bold text-sm transition-all duration-200 ${isSelected
                                                ? 'border-accent-500 bg-accent-500 text-black shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                                                : 'border-white/5 bg-black/40 text-white hover:border-white/20 hover:bg-black/60'
                                                }`}
                                        >
                                            {time}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="col-span-full py-8 text-center bg-black/20 rounded-2xl border border-white/5">
                                    <p className="text-zinc-500 text-sm">Não há horários disponíveis para este dia.</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {selectedTime && (
                        <div className="bg-white/5 p-6 rounded-3xl border border-accent-500/30 shadow-[0_0_30px_rgba(204,255,0,0.1)] animate-in fade-in zoom-in-95 duration-500">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center text-black font-bold text-sm">3</div>
                                <h3 className="text-lg font-bold text-white">Quanto tempo você vai jogar?</h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((h) => {
                                    // Verificar se esta duração causaria overlap com o próximo horário reservado
                                    const [startH, startM] = selectedTime.split(':').map(Number);

                                    const currentRequestStart = new Date(localSelectedDate!);
                                    currentRequestStart.setHours(startH, startM, 0, 0);

                                    const currentRequestEnd = new Date(currentRequestStart);
                                    currentRequestEnd.setHours(currentRequestEnd.getHours() + h);

                                    // Validar se passa do horário de fechamento
                                    if (openingHours) {
                                        const [closeH, closeM] = openingHours.close.split(':').map(Number);
                                        const businessEnd = new Date(currentRequestStart);
                                        businessEnd.setHours(closeH, closeM, 0, 0);

                                        if (currentRequestEnd > businessEnd) return null;
                                    }

                                    const wouldOverlap = busySlots.some(busy => {
                                        // Se a reserva ocupada começa DEPOIS do nosso início, 
                                        // ela não deve começar ANTES do nosso fim pretendido.
                                        return busy.start >= currentRequestStart && busy.start < currentRequestEnd;
                                    });

                                    if (wouldOverlap) return null;

                                    return (
                                        <button
                                            key={h}
                                            onClick={() => handleDurationSelect(h)}
                                            className={`group relative py-4 px-6 rounded-2xl border-2 transition-all duration-300 ${selectedDuration === h
                                                ? 'border-accent-500 bg-accent-500 text-black shadow-[0_0_20px_rgba(204,255,0,0.2)] scale-[1.05]'
                                                : 'border-white/5 bg-black/40 text-white hover:border-white/20 hover:bg-black/60'
                                                }`}
                                        >
                                            <div className="text-center">
                                                <p className="text-2xl font-black mb-1">{h}</p>
                                                <p className={`text-[10px] font-bold uppercase ${selectedDuration === h ? 'text-black/60' : 'text-zinc-500'}`}>
                                                    {h === 1 ? 'Hora' : 'Horas'}
                                                </p>
                                            </div>
                                            {selectedDuration === h && (
                                                <div className="absolute -top-2 -right-2 bg-black text-accent-500 border border-accent-500 rounded-full p-1 shadow-lg">
                                                    <Timer size={12} />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>


                            <div className="mt-8 p-5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500">
                                        <Timer size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Resumo do tempo</p>
                                        <p className="text-white font-bold">Início: <span className="text-accent-500">{selectedTime}</span> • Fim: <span className="text-accent-500">{
                                            (() => {
                                                const [h, m] = selectedTime.split(':').map(Number);
                                                const endH = (h + selectedDuration) % 24;
                                                return `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                                            })()
                                        }</span></p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Valor Total</p>
                                    <p className="text-2xl font-black text-white">R$ {(court.hourlyRate * selectedDuration).toFixed(2).replace('.', ',')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            )}

            {!localSelectedDate && (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 border-dashed">
                    <Calendar size={48} className="mx-auto mb-4 text-zinc-700" />
                    <h3 className="text-white font-bold text-lg">Selecione uma data acima</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto mt-2">Os horários disponíveis aparecerão assim que você escolher um dia para seu jogo.</p>
                </div>
            )}
        </div>
    );
}
