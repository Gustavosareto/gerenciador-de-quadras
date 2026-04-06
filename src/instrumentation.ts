import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Esse if impede que código que não seja de server rode em middlewares/edge.
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
    });
  }
}

export const onRequestError = Sentry.captureRequestError;