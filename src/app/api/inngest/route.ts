import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { processAbacatePayWebhook } from "@/lib/inngest/functions/abacatepay";
import { processStripeWebhook } from "@/lib/inngest/functions/stripe";
import { sendPasswordResetEmail } from "@/lib/inngest/functions/emails";

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processAbacatePayWebhook,
    processStripeWebhook,
    sendPasswordResetEmail
  ],
});
