import { notFound } from "next/navigation";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Star, MapPin, Clock, ArrowRight } from "lucide-react";
import ScrollFloat from "@/components/ui/ScrollFloat";
import Link from "next/link";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tenantSlug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
    select: { name: true, address: true }
  });

  if (!company) {
    return {
      title: "Quadra não encontrada | Agendouu",
    };
  }

  // Extrair cidade do endereço (assumindo formato básico, ex: "Rua X, Cidade - Estado")
  // Se não encontrar, mostra genérico
  const locationText = company.address ? `em ${company.address.split(',').pop()?.trim()}` : '';

  return {
    title: `Alugar Quadras de Esporte no(a) ${company.name} ${locationText} | Agendouu`,
    description: `Procurando quadras na arena ${company.name}? Compare preços, horários disponíveis e reserve online com rapidez através do Agendouu. Clique e garanta seu jogo!`,
  }
}

export default async function TenantHome({ params }: PageProps) {
  const { tenantSlug } = await params;

  // 1. Fetch Current Company
  const currentCompany = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!currentCompany) {
    notFound();
  }

  // 2. Fetch Courts from ALL companies owned by the same Owner (if owner exists)
  // This allows showing multiple units (locations) in a single list
  let courtsWhereInput: any = {
    companyId: currentCompany.id,
    isActive: true,
  };

  if (currentCompany.ownerId) {
    const ownersCompanies = await prisma.company.findMany({
      where: { ownerId: currentCompany.ownerId },
      select: { id: true },
    });
    const companyIds = ownersCompanies.map((c) => c.id);

    courtsWhereInput = {
      companyId: { in: companyIds },
      isActive: true,
    };
  }

  const dbCourts = await prisma.court.findMany({
    where: courtsWhereInput,
    include: {
      company: true,
    },
  });

  const courts = dbCourts.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type.toLowerCase(),
    image: c.image,
    images: (c as any).images || [],
    hourlyRate: Number(c.hourlyRate),
    // Address Priority: Court Custom Address > Company Address > Fallback
    address: c.customAddress || c.company.address || "Endereço não informado",
    tenantSlug: c.company.slug || "",
    tenantName: c.company.name,
  }));

  const tenant = {
    id: currentCompany.id,
    name: currentCompany.name,
    slug: currentCompany.slug || "",
    address: currentCompany.address,
    logo: currentCompany.logo, // Added logo support
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar type="tenant" tenantName={tenant.name} />
      
      {/* JSON-LD Schema for the Court Domain */}
      <LocalBusinessSchema
        name={tenant.name}
        description={`Centro esportivo e aluguel de quadras. Venha jogar no ${tenant.name}!`}
        url={`https://agendouu.com/${tenant.slug}`}
        image={tenant.logo || undefined}
        address={tenant.address || undefined}
        priceRange="$$"
      />

      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
        <div className="absolute inset-0 bg-accent-500/5 z-0" />

        <div className="z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          {/* Logo Display */}
          {tenant.logo && (
            <div className="mb-8 relative w-32 h-32 md:w-40 md:h-40">
              <div className="absolute inset-0 bg-accent-500 rounded-full blur-2xl opacity-20 animate-pulse-glow"></div>
              <img
                src={tenant.logo}
                alt={`${tenant.name} Logo`}
                className="relative w-full h-full object-contain drop-shadow-2xl"
              />
            </div>
          )}

          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.03}
            containerClassName="!my-0"
            textClassName="text-5xl md:text-7xl font-bold mb-6 tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400 uppercase italic"
          >
            {tenant.name}
          </ScrollFloat>

          <div className="flex items-center justify-center gap-2 text-sm text-accent-500 font-medium bg-accent-500/10 px-4 py-2 rounded-full w-fit mx-auto border border-accent-500/20">
            <MapPin size={16} />{" "}
            <span>{tenant.address || "Endereço não informado"}</span>
          </div>
        </div>
      </div>

      {/* Courts Grid */}
      <section className="container mx-auto px-4 py-20 relative z-20 -mt-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="text-accent-500 fill-accent-500" size={20} />
            Quadras Disponíveis
          </h2>
          {courts.length > 0 && (
            <span className="text-sm text-zinc-500">
              {courts.length}{" "}
              {courts.length === 1
                ? "quadra encontrada"
                : "quadras encontradas"}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courts.map((court) => (
            <Card
              key={court.id}
              className="group overflow-hidden border-white/10 bg-zinc-900/40 hover:border-accent-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(204,255,0,0.1)]"
            >
              <div className="relative h-64 w-full bg-zinc-800">
                {/* Image Placeholder or Next/Image */}
                {court.images && court.images.length > 0 ? (
                  <div className="w-full h-full flex snap-x snap-mandatory overflow-x-auto scrollbar-none pointer-events-auto">
                    {court.images.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="w-full h-full flex-shrink-0 snap-center relative group-hover:scale-[1.02] transition-transform duration-500"
                      >
                        <img
                          src={img}
                          alt={`${court.name} - Imagem ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {court.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase border border-white/10 z-10">
                            {idx + 1}/{court.images.length}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : court.image ? (
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 space-y-2 pointer-events-none">
                    <div className="p-4 rounded-full bg-white/5">
                      <Star size={24} />
                    </div>
                    <span className="text-sm font-medium">Sem Foto</span>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white uppercase border border-white/10 pointer-events-none">
                  {court.type}
                </div>

                {/* Unit/Tenant Badge if separate units */}
                {court.tenantSlug !== tenantSlug && (
                  <div className="absolute top-4 left-4 bg-accent-500/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-black uppercase shadow-lg pointer-events-none">
                    Outra Unidade
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-1 text-white group-hover:text-accent-500 transition-colors uppercase italic tracking-tight">
                  {court.name}
                </h3>

                {/* Address Display */}
                <div className="flex items-start gap-2 text-xs text-zinc-400 mb-4 h-8 overflow-hidden">
                  <MapPin
                    size={14}
                    className="mt-0.5 flex-shrink-0 text-accent-500"
                  />
                  <span className="line-clamp-2">{court.address}</span>
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
                      Valor Hora
                    </span>
                    <span className="text-xl font-bold text-white">
                      R$ {court.hourlyRate.toFixed(2)}
                    </span>
                  </div>
                  <Link href={`/${court.tenantSlug}/book/${court.id}`}>
                    <Button className="gap-2 bg-accent-500 text-black hover:bg-accent-400 font-bold">
                      Reservar <ArrowRight size={16} />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
