import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://agendouu.com';

  // Páginas Estáticas Básicas
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // Buscar todas as empresas ativas na plataforma para gerar rotas dinâmicas B2C
  // Aqui pegamos todos os inquilinos (tenants)
  let tenantRoutes: MetadataRoute.Sitemap = [];
  
  try {
    const companies = await prisma.company.findMany({
      where: {
        // Você pode inserir uma lógica para puxar só arenas "ativas"
      },
      select: {
        slug: true,
        updatedAt: true,
      }
    });

    tenantRoutes = companies.map((company) => ({
      url: `${baseUrl}/${company.slug}`,
      lastModified: company.updatedAt || new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    }));
  } catch (error) {
    console.error("Erro ao gerar sitemap dinâmico", error);
  }

  return [...staticRoutes, ...tenantRoutes];
}
