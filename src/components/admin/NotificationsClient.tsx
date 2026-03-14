'use client';

import { useState, useMemo } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Search,
  RefreshCw,
  Send,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

export interface Notification {
  id: string;
  type: 'RESERVATION_CONFIRMED' | 'PAYMENT_CONFIRMED' | 'REMINDER_24H' | 'RESERVATION_CANCELED' | 'PAYMENT_PENDING';
  status: 'SENT' | 'DELIVERED' | 'READ' | 'SCHEDULED' | 'PROCESSING' | 'FAILED' | 'CANCELED';
  scheduledAt: Date;
  title: string;
  message: string;
  reservationId: string;
  customerName?: string;
  customerPhone?: string;
}

interface NotificationsClientProps {
  initialNotifications: Notification[];
}

export default function NotificationsClient({ initialNotifications }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const matchesSearch =
        notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notif.reservationId.includes(searchQuery) ||
        notif.customerName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = filterStatus === 'all' || notif.status === filterStatus;
      const matchesType = filterType === 'all' || notif.type === filterType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [notifications, searchQuery, filterStatus, filterType]);

  const stats = useMemo(() => {
    const total = notifications.length;
    const sent = notifications.filter(n => n.status === 'SENT' || n.status === 'DELIVERED' || n.status === 'READ').length;
    const scheduled = notifications.filter(n => n.status === 'SCHEDULED' || n.status === 'PROCESSING').length;
    const failed = notifications.filter(n => n.status === 'FAILED').length;

    return { total, sent, scheduled, failed };
  }, [notifications]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleRetry = (notifId: string) => {
    setNotifications(notifications.map(n =>
      n.id === notifId ? { ...n, status: 'PROCESSING' as const } : n
    ));

    setTimeout(() => {
      setNotifications(notifications.map(n =>
        n.id === notifId ? { ...n, status: 'SENT' as const } : n
      ));
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
      case 'DELIVERED':
      case 'READ':
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'SCHEDULED':
      case 'PROCESSING':
        return <Clock size={16} className="text-amber-500" />;
      case 'FAILED':
      case 'CANCELED':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Bell size={16} className="text-zinc-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'SENT': 'Enviado',
      'DELIVERED': 'Entregue',
      'READ': 'Lido',
      'SCHEDULED': 'Agendado',
      'PROCESSING': 'Enviando...',
      'FAILED': 'Falhou',
      'CANCELED': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'RESERVATION_CONFIRMED': 'Reserva Confirmada',
      'PAYMENT_CONFIRMED': 'Pagamento Confirmado',
      'REMINDER_24H': 'Lembrete 24h',
      'RESERVATION_CANCELED': 'Reserva Cancelada',
      'PAYMENT_PENDING': 'Pagamento Pendente'
    };
    return labels[type] || type.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1">Central de Notificações</h1>
          <p className="text-zinc-400 text-sm">Histórico de mensagens via WhatsApp.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Serviço Ativo</span>
        </div>
      </div>

      {/* Estatísticas — Grid responsivo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Bell, bg: 'bg-blue-500/10', color: 'text-blue-400' },
          { label: 'Enviados', value: stats.sent, icon: CheckCircle2, bg: 'bg-emerald-500/10', color: 'text-emerald-400' },
          { label: 'Agendados', value: stats.scheduled, icon: Clock, bg: 'bg-amber-500/10', color: 'text-amber-400' },
          { label: 'Falharam', value: stats.failed, icon: XCircle, bg: 'bg-red-500/10', color: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="p-4 sm:p-6 rounded-2xl bg-zinc-900/40 border border-white/5 flex items-center gap-3 sm:gap-4 transition-all hover:bg-zinc-900/60">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
              <s.icon size={20} className={s.color} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-wider mb-0.5">{s.label}</p>
              <p className="text-xl sm:text-2xl font-black text-white leading-none">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros — Stack em mobile */}
      <div className="p-4 sm:p-6 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm relative z-20">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, reserva, cliente..."
              className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div className="sm:col-span-2">
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                options={[
                  { label: 'Todos Status', value: 'all' },
                  { label: 'Enviados', value: 'SENT' },
                  { label: 'Lidos', value: 'READ' },
                  { label: 'Agendados', value: 'SCHEDULED' },
                  { label: 'Falharam', value: 'FAILED' }
                ]}
              />
            </div>
            <div className="sm:col-span-3">
              <Select
                value={filterType}
                onChange={setFilterType}
                options={[
                  { label: 'Todos Tipos', value: 'all' },
                  { label: 'Reserva Confirmada', value: 'RESERVATION_CONFIRMED' },
                  { label: 'Lembrete 24h', value: 'REMINDER_24H' },
                  { label: 'Reserva Cancelada', value: 'RESERVATION_CANCELED' }
                ]}
              />
            </div>
            <div className="sm:col-span-1">
              <Button
                variant="outline"
                onClick={handleRefresh}
                className="w-full h-full flex items-center justify-center"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Notificações */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 sm:p-6">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-zinc-700" />
              </div>
              <p className="text-zinc-400 mb-2 font-medium">Nenhuma notificação encontrada</p>
              <p className="text-xs text-zinc-600">Combine filtros diferentes para mais resultados</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 sm:p-6 rounded-2xl bg-black/20 border border-white/5 hover:border-accent-500/20 transition-all group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {/* Header Mobile: Title + Date + Status Icon */}
                    <div className="w-full flex items-start justify-between sm:hidden mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-zinc-900 rounded-lg">
                          <MessageCircle size={16} className="text-accent-500" />
                        </div>
                        <span className="text-[10px] text-zinc-500 font-medium">
                          {format(notif.scheduledAt, "dd/MM, HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <div className="p-1.5 bg-zinc-900 rounded-full border border-white/5">
                        {getStatusIcon(notif.status)}
                      </div>
                    </div>

                    {/* Left: Icon (Desktop) */}
                    <div className="hidden sm:block p-3 rounded-xl bg-zinc-900 border border-white/5 group-hover:border-accent-500/30 transition-colors">
                      <MessageCircle size={20} className="text-zinc-400 group-hover:text-accent-500" />
                    </div>

                    {/* Center: Message Body */}
                    <div className="flex-1 min-w-0">
                      <div className="hidden sm:flex items-center justify-between mb-2">
                        <h4 className="text-base font-bold text-white truncate max-w-[70%]">{notif.title}</h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                            {format(notif.scheduledAt, "dd 'de' MMM, HH:mm", { locale: ptBR })}
                          </span>
                          <div className="p-1 px-2.5 bg-zinc-900 rounded-full border border-white/5 flex items-center gap-2">
                            {getStatusIcon(notif.status)}
                            <span className="text-[10px] uppercase font-black text-zinc-400 tracking-wider">
                              {getStatusLabel(notif.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <h4 className="sm:hidden text-sm font-bold text-white mb-2 leading-tight">{notif.title}</h4>

                      <p className="text-sm text-zinc-400 leading-relaxed mb-4 sm:mb-3">
                        {notif.message}
                      </p>

                      {/* Info Chips */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-0">
                        <div className="px-2 py-1 rounded bg-zinc-900/80 border border-white/5 font-mono text-[9px] text-zinc-600">
                          #{notif.reservationId}
                        </div>
                        <div className="px-2 py-1 rounded bg-accent-500/5 border border-accent-500/10 text-[9px] font-bold text-zinc-500 uppercase tracking-tighter">
                          {getTypeLabel(notif.type)}
                        </div>
                        {notif.customerName && (
                          <div className="px-2 py-1 rounded bg-black/40 text-[9px] text-zinc-500 italic">
                            {notif.customerName}
                          </div>
                        )}
                        {notif.customerPhone && (
                          <div className="px-2 py-1 rounded bg-black/40 text-[9px] text-zinc-500 font-mono">
                            {notif.customerPhone}
                          </div>
                        )}
                      </div>

                      {/* Footer Mobile: Buttons */}
                      <div className="flex sm:hidden items-center justify-between pt-4 border-t border-white/5">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${notif.status === 'FAILED' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                          {getStatusLabel(notif.status)}
                        </span>
                        {notif.status === 'FAILED' && (
                          <Button
                            onClick={() => handleRetry(notif.id)}
                            className="h-8 px-3 text-[10px] font-bold"
                          >
                            <Send size={10} className="mr-1.5" /> Reenviar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions (Desktop) */}
                    <div className="hidden sm:block">
                      {notif.status === 'FAILED' && (
                        <Button
                          onClick={() => handleRetry(notif.id)}
                          variant="outline"
                          className="text-xs bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                        >
                          <Send size={14} className="mr-2" /> Reenviar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {filteredNotifications.length > 0 && (
          <div className="p-4 border-t border-white/5 bg-white/[0.02]">
            <button className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-zinc-500 hover:text-white transition-all">
              <RefreshCw size={14} /> CARREGAR MAIS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
