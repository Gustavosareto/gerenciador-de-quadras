import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 antialiased selection:bg-accent-500/30">
      <Navbar />

      <main className="container mx-auto px-6 py-24 max-w-4xl">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-accent-500 hover:text-accent-400 mb-12 transition-colors group"
        >
          <ArrowLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Voltar para o cadastro
        </Link>

        <article className="prose prose-invert prose-zinc max-w-none">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight uppercase italic font-sans italic">
            Termos de Uso
          </h1>

          <p className="text-xl text-zinc-400 mb-12 leading-relaxed">
            Última atualização: 10 de Fevereiro de 2026
          </p>

          <section className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. Aceitação dos Termos
              </h2>
              <p className="leading-relaxed">
                Ao acessar e utilizar a plataforma Agendouu (adiante denominada
                "Plataforma"), você concorda em cumprir e estar vinculado a
                estes Termos de Uso. Se você não concordar com qualquer parte
                destes termos, não deverá utilizar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Descrição do Serviço
              </h2>
              <p className="leading-relaxed">
                O Agendouu fornece um software de gestão para arenas esportivas,
                incluindo, mas não se limitando a, sistemas de agendamento
                online, controle financeiro, gestão de clientes e notificações
                via WhatsApp.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. Cadastro e Segurança
              </h2>
              <p className="leading-relaxed">
                Para utilizar as funcionalidades da Plataforma, o usuário deve
                criar uma conta fornecendo dados verídicos e atualizados. Você é
                inteiramente responsável por manter a confidencialidade de sua
                senha e por todas as atividades que ocorrem em sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Planos e Pagamentos
              </h2>
              <ul className="list-disc pl-6 space-y-4">
                <li>
                  <strong>Plano Essencial:</strong> Oferecido gratuitamente com
                  funcionalidades limitadas.
                </li>
                <li>
                  <strong>Plano Profissional:</strong> Oferecido mediante
                  assinatura mensal processada via Stripe.
                </li>
                <li>
                  O faturamento é recorrente e o cancelamento pode ser feito a
                  qualquer momento pelo painel administrativo, encerrando a
                  renovação para o próximo ciclo.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Responsabilidades do Proprietário da Arena
              </h2>
              <p className="leading-relaxed">
                O proprietário é responsável por manter as informações das
                quadras, preços e horários atualizados. O Agendouu não se
                responsabiliza por conflitos de horários causados por má gestão
                manual do sistema pelo usuário.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                6. Propriedade Intelectual
              </h2>
              <p className="leading-relaxed">
                Todo o conteúdo, design, logotipos e código da plataforma são de
                propriedade exclusiva do Agendouu. É proibida a reprodução,
                engenharia reversa ou distribuição sem autorização prévia por
                escrito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-4">
                7. Limitação de Responsabilidade
              </h2>
              <p className="leading-relaxed">
                Em nenhuma circunstância o Agendouu será responsável por danos
                indiretos, incidentais ou lucros cessantes decorrentes do uso ou
                da incapacidade de usar a Plataforma.
              </p>
            </section>
          </section>

          <div className="mt-20 pt-10 border-t border-white/10 text-center">
            <p className="text-zinc-500 italic">
              Dúvidas sobre os termos? Entre em contato em suporte@agendouu.com
            </p>
          </div>
        </article>
      </main>
    </div>
  );
}
