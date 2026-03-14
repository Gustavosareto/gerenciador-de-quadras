"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import Threads from "@/components/ui/Threads";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const THREADS_COLOR: [number, number, number] = [0.4, 0.38, 0.38];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showToast("Digite seu email", "warning");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar código");
      }

      showToast(data.message, "success");

      // Em desenvolvimento, mostrar o código
      if (data.devCode) {
        showToast(`Código de teste: ${data.devCode}`, "info");
      }

      setCodeSent(true);

      // Redirecionar para a página de verificação
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao enviar código", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-x-hidden text-white selection:bg-accent-500 selection:text-black">
      {/* Global Background Animation */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Threads
          color={THREADS_COLOR}
          amplitude={1.2}
          distance={0.8}
          enableMouseInteraction={true}
        />
      </div>

      <Navbar type="saas" />

      <div className="flex-1 flex items-center justify-center px-4 pt-32 pb-4 relative z-10">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Esqueceu a senha?
              </h2>
              <p className="text-zinc-400">
                Digite seu email para receber um código de verificação
              </p>
            </div>

            <form onSubmit={handleRequestCode} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={codeSent}
                  />
                </div>
              </div>

              <Button
                className="w-full py-3.5 bg-accent-500 hover:bg-accent-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                type="submit"
                isLoading={loading}
                disabled={loading || codeSent}
              >
                {codeSent ? "Código Enviado" : "Enviar Código"}
                {!codeSent && <ArrowRight size={18} />}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-zinc-400 hover:text-accent-500 transition-colors text-sm"
              >
                <ArrowLeft size={16} />
                Voltar para o login
              </Link>
            </div>

            {/* Info sobre código */}
            <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-zinc-400 text-center">
                💡 Você receberá um código de 6 dígitos válido por 15 minutos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
