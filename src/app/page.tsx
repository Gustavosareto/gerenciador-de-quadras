import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import ScrollStack, { ScrollStackItem } from "@/components/ui/ScrollStack";
import SplitText from "@/components/ui/SplitText";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ScrollVelocity from "@/components/ui/ScrollVelocity";
import ScrollFloat from "@/components/ui/ScrollFloat";
import CountUp from "@/components/ui/CountUp";
import Threads from "@/components/ui/Threads";
import {
  CheckCircle2,
  Zap,
  BarChart3,
  ShieldCheck,
  XCircle,
  Clock,
  Users,
  Bell,
  Calendar,
  Star,
  ArrowRight,
  MessageSquare,
  Smartphone,
  CreditCard,
  Trophy,
} from "lucide-react";
import { PLANS } from "@/lib/plans";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden selection:bg-accent-500 selection:text-black relative bg-[#0a0a0a] text-white">
      {/* Global Background Animation - Fixed to viewport, covers entire page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Threads
          color={[0.4, 0.38, 0.38]}
          amplitude={1.2}
          distance={0.8}
          enableMouseInteraction={true}
        />
      </div>

      <Navbar type="saas" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden z-10">
        <div className="container mx-auto text-center max-w-4xl relative z-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-transparent backdrop-blur-[2px] mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse shadow-[0_0_10px_#ccff00]" />
            <h2 className="text-sm font-medium text-neutral-300 m-0 p-0">
              <SplitText text="Sistema de agendamento de quadras esportivas" delay={0} />
            </h2>
          </div>

          {/* Main Headline */}
          <div className="mb-6">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white inline-block">
              <SplitText
                text="A Plataforma Definitiva para "
                delay={40}
                startDelay={500}
              />
              <span className="text-accent-500 drop-shadow-[0_0_15px_rgba(204,255,0,0.5)] inline-block">
                <SplitText text="Jogar e Gerenciar Quadras" delay={40} startDelay={1200} />
              </span>
            </h1>
          </div>

          <h3 className="text-xl text-neutral-300 mb-10 max-w-2xl mx-auto leading-relaxed animate-[slide-up_1.2s_ease-out] font-normal">
            Alugue society online ou automatize reservas da sua Arena. Receba via PIX instantâneo e elimine o "furo" na agenda com nosso software de gestão.
          </h3>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-[slide-up_1.4s_ease-out]">
            <Link href="/register">
              <Button
                size="lg"
                className="rounded-full shadow-[0_0_20px_rgba(204,255,0,0.4)]"
              >
                Começar Grátis
              </Button>
            </Link>
            <Link href="/arena-xp"></Link>
          </div>
        </div>
      </section>

      {/* Stats/Companies with ScrollVelocity - Single Line */}
      <div className="border-y border-white/10 bg-transparent backdrop-blur-sm relative z-10 py-8">
        <ScrollVelocity
          texts={[
            "IRON GYM • ARENA XP • CLUB PRO • SPORTLIFE • FITCENTER • SMARTFIT • BLUEFIT • BODYTECH",
          ]}
          velocity={30}
          className="text-2xl md:text-4xl font-bold tracking-widest text-white/40 uppercase mx-8"
        />
      </div>

      {/* Stats Section with ScrollFloat */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <StatCard number="+500" label="Arenas Ativas" />
            <StatCard number="98%" label="Satisfação" />
            <StatCard number="2M+" label="Reservas/mês" />
            <StatCard number="24/7" label="Suporte" />
          </div>
        </div>
      </section>

      {/* Problems vs Solutions Section */}
      <section className="py-24 relative z-10" aria-label="Para Donos de Arena: Multiplique o seu Lucro">
        <div className="container mx-auto px-4">
          {/* Section Header with ScrollFloat */}
          <div className="max-w-4xl mx-auto text-center mb-20">
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="justify-center"
              textClassName="text-3xl md:text-5xl font-bold text-white as-h2"
            >
              Para Donos de Arena: Multiplique o seu Lucro
            </ScrollFloat>
            <h3 className="text-neutral-400 mt-4 text-lg font-normal mb-0">
              Calendário e Gestão 100% Automatizados. O controle da sua arena precisa ser profissional.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            {/* Pain Points */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-2">
                <XCircle /> O Caos da Gestão Manual
              </h3>

              <div className="space-y-4">
                <PainPoint text="Responder WhatsApp o dia todo para ver disponibilidade" />
                <PainPoint text="Cliente reserva e não aparece (Prejuízo)" />
                <PainPoint text="Erros de agendamento duplicado" />
                <PainPoint text="Cobrar pagamentos manualmente um por um" />
                <PainPoint text="Planilhas desatualizadas e confusas" />
              </div>
            </div>

            {/* Solution - Agendouu */}
            <div className="relative">
              <div className="absolute inset-0 bg-accent-500/10 blur-[50px] rounded-full animate-pulse-glow" />
              <Card className="relative bg-neutral-900/80 border-accent-500/20 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-accent-500">
                    A Solução Agendouu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <SolutionPoint text="Agenda 100% visível online 24/7" />
                  <SolutionPoint text="Reserva só confirma após PIX no sistema" />
                  <SolutionPoint text="Bloqueio automático de horários" />
                  <SolutionPoint text="Financeiro auditável e relatórios" />
                  <SolutionPoint text="Confirmação via WhatsApp (Manual)" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="justify-center"
              textClassName="text-3xl md:text-5xl font-bold text-white"
            >
              Como Funciona
            </ScrollFloat>
            <p className="text-neutral-400 mt-4">Em 3 passos simples</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              number={1}
              icon={<Calendar className="text-accent-500" size={28} />}
              title="Cadastre suas Quadras"
              description="Configure horários, preços e disponibilidade em minutos. Nossa interface é simples e intuitiva."
            />
            <StepCard
              number={2}
              icon={<Smartphone className="text-accent-500" size={28} />}
              title="Compartilhe o Link"
              description="Envie para seus clientes o link personalizado. Eles agendam direto pelo celular, sem precisar ligar."
            />
            <StepCard
              number={3}
              icon={<CreditCard className="text-accent-500" size={28} />}
              title="Receba via PIX"
              description="Pagamento confirmado instantaneamente. O dinheiro cai na sua conta e o horário é bloqueado."
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="funcionalidades" className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="justify-center"
              textClassName="text-3xl md:text-5xl font-bold text-white"
            >
              Tudo que você precisa
            </ScrollFloat>
            <p className="text-neutral-400 mt-4">
              Funcionalidades pensadas para maximizar seu faturamento
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ScrollStack
              useWindowScroll={true}
              itemDistance={40}
              stackPosition="25%"
              itemStackDistance={15}
            >
              <ScrollStackItem>
                <FeatureCard
                  icon={<Zap className="text-accent-500" />}
                  title="Reservas Instantâneas"
                  description="Seu cliente agenda em 30 segundos. Sem ligações, sem mensagens no WhatsApp."
                />
              </ScrollStackItem>
              <ScrollStackItem>
                <FeatureCard
                  icon={<ShieldCheck className="text-blue-500" />}
                  title="Bloqueio Anti-Calote"
                  description="O horário só confirma após o pagamento do sinal via PIX. Fim dos furos de última hora."
                />
              </ScrollStackItem>
              <ScrollStackItem>
                <FeatureCard
                  icon={<BarChart3 className="text-purple-500" />}
                  title="Dashboard Financeiro"
                  description="Controle total do caixa, relatórios de ocupação e histórico de clientes."
                />
              </ScrollStackItem>
              <ScrollStackItem>
                <FeatureCard
                  icon={<Bell className="text-orange-500" />}
                  title="Confirmação WhatsApp"
                  description="Envie confirmações via WhatsApp para seus clientes com um clique."
                />
              </ScrollStackItem>
              <ScrollStackItem>
                <FeatureCard
                  icon={<Users className="text-pink-500" />}
                  title="Gestão de Clientes"
                  description="Base de dados completa com histórico de reservas e preferências."
                />
              </ScrollStackItem>
            </ScrollStack>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="justify-center"
              textClassName="text-3xl md:text-5xl font-bold text-white"
            >
              O que nossos clientes dizem
            </ScrollFloat>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              quote="Antes eu passava 3 horas por dia no WhatsApp respondendo sobre horários. Agora é tudo automático!"
              author="Carlos Mendes"
              role="Dono da Arena XP"
              rating={5}
            />
            <TestimonialCard
              quote="Os furos de agenda caíram de 30% para menos de 5%. O sistema de pagamento antecipado é genial."
              author="Mariana Costa"
              role="Gestora do SportLife"
              rating={5}
            />
            <TestimonialCard
              quote="O dashboard financeiro me deu uma visão que eu nunca tive. Consegui aumentar o faturamento em 40%."
              author="Roberto Silva"
              role="Proprietário FitCenter"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-accent-500/10 to-blue-500/10 rounded-3xl p-12 border border-white/10 backdrop-blur-sm">
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="justify-center"
              textClassName="text-3xl md:text-4xl font-bold text-white"
            >
              Pronto para revolucionar sua arena?
            </ScrollFloat>
            <p className="text-neutral-300 mt-4 mb-8 text-lg">
              Comece gratuitamente. Sem cartão de crédito. Sem compromisso.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="rounded-full shadow-[0_0_20px_rgba(204,255,0,0.4)] flex items-center gap-2"
                >
                  Começar Agora <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="/arena-xp"></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="planos"
        className="py-24 border-t border-white/10 relative z-10"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Planos Transparentes
            </h2>
            <p className="text-neutral-300">Comece pequeno, cresça rápido.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title={PLANS.ESSENCIAL.name}
              price={PLANS.ESSENCIAL.price}
              period="/mês"
              description="Para quem está começando"
              features={[
                "Link de agendamento online",
                "Gestão de 1 unidade",
                "Reservas ilimitadas",
                "Painel financeiro básico",
                "Taxa de serviço por reserva",
                "Suporte por email",
              ]}
              href="/register?plan=essencial"
            />
            <PricingCard
              title={PLANS.PROFISSIONAL.name}
              price={PLANS.PROFISSIONAL.price}
              period="/mês"
              featured
              description="Para quem quer crescer sem limites"
              features={[
                "Tudo do plano Essencial",
                "Quadras ilimitadas",
                "Suporte prioritário",
                "Relatórios avançados",
                "Proteção contra Calotes",
              ]}
              href="/register?plan=profissional"
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 border-t border-white/10 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <ScrollFloat
              animationDuration={1}
              ease="back.inOut(2)"
              scrollStart="center bottom+=50%"
              scrollEnd="bottom bottom-=40%"
              stagger={0.03}
              containerClassName="justify-center"
              textClassName="text-3xl md:text-5xl font-bold text-white"
            >
              Perguntas Frequentes
            </ScrollFloat>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            <FAQItem
              question="Como funciona o período de teste gratuito?"
              answer="Você pode usar o plano Starter gratuitamente para sempre com até 2 quadras e 50 reservas/mês. Sem necessidade de cartão de crédito."
            />
            <FAQItem
              question="Posso migrar meus dados de outro sistema?"
              answer="Sim! Nossa equipe ajuda na migração gratuita de dados de qualquer outro sistema. Importamos clientes, histórico de reservas e configurações."
            />
            <FAQItem
              question="Quanto tempo leva para configurar?"
              answer="Em menos de 10 minutos você já pode receber a primeira reserva. Basta cadastrar sua arena, adicionar as quadras e compartilhar seu link."
            />
            <FAQItem
              question="Quais métodos de pagamento são aceitos?"
              answer="Aceitamos PIX (instantâneo) e cartão de crédito. O dinheiro cai direto na sua conta, sem intermediários."
            />
            <FAQItem
              question="Preciso de conhecimento técnico?"
              answer="Não! O sistema foi feito para ser simples. Se você sabe usar WhatsApp, sabe usar o Agendouu."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 bg-transparent relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <span className="text-2xl font-bold tracking-tighter text-white">
                Agendouu
              </span>
              <p className="text-neutral-500 text-sm mt-4">
                A plataforma completa para gestão de centros esportivos
                modernos.
              </p>
              <div className="flex gap-4 mt-6">
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-accent-500 hover:bg-white/10 transition-colors"
                >
                  <MessageSquare size={18} />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-accent-500 hover:bg-white/10 transition-colors"
                >
                  <Smartphone size={18} />
                </a>
              </div>
            </div>

            {/* Produto */}
            <div>
              <h4 className="font-semibold text-white mb-4">Produto</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Preços
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Integrações
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    API
                  </a>
                </li>
              </ul>
            </div>

            {/* Empresa */}
            <div>
              <h4 className="font-semibold text-white mb-4">Empresa</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Carreiras
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            {/* Suporte */}
            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Central de Ajuda
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Privacidade
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-accent-500 transition-colors"
                  >
                    Status do Sistema
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-neutral-500 text-sm">
              © 2026 Agendouu Inc. Todos os direitos reservados.
              <br className="md:hidden" />
              <span className="hidden md:inline"> • </span>
              Feito com ❤️ para o esporte brasileiro.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helpers
function PainPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 text-neutral-400">
      <XCircle className="text-red-500 shrink-0" size={20} />
      <span>{text}</span>
    </div>
  );
}

function SolutionPoint({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 p-2 text-white">
      <div className="w-6 h-6 rounded-full bg-accent-500/20 text-accent-500 flex items-center justify-center shrink-0">
        <CheckCircle2 size={14} />
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm hover:border-accent-500/50 transition-colors shadow-none text-white">
      <CardContent className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 shadow-sm text-accent-500">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-neutral-300 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  featured,
  href = "/register",
}: {
  title: string;
  price: string | number;
  period: string;
  description: string;
  features: string[];
  featured?: boolean;
  href?: string;
}) {
  return (
    <Card
      className={`relative flex flex-col ${featured ? "border-accent-500 shadow-[0_0_30px_rgba(204,255,0,0.1)] bg-neutral-900/50 !overflow-visible" : "border-white/10 shadow-sm bg-transparent"} backdrop-blur-sm text-white`}
    >
      {featured && (
        <div className="absolute -top-4 -right-4 bg-accent-500 text-black p-3 rounded-full shadow-[0_0_15px_rgba(204,255,0,0.6)] z-20 flex items-center justify-center">
          <Trophy size={24} className="fill-black" strokeWidth={2.5} />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl text-white">{title}</CardTitle>
        <div className="flex items-baseline mt-2">
          {typeof price === "number" ? (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">R$</span>
              <CountUp
                to={price}
                className="text-4xl font-extrabold text-white"
                decimals={price % 1 !== 0 ? 2 : 0}
                duration={1.5}
                separator="."
              />
            </div>
          ) : (
            <span className="text-4xl font-extrabold text-white">{price}</span>
          )}
          <span className="text-neutral-500 ml-1 text-sm">{period}</span>
        </div>
        <p className="text-sm text-neutral-400 mt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-0">
        <ul className="space-y-4 mb-8 flex-1 mt-6">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-center gap-3 text-sm text-neutral-300"
            >
              <CheckCircle2
                size={18}
                className={featured ? "text-accent-500" : "text-neutral-500"}
              />
              {feature}
            </li>
          ))}
        </ul>
        <Link href={href} className="w-full">
          <Button variant={featured ? "primary" : "outline"} className="w-full">
            Escolher Plano
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center group">
      <ScrollFloat
        animationDuration={1}
        ease="back.inOut(2)"
        scrollStart="center bottom+=50%"
        scrollEnd="bottom bottom-=40%"
        stagger={0.05}
        containerClassName="justify-center"
        textClassName="text-4xl md:text-6xl font-extrabold text-accent-500 drop-shadow-[0_0_20px_rgba(204,255,0,0.3)]"
      >
        {number}
      </ScrollFloat>
      <p className="text-neutral-400 mt-2 text-sm uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center group">
      <div className="absolute -top-4 -left-4 text-8xl font-extrabold text-white/5 select-none">
        {number}
      </div>
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-500/5 flex items-center justify-center mb-6 mx-auto border border-accent-500/20 group-hover:border-accent-500/50 transition-colors">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
        <p className="text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  rating,
}: {
  quote: string;
  author: string;
  role: string;
  rating: number;
}) {
  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-sm hover:border-accent-500/30 transition-colors shadow-none text-white">
      <CardContent className="p-8">
        <div className="flex gap-1 mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star
              key={i}
              size={16}
              className="fill-accent-500 text-accent-500"
            />
          ))}
        </div>
        <p className="text-neutral-300 leading-relaxed mb-6 italic">
          "{quote}"
        </p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-500 font-bold">
            {author.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">{author}</p>
            <p className="text-sm text-neutral-500">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-white/10 rounded-xl bg-white/5 backdrop-blur-sm overflow-hidden">
      <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
        <span className="font-semibold text-white pr-4">{question}</span>
        <span className="text-accent-500 text-2xl transition-transform group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="px-6 pb-6 text-neutral-400 leading-relaxed">{answer}</div>
    </details>
  );
}
