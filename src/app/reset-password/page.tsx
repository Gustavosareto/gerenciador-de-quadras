"use client";

import { useState, useEffect, Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import Threads from "@/components/ui/Threads";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Key, ArrowRight, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const THREADS_COLOR: [number, number, number] = [0.4, 0.38, 0.38];

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !code || !newPassword || !confirmPassword) {
      showToast("Preencha todos os campos", "warning");
      return;
    }

    if (code.length !== 6) {
      showToast("O código deve ter 6 dígitos", "warning");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("As senhas não coincidem", "warning");
      return;
    }

    if (newPassword.length < 6) {
      showToast("A senha deve ter no mínimo 6 caracteres", "warning");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/verify-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao redefinir senha");
      }

      showToast(data.message, "success");

      // Redirecionar para a página de login
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao redefinir senha", "error");
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
              <div className="w-16 h-16 bg-accent-500/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Key className="text-accent-500" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 text-center">
                Criar Nova Senha
              </h2>
              <p className="text-zinc-400 text-center">
                Digite o código enviado para seu email
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Email (readonly) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">
                  Email
                </label>
                <input
                  className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-black/30 text-zinc-400 focus:outline-none cursor-not-allowed"
                  type="email"
                  value={email}
                  readOnly
                />
              </div>

              {/* Código de 6 dígitos */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">
                  Código de Verificação
                </label>
                <div className="relative">
                  <Key
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all text-center text-2xl tracking-widest font-bold"
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setCode(value);
                    }}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {/* Nova Senha */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">
                  Nova Senha
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300 ml-1">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Indicador de força da senha */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <
                          (newPassword.length >= 12
                            ? 4
                            : newPassword.length >= 8
                              ? 3
                              : newPassword.length >= 6
                                ? 2
                                : 1)
                            ? i < 2
                              ? "bg-red-500"
                              : i < 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            : "bg-zinc-700"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <CheckCircle2
                      size={12}
                      className={
                        newPassword.length >= 6
                          ? "text-green-500"
                          : "text-zinc-600"
                      }
                    />
                    <span>Mínimo de 6 caracteres</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full py-3.5 bg-accent-500 hover:bg-accent-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                type="submit"
                isLoading={loading}
                disabled={loading}
              >
                Redefinir Senha
                <ArrowRight size={18} />
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/forgot-password"
                className="text-zinc-400 hover:text-accent-500 transition-colors text-sm"
              >
                Não recebeu o código? Enviar novamente
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
