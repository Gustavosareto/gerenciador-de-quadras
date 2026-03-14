"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2,
  Zap,
  Crown,
  Loader2,
  Sparkles,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useSearchParams, useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface PlanClientProps {
  company: any;
  plans: any;
  tenantSlug: string;
  userEmail?: string;
}

export default function PlanClient({
  company,
  plans,
  tenantSlug,
}: PlanClientProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const isPro = company.planType === "PROFISSIONAL";
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  useEffect(() => {
    if (success && !isPro) {
      const syncSubscription = async () => {
        try {
          await fetch("/api/subscription/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantSlug }),
          });
          router.refresh();
        } catch (error) {
          console.error("Error syncing subscription:", error);
        }
      };

      const timer = setInterval(() => {
        syncSubscription();
      }, 3000);

      syncSubscription();
      return () => clearInterval(timer);
    }
  }, [success, isPro, router, tenantSlug]);

  const handleCancel = async () => {
    try {
      setCanceling(true);
      const response = await fetch("/api/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao abrir portal");
      if (data.url) window.location.href = data.url;
    } catch (error: any) {
      console.error(error);
      showToast(error.message, "error");
    } finally {
      setCanceling(false);
    }
  };

  const handleUpgrade = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plans.PROFISSIONAL.priceId,
          tenantSlug: tenantSlug,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao iniciar checkout");
      if (data.url) window.location.href = data.url;
    } catch (error: any) {
      console.error(error);
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase italic">
            Meu Plano
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            Gerencie sua assinatura e limites da plataforma
          </p>
        </div>
      </div>

      {success && (
        <div className={`p-4 rounded-2xl flex items-start sm:items-center gap-3 border ${isPro ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-accent-500/10 border-accent-500/20 text-accent-500"
          }`}>
          {isPro ? <CheckCircle2 size={20} className="mt-1 sm:mt-0" /> : <Loader2 size={20} className="animate-spin mt-1 sm:mt-0" />}
          <div>
            <p className="font-bold">{isPro ? "Pagamento Confirmado!" : "Processando Assinatura..."}</p>
            <p className="text-xs sm:text-sm opacity-80">
              {isPro ? "Bem-vindo ao Plano Profissional. Recursos liberados." : "Confirmando pagamento com o Stripe..."}
            </p>
          </div>
        </div>
      )}

      {canceled && (
        <div className="p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-3">
          <Zap size={20} />
          <p className="text-sm font-medium italic">O checkout foi cancelado.</p>
        </div>
      )}

      {/* Current Status Card */}
      <Card className="border-white/5 bg-zinc-900/40 overflow-hidden relative">
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] opacity-10 -mr-20 -mt-20 ${isPro ? "bg-accent-500" : "bg-white"}`} />
        <CardContent className="p-5 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${isPro ? "bg-accent-500/10 text-accent-500" : "bg-zinc-800 text-zinc-400"}`}>
                  {isPro ? <Crown size={32} /> : <Zap size={32} />}
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">Plano Atual</p>
                  <h2 className="text-2xl sm:text-3xl font-black text-white uppercase italic">
                    {isPro ? plans.PROFISSIONAL.name : plans.ESSENCIAL.name}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                {isPro
                  ? "Você está utilizando a versão completa do sistema com todos os recursos liberados para sua arena."
                  : "Versão gratuita. Ideal para começar, mas com limites de quadras e ferramentas de gestão."}
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 sm:min-w-[320px] text-center">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 sm:mb-4">Valor Mensal</p>
              <div className="flex items-baseline justify-center gap-1 mb-6">
                <span className="text-zinc-400 text-lg">R$</span>
                <span className="text-4xl sm:text-5xl font-black text-white italic">
                  {isPro ? plans.PROFISSIONAL.price.toFixed(2).replace(".", ",") : "0,00"}
                </span>
                <span className="text-zinc-500 text-sm">/mês</span>
              </div>

              {!isPro ? (
                <div className="space-y-3 w-full">
                  <Button
                    onClick={handleUpgrade}
                    disabled={loading}
                    className="w-full h-14 rounded-xl bg-accent-500 hover:bg-accent-400 text-black font-extrabold shadow-[0_0_30px_rgba(204,255,0,0.2)]"
                  >
                    {loading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={18} />}
                    UPGRADE AGORA
                  </Button>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        await fetch("/api/subscription/sync", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ tenantSlug }),
                        });
                        router.refresh();
                        showToast("Status verificado!", "success");
                      } catch {
                        showToast("Erro ao verificar", "error");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="text-[10px] text-zinc-500 hover:text-white underline underline-offset-4"
                  >
                    Já realizou o pagamento? Clique aqui
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCancelModalOpen(true)}
                    className="w-full h-12 rounded-xl border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10 font-bold"
                  >
                    Gerenciar Assinatura
                  </Button>
                  <ConfirmDialog
                    isOpen={isCancelModalOpen}
                    onClose={() => setIsCancelModalOpen(false)}
                    onConfirm={handleCancel}
                    title="Gerenciar Assinatura"
                    message="Deseja abrir o portal do Stripe para gerenciar pagamentos ou cancelar?"
                    confirmText="Sim, abrir portal"
                    variant="danger"
                    isLoading={canceling}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage & Features Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-white/5 bg-zinc-900/40">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity size={20} className="text-accent-500" />
              Recursos em Uso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-zinc-500">Quadras</span>
                <span className="text-white">{company.courts?.length || 0} / {isPro ? "∞" : "3"}</span>
              </div>
              <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${isPro ? "bg-accent-500" : "bg-blue-500"}`}
                  style={{ width: `${Math.min(100, ((company.courts?.length || 0) / (isPro ? company.courts?.length || 1 : 3)) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-4 italic">Vantagens {isPro ? 'Ativas' : 'do Pro'}:</h4>
              {[
                "Quadras Ilimitadas",
                "Relatórios de Faturamento Avançados",
                "Suporte Prioritário",
                "Gestão Completa de Clientes"
              ].map((f, i) => (
                <div key={i} className={`flex items-center gap-3 ${isPro ? "text-white" : "text-zinc-500"}`}>
                  <CheckCircle2 size={16} className={isPro ? "text-accent-500" : "text-zinc-800"} />
                  <span className="text-sm font-medium">{f}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-zinc-900/40">
          <CardHeader className="p-6">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-500" />
              Segurança Total
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-4">
              <ShieldCheck size={20} className="text-blue-500 flex-shrink-0" />
              <p className="text-xs text-zinc-500 leading-relaxed">
                Dados processados exclusivamente pelo <span className="text-white font-bold italic">Stripe</span>.
                Segurança bancária de nível militar.
              </p>
            </div>
            <div className="space-y-3">
              {[
                "Sem fidelidade: cancele quando quiser",
                "Liberação imediata pós-pagamento",
                "Suporte humanizado via WhatsApp"
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-zinc-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                  {t}
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 h-12 border-white/10 text-zinc-400 hover:text-white">
              Falar com Suporte
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
