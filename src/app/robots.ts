import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', // Protege lógicas internas
        '/*/*/admin/', // Protege painéis de admin específicos dos Inquilinos de indexação acidental
        '/my-bookings/', // Histórico de quem tá logado (conteúdo fechado)
        '/reset-password',
      ],
    },
    sitemap: 'https://agendouu.com/sitemap.xml',
  };
}