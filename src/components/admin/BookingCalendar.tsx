"use client";

import { useState, useMemo, useTransition, useRef, useEffect } from "react";
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    isToday,
    addWeeks,
    subWeeks,
    parseISO,
    setHours,
    setMinutes,
    startOfDay,
    isValid,
    startOfMonth,
    endOfMonth,
    isWithinInterval
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Calendar as CalendarIcon, Filter, Download, CheckCircle2, MessageCircle } from "lucide-react";
import { Booking as DBBooking, Court } from "@/types";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { createBookingAction, endReservationAction, sendBookingNotificationAction } from "@/app/actions";
import { useToast } from "@/components/ui/Toast";

interface BookingCalendarProps {
    initialBookings: DBBooking[];
    courts: Court[];
    tenantSlug: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i); // 00:00 to 23:00

export function BookingCalendar({ initialBookings, courts, tenantSlug }: BookingCalendarProps) {
    const { showToast } = useToast();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isPending, startTransition] = useTransition();
    const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'pending'>('all');
    const [isSendingNotification, setIsSendingNotification] = useState(false);

    // Form State
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date, hour: number } | null>(null);
    const [formData, setFormData] = useState({
        customerName: "",
        courtId: courts[0]?.id || "",
        startTime: "",
        endTime: "",
        totalAmount: 0
    });

    const startDate = startOfWeek(currentDate, { weekStartsOn: 0 });
    const endDate = endOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: startDate, end: endDate });

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = parseISO(e.target.value);
        if (isValid(date)) {
            setCurrentDate(date);
        }
    };

    // Filter toggle handlers
    const toggleFilter = (status: 'confirmed' | 'pending') => {
        if (filterStatus === status) {
            setFilterStatus('all');
        } else {
            setFilterStatus(status);
        }
    };

    // Process DB Bookings for display
    const displayBookings = useMemo(() => {
        let filtered = initialBookings;

        if (filterStatus === 'confirmed') {
            filtered = filtered.filter(b => b.status === 'confirmed');
        } else if (filterStatus === 'pending') {
            filtered = filtered.filter(b => b.status === 'pending_payment');
        }

        return filtered.map(b => ({
            ...b,
            dateObj: parseISO(b.startTime),
            startHour: parseISO(b.startTime).getHours(),
            court: courts.find(c => c.id === b.courtId),
            courtName: courts.find(c => c.id === b.courtId)?.name || "Quadra Desconhecida"
        }));
    }, [initialBookings, courts, filterStatus]);

    const getBookingsForCell = (day: Date, hour: number) => {
        return displayBookings.filter(b =>
            isSameDay(b.dateObj, day) && b.startHour === hour
        );
    };

    const handleSlotClick = (day: Date, hour: number) => {
        const slotDate = setMinutes(setHours(day, hour), 0);
        setSelectedSlot({ date: day, hour });
        setFormData({
            ...formData,
            startTime: format(slotDate, "HH:mm"),
            endTime: format(setHours(slotDate, hour + 1), "HH:mm"),
            customerName: "",
            courtId: courts[0]?.id || ""
        });
        setIsCreateOpen(true);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;

        const dateStr = format(selectedSlot.date, "yyyy-MM-dd");
        const startISO = new Date(`${dateStr}T${formData.startTime}:00`).toISOString();
        const endISO = new Date(`${dateStr}T${formData.endTime}:00`).toISOString();
        const court = courts.find(c => c.id === formData.courtId);

        const payload = {
            customerName: formData.customerName,
            courtId: formData.courtId,
            startTime: startISO,
            endTime: endISO,
            totalAmount: court?.hourlyRate || 0
        };

        startTransition(async () => {
            const result = await createBookingAction(tenantSlug, payload);
            if (result.success) {
                showToast("Reserva criada com sucesso!", "success");
                setIsCreateOpen(false);
            } else {
                showToast(result.error || "Erro ao criar reserva", "error");
            }
        });
    };

    const handleEndReservation = async (reservationId: string) => {
        if (!confirm("Deseja encerrar esta reserva e liberar a quadra?")) return;

        startTransition(async () => {
            const result = await endReservationAction(tenantSlug, reservationId);
            if (result.success) {
                showToast("Reserva encerrada com sucesso!", "success");
                setIsDetailsOpen(false);
            } else {
                showToast(result.error || "Erro ao encerrar reserva", "error");
            }
        });
    };

    const handleSendNotification = async (reservationId: string) => {
        if (!confirm("Enviar confirmação por WhatsApp para o cliente?")) return;

        setIsSendingNotification(true);
        try {
            const result = await sendBookingNotificationAction(tenantSlug, reservationId);
            if (result.success) {
                showToast("Notificação enviada com sucesso!", "success");
            } else {
                showToast(result.error || "Erro ao enviar notificação", "error");
            }
        } catch (error) {
            showToast("Erro ao tentar enviar notificação", "error");
        } finally {
            setIsSendingNotification(false);
        }
    };

    const handleExport = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);

        const monthlyBookings = initialBookings.filter(b => {
            const bookingDate = parseISO(b.startTime);
            return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd });
        });

        const csvContent = [
            ["ID", "Cliente", "Quadra", "Data", "Inicio", "Fim", "Valor", "Status"],
            ...monthlyBookings.map(b => [
                b.id,
                b.customerName,
                courts.find(c => c.id === b.courtId)?.name || "N/A",
                format(parseISO(b.startTime), 'dd/MM/yyyy'),
                format(parseISO(b.startTime), 'HH:mm'),
                format(parseISO(b.endTime), 'HH:mm'),
                b.totalPrice.toString(),
                b.status
            ])
        ].map(e => e.join(",")).join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `agendamentos_${format(currentDate, 'MM_yyyy')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const navButtonClass = "p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors";

    return (
        <div className="flex flex-col h-[600px] sm:h-[700px] bg-zinc-900/40 border border-white/5 rounded-3xl backdrop-blur-sm overflow-hidden relative">
            {/* Calendar Header */}
            <div className="flex flex-col px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-zinc-900/40 backdrop-blur-md z-50 gap-3">
                {/* Row 1: month + navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer flex items-center gap-2">
                            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight capitalize group-hover:text-accent-500 transition-colors">
                                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                            </h2>
                            <CalendarIcon size={16} className="text-zinc-500 group-hover:text-accent-500 transition-colors" />
                            <input
                                type="date"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                onChange={handleDateSelect}
                                value={format(currentDate, "yyyy-MM-dd")}
                            />
                        </div>

                        <div className="flex items-center bg-black/20 rounded-lg p-1 border border-white/5">
                            <button onClick={prevWeek} className={navButtonClass}>
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={goToToday} className="px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors">
                                Hoje
                            </button>
                            <button onClick={nextWeek} className={navButtonClass}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Export — desktop only in header, always accessible */}
                    <button
                        onClick={handleExport}
                        title="Exportar CSV do mês"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-white transition-colors text-xs"
                    >
                        <Download size={14} />
                        <span className="hidden sm:inline font-medium">Exportar</span>
                    </button>
                </div>

                {/* Row 2: status filters */}
                <div className="flex items-center gap-2 sm:gap-4 text-xs select-none">
                    <div className="w-px h-4 bg-white/10 hidden sm:block" />
                    <div
                        onClick={() => toggleFilter('confirmed')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border cursor-pointer transition-all ${filterStatus === 'confirmed' || filterStatus === 'all'
                            ? 'bg-emerald-500/10 border-emerald-500/20 opacity-100'
                            : 'bg-transparent border-transparent opacity-40 hover:opacity-70'
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"></span>
                        <span className={`font-medium ${filterStatus === 'confirmed' || filterStatus === 'all' ? 'text-zinc-200' : 'text-zinc-500'}`}>Confirmado</span>
                    </div>
                    <div
                        onClick={() => toggleFilter('pending')}
                        className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border cursor-pointer transition-all ${filterStatus === 'pending' || filterStatus === 'all'
                            ? 'bg-indigo-500/10 border-indigo-500/20 opacity-100'
                            : 'bg-transparent border-transparent opacity-40 hover:opacity-70'
                            }`}
                    >
                        <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                        <span className={`font-medium ${filterStatus === 'pending' || filterStatus === 'all' ? 'text-zinc-200' : 'text-zinc-500'}`}>Pendente</span>
                    </div>
                </div>
            </div>

            {/* Scrollable Container with Sticky Headers */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <div className="min-w-max flex flex-col">

                    {/* Sticky Day Header */}
                    <div className="flex min-w-max sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-md border-b border-white/5 shadow-sm">
                        {/* Sticky Corner for Time Column */}
                        <div className="sticky left-0 z-50 w-16 flex-shrink-0 border-r border-white/5 bg-zinc-900/95 backdrop-blur-md"></div>

                        {/* Days */}
                        <div className="flex flex-1">
                            {weekDays.map((day, i) => {
                                const isTodayDate = isToday(day);
                                return (
                                    <div key={i} className={`flex-1 min-w-[120px] py-4 text-center border-r border-white/5 last:border-r-0 ${isTodayDate ? 'bg-white/5' : ''}`}>
                                        <p className={`text-xs uppercase font-bold mb-1 ${isTodayDate ? 'text-accent-500' : 'text-zinc-500'}`}>
                                            {format(day, 'EEE', { locale: ptBR })}
                                        </p>
                                        <div className={`mx-auto w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${isTodayDate ? 'bg-accent-500 text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]' : 'text-zinc-300'
                                            }`}>
                                            {format(day, 'd')}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Grid Body */}
                    <div className="flex min-w-max relative flex-1">

                        {/* Sticky Time Column */}
                        <div className="sticky left-0 z-30 w-16 flex-shrink-0 border-r border-white/5 bg-black/20 flex flex-col text-xs text-zinc-500 font-medium text-right pr-3 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
                            {HOURS.map(hour => (
                                <div key={hour} className="h-[60px] flex items-start justify-end pt-2">
                                    {hour}:00
                                </div>
                            ))}
                        </div>

                        {/* Booking Slots Grid */}
                        <div className="flex-1 relative min-w-[840px]">
                            {/* Horizontal Guide Lines */}
                            <div className="absolute inset-0 z-0 pointer-events-none flex flex-col">
                                {HOURS.map(h => (
                                    <div key={h} className="h-[60px] border-b border-white/5 w-full"></div>
                                ))}
                            </div>

                            {/* Columns */}
                            <div className="flex z-10 relative">
                                {weekDays.map((day, dayIndex) => (
                                    <div key={dayIndex} className="flex-1 min-w-[120px] border-r border-white/5 last:border-r-0 relative hover:bg-white/[0.02] transition-colors group">
                                        {/* Clickable Slots & Rendered Bookings */}
                                        {HOURS.map((hour) => {
                                            const cellBookings = getBookingsForCell(day, hour);
                                            return (
                                                <div key={hour} className="contents">
                                                    {/* Empty Slot Handler */}
                                                    <div
                                                        className="absolute w-full h-[60px] z-0 hover:bg-accent-500/5 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                                                        style={{ top: `${hour * 60}px` }}
                                                        onClick={() => handleSlotClick(day, hour)}
                                                    >
                                                        <Plus size={16} className="text-accent-500" />
                                                    </div>

                                                    {/* Bookings */}
                                                    {cellBookings.map(booking => (
                                                        <div
                                                            key={booking.id}
                                                            className={`absolute m-1 left-0 right-0 p-2 rounded-lg border text-xs cursor-pointer hover:brightness-110 transition-all z-20 overflow-hidden shadow-lg border-l-4
                                                                ${booking.status === 'confirmed'
                                                                    ? 'bg-emerald-500/10 border-emerald-500/20 border-l-emerald-500 text-emerald-400'
                                                                    : booking.status === 'pending_payment'
                                                                        ? 'bg-indigo-500/10 border-indigo-500/20 border-l-indigo-500 text-indigo-400'
                                                                        : booking.status === 'completed'
                                                                            ? 'bg-zinc-500/10 border-zinc-500/20 border-l-zinc-500 text-zinc-400'
                                                                            : 'bg-red-500/10 border-red-500/20 border-l-red-500 text-red-400'
                                                                }
                                                            `}
                                                            style={{
                                                                top: `${hour * 60}px`,
                                                                height: '52px'
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedBooking(booking);
                                                                setIsDetailsOpen(true);
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-1 font-bold mb-0.5">
                                                                <span className="truncate flex-1">{booking.courtName}</span>
                                                            </div>
                                                            <div className="text-[10px] opacity-80 truncate">
                                                                {booking.customerName}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Details Dialog */}
            <Dialog isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} title="Detalhes da Reserva">
                {selectedBooking && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Cliente</p>
                                <p className="text-white font-semibold">{selectedBooking.customerName}</p>
                            </div>
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                <p className="text-xs text-zinc-500 uppercase font-bold mb-1">Quadra</p>
                                <p className="text-white font-semibold">{selectedBooking.courtName}</p>
                            </div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2">
                            <p className="text-xs text-zinc-500 uppercase font-bold">Horário</p>
                            <p className="text-white font-semibold">
                                {format(parseISO(selectedBooking.startTime), "HH:mm")} às {format(parseISO(selectedBooking.endTime), "HH:mm")}
                            </p>
                            <p className="text-[10px] text-zinc-500">
                                {format(parseISO(selectedBooking.startTime), "dd 'de' MMMM", { locale: ptBR })}
                            </p>
                        </div>

                        <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5">
                            <div>
                                <p className="text-xs text-zinc-500 uppercase font-bold">Valor</p>
                                <p className="text-xl font-bold text-accent-500">
                                    R$ {(selectedBooking.totalPrice || selectedBooking.totalAmount || 0).toFixed(2).replace('.', ',')}
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedBooking.status === 'confirmed' ? 'bg-emerald-500 text-black' :
                                selectedBooking.status === 'pending_payment' ? 'bg-indigo-500 text-white' :
                                    selectedBooking.status === 'completed' ? 'bg-zinc-700 text-zinc-300' :
                                        'bg-red-500 text-white'
                                }`}>
                                {selectedBooking.status === 'confirmed' ? 'Confirmado' :
                                    selectedBooking.status === 'pending_payment' ? 'Pendente' :
                                        selectedBooking.status === 'completed' ? 'Encerrado' :
                                            'Cancelado'}
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        {selectedBooking.status === 'confirmed' && (
                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={() => handleSendNotification(selectedBooking.id)}
                                    disabled={isSendingNotification}
                                    className="w-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 border border-emerald-500/20"
                                >
                                    <MessageCircle size={20} />
                                    {isSendingNotification ? "Enviando..." : "Enviar Confirmação WhatsApp"}
                                </button>

                                <button
                                    onClick={() => handleEndReservation(selectedBooking.id)}
                                    disabled={isPending}
                                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                                >
                                    <CheckCircle2 size={20} />
                                    {isPending ? "Processando..." : "Dar Baixa (Encerrar)"}
                                </button>
                                <p className="mt-2 text-[10px] text-center text-zinc-500">
                                    Ao encerrar, a quadra ficará disponível imediatamente.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

            {/* Booking Creation Dialog */}
            <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Nova Reserva">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Cliente</label>
                        <input
                            required
                            value={formData.customerName}
                            onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                            placeholder="Nome do cliente"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white outline-none focus:border-accent-500/50 transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <Select
                            label="Quadra"
                            value={formData.courtId}
                            onChange={(value) => setFormData({ ...formData, courtId: value })}
                            options={courts.map(court => ({ label: court.name, value: court.id }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Início</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white outline-none focus:border-accent-500/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Fim</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3 text-white outline-none focus:border-accent-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-accent-500 hover:bg-accent-400 text-black font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                        >
                            {isPending ? "Criando..." : "Confirmar Reserva"}
                        </button>
                    </div>
                </form>
            </Dialog>
        </div>
    );
}
