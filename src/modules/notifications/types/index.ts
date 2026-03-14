export type NotificationType = 
  | 'RESERVATION_CONFIRMED'
  | 'PAYMENT_CONFIRMED'
  | 'REMINDER_24H'
  | 'REMINDER_2H'
  | 'RESERVATION_CANCELED'
  | 'RESERVATION_RESCHEDULED';

export type JobStatus = 
  | 'SCHEDULED'
  | 'PROCESSING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'CANCELED';

export interface NotificationJob {
  id: string;
  companyId: string;
  reservationId: string;
  type: NotificationType;
  channel: 'WHATSAPP';
  templateName: string;
  variables: string[]; // Array posicional para WhatsApp Templates
  scheduledAt: Date;
  status: JobStatus;
}

export interface WhatsAppMessageRequest {
  to: string; // E.164 phone number
  type: 'template';
  template: {
    name: string;
    language: { code: string };
    components: Array<{
      type: 'body';
      parameters: Array<{
        type: 'text';
        text: string;
      }>;
    }>;
  };
}

export interface IWhatsAppProvider {
  sendTemplate(
    to: string, 
    templateName: string, 
    variables: string[],
    credentials?: { token: string; phoneNumberId: string }
  ): Promise<{ providerMessageId: string }>;
}
