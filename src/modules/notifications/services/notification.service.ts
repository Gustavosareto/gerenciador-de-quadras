import { NotificationType } from '../types';
import { MetaWhatsAppProvider } from './whatsapp.provider';

interface CreateReservationNotificationDTO {
  companyId: string;
  customerId: string;
  customerPhone: string;
  reservationId: string;
  startAt: Date;
  companyName: string;
  courtName: string;
  address: string;
  contactRawLink: string; // wa.me/55...
}

export class NotificationService {
  // Em uma implementação real, injetar filas (BullMQ) e Repositórios DB
  constructor(private provider = new MetaWhatsAppProvider()) {}

  /**
   * Gatilho PRINCIPAL: Chamado quando a reserva é paga/confirmada
   */
  async onReservationConfirmed(data: CreateReservationNotificationDTO) {
    console.log(`[Notification] Scheduling jobs for Reservation ${data.reservationId}`);

    // 1. Envio Imediato: Confirmação
    await this.scheduleJob({
      ...data,
      type: 'RESERVATION_CONFIRMED',
      scheduledAt: new Date(), // Agora
      template: 'reserva_confirmada_v1',
      variables: [
        data.companyName, 
        this.formatDate(data.startAt),
        this.formatTime(data.startAt),
        data.courtName,
        data.address,
        data.contactRawLink
      ]
    });

    // 2. Agendamento: Lembrete 24h
    const reminder24h = new Date(data.startAt.getTime() - 24 * 60 * 60 * 1000);
    if (reminder24h > new Date()) {
      await this.scheduleJob({
        ...data,
        type: 'REMINDER_24H',
        scheduledAt: reminder24h,
        template: 'lembrete_generico_v1',
        variables: [
          data.companyName,
          'Amanhã',
          this.formatTime(data.startAt),
          data.courtName
        ]
      });
    }

    // 3. Agendamento: Lembrete 2h
    const reminder2h = new Date(data.startAt.getTime() - 2 * 60 * 60 * 1000);
    if (reminder2h > new Date()) {
      await this.scheduleJob({
        ...data,
        type: 'REMINDER_2H',
        scheduledAt: reminder2h,
        template: 'lembrete_generico_v1',
        variables: [
          data.companyName,
          'Hoje',
          this.formatTime(data.startAt),
          data.courtName
        ]
      });
    }
  }

  /**
   * Gatilho: Cancelamento
   */
  async onReservationCancelled(reservationId: string) {
    // 1. DB Update: UPDATE notification_jobs SET status = 'CANCELED' WHERE reservation_id = X AND status = 'SCHEDULED'
    console.log(`[Notification] Canceling pending pending jobs for ${reservationId}`);
    
    // 2. Opcional: Enviar mensagem de cancelamento
  }

  // --- Helpers Internos ---

  private async scheduleJob(jobData: any) {
    // 1. Salvar no DB status = SCHEDULED
    // const job = await db.notificationJobs.create(...)
    
    // 2. Adicionar na fila do Redis com delay
    // const delay = jobData.scheduledAt.getTime() - Date.now();
    // await notificationQueue.add('send-whatsapp', { jobId: job.id }, { delay });
    
    console.log(`Job scheduled: ${jobData.type} at ${jobData.scheduledAt.toISOString()}`);
  }

  private formatDate(date: Date) {
    return date.toLocaleDateString('pt-BR');
  }

  private formatTime(date: Date) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}
