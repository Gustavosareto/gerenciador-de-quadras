import { MetaWhatsAppProvider } from '../services/whatsapp.provider';

// Exemplo Simbólico de Worker (BullMQ Processor)
export const notificationWorkerHandler = async (job: any) => {
  const { jobId } = job.data;

  // 1. Buscar Job no DB
  // const notificationJob = await db.notificationJobs.findById(jobId);
  
  // MOCK DATA
  const notificationJob = {
    id: jobId,
    status: 'SCHEDULED',
    variables: ['Arena X', '20/10', '10:00', 'Quadra 1'],
    templateName: 'booking_confirmation_v1',
    customerPhone: '5511999999999',
    reservationId: 'res-123',
    companyId: 'comp-123'
  };

  // 2. Validações de Integridade (Race Conditions)
  if (notificationJob.status !== 'SCHEDULED') {
    return; // Já foi processado ou cancelado
  }

  // 3. Determinar Sender (Shared vs Pro)
  // const settings = await db.companySettings.findByCompany(notificationJob.companyId);
  const credentials = undefined;

  // 4. Enviar
  const provider = new MetaWhatsAppProvider();
  
  try {
    await provider.sendTemplate(
      notificationJob.customerPhone,
      notificationJob.templateName,
      notificationJob.variables,
      credentials
    );

    // 5. Sucesso

  } catch (error: any) {
    console.error(`[Worker] Job ${jobId} FAILED`, error);
    // Atualiza DB com erro
    // BullMQ fará retry se lançarmos erro aqui
    throw error;
  }
};
