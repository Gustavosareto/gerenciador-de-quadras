import { Inngest } from "inngest";

// Define the events that our application will send to Inngest
export type Events = {
  "abacatepay/webhook.received": {
    data: {
      payload: any;
      webhookEventId: string;
    };
  };
  "stripe/webhook.received": {
    data: {
      type: string;
      session: any;
      subscription?: any;
    };
  };
  "emails/password-reset": {
    data: {
      email: string;
      code: string;
      expirationMinutes: number;
    };
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({ 
    id: "gerenciador-de-quadras"
});
