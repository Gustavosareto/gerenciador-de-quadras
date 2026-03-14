import { IWhatsAppProvider, WhatsAppMessageRequest } from '../types';

/**
 * Adaptador para Meta Cloud API (WhatsApp Business API Oficial)
 */
export class MetaWhatsAppProvider implements IWhatsAppProvider {
  private defaultToken: string;
  private defaultPhoneId: string;

  constructor() {
    this.defaultToken = process.env.META_WHATSAPP_TOKEN || '';
    this.defaultPhoneId = process.env.META_PHONE_ID || '';
  }

  async sendTemplate(
    to: string, 
    templateName: string, 
    variables: string[],
    credentials?: { token: string; phoneNumberId: string }
  ): Promise<{ providerMessageId: string }> {
    
    const token = credentials?.token || this.defaultToken;
    const phoneId = credentials?.phoneNumberId || this.defaultPhoneId;

    if (!token || !phoneId) {
      throw new Error("WhatsApp Credentials not found");
    }

    const payload: WhatsAppMessageRequest = {
      to: to.replace(/\D/g, ''), // Remove non-digits
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: variables.map(v => ({ type: 'text', text: v }))
          }
        ]
      }
    };

    console.log(`[WhatsApp Provider] Sending to ${to} via ID ${phoneId}`, JSON.stringify(payload, null, 2));

    // Exemplo de chamada real (fetch):
    /*
    const response = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    */

    // Mock response
    return {
      providerMessageId: `wamid.${Math.random().toString(36)}`
    };
  }
}
