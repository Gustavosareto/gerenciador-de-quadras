"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import Threads from "@/components/ui/Threads";
import SplitText from "@/components/ui/SplitText";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

const THREADS_COLOR: [number, number, number] = [0.4, 0.38, 0.38];

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const plan = searchParams.get("plan");
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Preencha todos os campos", "warning");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error("Email ou senha incorretos.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Por favor, confirme seu email antes de entrar.");
        }
        throw error;
      }

      // OTIMIZAÇÃO: Tentar obter o slug dos metadados locais para evitar round-trip ao banco
      // Isso torna o login subsequente muito mais rápido
      let slug = data.user.user_metadata?.company_slug;

      if (!slug) {
        // Se não tem no metadata, busca na tabela companies (apenas no primeiro login)
        const { data: company } = await supabase
          .from("companies")
          .select("slug")
          .eq("owner_id", data.user.id)
          .single();

        if (company?.slug) {
          slug = company.slug;
          // Salva no metadata para o próximo login
          // Não aguardamos essa promise para não bloquear o redirect
          supabase.auth
            .updateUser({
              data: { company_slug: slug },
            })
            .catch(console.error);
        }
      }

      if (slug) {
        showToast("Login realizado! Redirecionando...", "success");
        router.refresh();

        if (redirectTo) {
          router.push(redirectTo);
        } else {
          router.push(`/${slug}/admin`);
        }
      } else {
        showToast("Bem-vindo de volta!", "success");
        router.refresh();
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao fazer login", "error");
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
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight text-white leading-tight">
                <SplitText
                  text="Gerencie sua arena de forma "
                  delay={40}
                  textAlign="start"
                />
                <span className="text-accent-500 inline-block">
                  <SplitText
                    text="profissional"
                    delay={40}
                    startDelay={100}
                    textAlign="start"
                  />
                </span>
              </h1>
              <p className="text-xl text-zinc-400">
                Sistema completo de gestão para arenas esportivas com tudo que
                você precisa.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Controle total de reservas e calendário",
                "Gestão financeira integrada",
                "Confirmação simplificada via WhatsApp",
                "Relatórios e dashboards em tempo real",
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-500/20 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={14} className="text-accent-500" />
                  </div>
                  <p className="text-zinc-300">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Bem-vindo de volta!
                </h2>
                <p className="text-zinc-400">
                  Acesse seu painel administrativo
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
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
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 ml-1">
                    Senha
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/10 bg-black/50 text-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                    Lembrar-me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-accent-500 hover:text-accent-400 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                <Button
                  className="w-full py-3.5 bg-accent-500 hover:bg-accent-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 transition-all hover:scale-[1.02] disabled:opacity-50"
                  type="submit"
                  isLoading={loading}
                  disabled={loading}
                >
                  Login
                  <ArrowRight size={18} />
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                {/* Divisor */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-500">ou</span>
                  </div>
                </div>

                {/* Google Login */}
                <GoogleLoginButton label="Entrar com Google" />

                {/* Divisor */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-500">
                      Novo por aqui?
                    </span>
                  </div>
                </div>

                <Link href="/register">
                  <button className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all">
                    Criar conta grátis
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
