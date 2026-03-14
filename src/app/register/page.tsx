"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Button } from "@/components/ui/Button";
import Threads from "@/components/ui/Threads";
import SplitText from "@/components/ui/SplitText";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@/lib/plans";
import {
  Mail,
  Lock,
  Building2,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Check,
  X,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { GoogleLoginButton } from "@/components/auth/GoogleLoginButton";

const THREADS_COLOR: [number, number, number] = [0.4, 0.38, 0.38];

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get("plan") || "essencial";
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [arenaName, setArenaName] = useState("");

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValid: false,
    isStrong: false,
  });

  useEffect(() => {
    const hasMinLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );

    // Requisitos mínimos para prosseguir
    const isValid = hasMinLength && hasUpperCase;

    // Requisitos para senha forte
    const isStrong =
      hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;

    setPasswordStrength({
      hasMinLength,
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      isValid,
      isStrong,
    });
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength.isStrong) return "text-emerald-400";
    if (passwordStrength.isValid) return "text-yellow-400";
    if (password.length > 0) return "text-red-400";
    return "text-zinc-500";
  };

  const getStrengthBar = () => {
    if (passwordStrength.isStrong) return "bg-emerald-500";
    if (passwordStrength.isValid) return "bg-yellow-500";
    if (password.length > 0) return "bg-red-500";
    return "bg-zinc-700";
  };

  const getStrengthWidth = () => {
    if (passwordStrength.isStrong) return "100%";
    if (passwordStrength.isValid) return "66%";
    if (password.length > 0) return "33%";
    return "0%";
  };

  const getStrengthLabel = () => {
    if (passwordStrength.isStrong) return "Forte";
    if (passwordStrength.isValid) return "Média";
    if (password.length > 0) return "Fraca";
    return "";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !arenaName) {
      showToast("Preencha todos os campos", "warning");
      return;
    }

    try {
      setLoading(true);

      // Validar e limpar email antes de enviar
      const cleanEmail = email.trim().toLowerCase();

      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: arenaName, // Store arena name in metadata initially
            role: "admin",
          },
        },
      });

      if (authError) {
        console.error("[REGISTER] Erro no signUp do Supabase:", authError);
        throw authError;
      }

      console.log(
        "[REGISTER] Usuário criado no Auth:",
        authData.user?.email,
        "ID:",
        authData.user?.id,
      );

      if (authData.user) {
        // 2. Auto-seed the company for this user
        // We'll call an API route to do this securely with Service Role
        // Pass the user ID and desired arena details
        const seedResponse = await fetch("/api/seed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ownerId: authData.user.id,
            email: authData.user.email,
            companyName: arenaName,
            companySlug: arenaName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, ""),
            planType:
              planFromUrl === "essencial" ? "FREE" : planFromUrl.toUpperCase(),
          }),
        });

        if (!seedResponse.ok) {
          const err = await seedResponse.text();
          console.error("Auto-seed falhou:", err);
          showToast(
            "Conta criada, mas houve um erro ao configurar a arena. Contate o suporte ou tente novamente.",
            "error",
          );
          return;
        }

        const seedData = await seedResponse.json();
        const companySlug = seedData.company.slug;

        showToast("Conta criada com sucesso!", "success");

        // Se escolheu o plano profissional, tenta iniciar o checkout imediatamente
        if (planFromUrl === "profissional") {
          try {
            const checkoutResponse = await fetch("/api/checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                priceId: PLANS.PROFISSIONAL.priceId,
                tenantSlug: companySlug,
                userId: authData.user.id,
                userEmail: authData.user.email,
              }),
            });

            const checkoutData = await checkoutResponse.json();

            if (checkoutResponse.ok && checkoutData.url) {
              window.location.href = checkoutData.url;
              return;
            } else {
              console.error("[REGISTER] Erro no checkout:", checkoutData);
              showToast(
                `Erro no checkout: ${checkoutData.error || "Erro desconhecido"}`,
                "error",
              );
              // Aguarda o usuário ler o erro antes de redirecionar
              setTimeout(() => {
                router.push(
                  `/login?redirectTo=/${companySlug}/admin/plan&plan=profissional`,
                );
              }, 5000);
              return;
            }
          } catch (error) {
            console.error("[REGISTER] Erro técnico no checkout:", error);
            showToast(
              "Erro ao conectar com o sistema de pagamentos. Redirecionando para login...",
              "error",
            );
            router.push(
              `/login?redirectTo=/${companySlug}/admin/plan&plan=profissional`,
            );
            return;
          }
        } else {
          router.push("/login");
        }
      }
    } catch (error: any) {
      console.error(error);

      let message = "Erro ao criar conta";

      // Handle Supabase Rate Limits
      if (error.message?.includes("Email rate limit exceeded")) {
        message =
          "Limite de tentativas excedido. Aguarde alguns minutos ou altere as configurações de rate limit no painel do Supabase.";
      } else if (error.message) {
        message = error.message;
      }

      showToast(message, "error");
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
          {/* Left Side - Form */}
          <div className="w-full max-w-md mx-auto lg:order-2">
            <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center">
                    <Sparkles size={20} className="text-accent-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-white">
                    {planFromUrl === "profissional"
                      ? "Plano Profissional"
                      : "Comece Grátis"}
                  </h2>
                </div>
                <p className="text-zinc-400">
                  Crie sua conta e comece a gerenciar sua arena hoje mesmo
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300 ml-1">
                    Nome da Arena
                  </label>
                  <div className="relative">
                    <Building2
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                      type="text"
                      placeholder="Ex: Arena Sports Center"
                      value={arenaName}
                      onChange={(e) => setArenaName(e.target.value)}
                      required
                    />
                  </div>
                </div>

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
                      placeholder="contato@suaarena.com"
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
                      placeholder="Mínimo 6 caracteres"
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

                  {/* Password Strength Indicator */}
                  {password.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${getStrengthBar()}`}
                            style={{ width: getStrengthWidth() }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium ${getStrengthColor()}`}
                        >
                          {getStrengthLabel()}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div
                          className={`flex items-center gap-2 text-xs ${passwordStrength.hasMinLength ? "text-emerald-400" : "text-zinc-500"}`}
                        >
                          {passwordStrength.hasMinLength ? (
                            <Check size={14} className="flex-shrink-0" />
                          ) : (
                            <X size={14} className="flex-shrink-0" />
                          )}
                          <span>Mínimo 6 caracteres</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs ${passwordStrength.hasUpperCase ? "text-emerald-400" : "text-zinc-500"}`}
                        >
                          {passwordStrength.hasUpperCase ? (
                            <Check size={14} className="flex-shrink-0" />
                          ) : (
                            <X size={14} className="flex-shrink-0" />
                          )}
                          <span>1 letra maiúscula</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs ${passwordStrength.hasNumber ? "text-emerald-400" : "text-zinc-500"}`}
                        >
                          {passwordStrength.hasNumber ? (
                            <Check size={14} className="flex-shrink-0" />
                          ) : (
                            <X size={14} className="flex-shrink-0" />
                          )}
                          <span>1 número</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 text-xs ${passwordStrength.hasSpecialChar ? "text-emerald-400" : "text-zinc-500"}`}
                        >
                          {passwordStrength.hasSpecialChar ? (
                            <Check size={14} className="flex-shrink-0" />
                          ) : (
                            <X size={14} className="flex-shrink-0" />
                          )}
                          <span>1 caractere especial (!@#$%...)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-white/10 bg-black/50 text-accent-500 focus:ring-2 focus:ring-accent-500/20 mt-0.5"
                    required
                  />
                  <label className="text-zinc-400">
                    Aceito os{" "}
                    <Link
                      href="/terms"
                      className="text-accent-500 hover:text-accent-400 transition-colors"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link
                      href="/privacy"
                      className="text-accent-500 hover:text-accent-400 transition-colors"
                    >
                      Política de Privacidade
                    </Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3.5 bg-accent-500 hover:bg-accent-400 text-black font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-accent-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={!passwordStrength.isValid || loading}
                  isLoading={loading}
                >
                  Criar Conta Grátis
                  <ArrowRight size={18} />
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-500">ou</span>
                  </div>
                </div>

                <GoogleLoginButton label="Registrar com Google" />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-900 px-2 text-zinc-500">
                      Já tem conta?
                    </span>
                  </div>
                </div>

                <Link href="/login">
                  <button
                    type="button"
                    className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all"
                  >
                    Fazer Login
                  </button>
                </Link>
              </form>
            </div>
          </div>

          {/* Right Side - Benefits */}
          <div className="hidden lg:block space-y-8 lg:order-1">
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight text-white leading-tight">
                <SplitText
                  text="Transforme sua arena com "
                  delay={40}
                  textAlign="start"
                />
                <span className="text-accent-500 inline-block">
                  <SplitText
                    text="tecnologia"
                    delay={40}
                    startDelay={100}
                    textAlign="start"
                  />
                </span>
              </h1>
              <p className="text-xl text-zinc-400">
                Junte-se a centenas de arenas que já modernizaram sua gestão
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "Setup em 5 minutos",
                  desc: "Configure sua arena e comece a usar imediatamente",
                },
                {
                  title: "Sem mensalidade inicial",
                  desc: "Teste por 14 dias sem compromisso ou cartão",
                },
                {
                  title: "Suporte dedicado",
                  desc: "Equipe pronta para ajudar via WhatsApp e email",
                },
                {
                  title: "Atualizações gratuitas",
                  desc: "Novas funcionalidades sem custo adicional",
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent-500/20 transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-500/20 border border-accent-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={16} className="text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-zinc-400">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r from-accent-500/10 to-emerald-500/10 border border-accent-500/20">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border-2 border-zinc-900 flex items-center justify-center text-sm font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white font-semibold">
                  +500 arenas cadastradas
                </p>
                <p className="text-sm text-zinc-400">
                  Gestão profissional em todo Brasil
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
