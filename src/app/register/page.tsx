'use client';

import { Suspense, useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/Button';
import Threads from '@/components/ui/Threads';
import SplitText from '@/components/ui/SplitText';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PLANS } from '@/lib/plans';
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
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const THREADS_COLOR: [number, number, number] = [0.4, 0.38, 0.38];

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'essencial';
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [arenaName, setArenaName] = useState('');

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
    const hasSpecialChar = /[!@#\$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password,
    );

    const isValid = hasMinLength && hasUpperCase;
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !arenaName) {
      showToast('Preencha todos os campos', 'warning');
      return;
    }
    if (!passwordStrength.isValid) {
      showToast('Sua senha precisa ser mais forte', 'warning');
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            arena_name: arenaName,
            plan: planFromUrl,
          },
        },
      });

      if (error) throw error;
      showToast('Conta criada com sucesso!', 'success');
      router.push('/login');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'Erro ao criar conta', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto relative z-10">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Crie sua Arena</h2>
          <p className="text-zinc-400">Comece a gerenciar suas quadras hoje</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
           <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Nome da Arena</label>
            <div className="relative">
              <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all font-medium"
                placeholder="Ex: Arena Beach Tennis"
                value={arenaName}
                onChange={(e) => setArenaName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Email Profissional</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all font-medium"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 ml-1">Senha</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-white/10 bg-black/50 text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all font-medium"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-4 bg-accent-500 hover:bg-accent-600 text-black font-bold rounded-xl transition-all shadow-lg shadow-accent-500/20"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Criar Minha Arena'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-zinc-500">Já tem uma conta?</p>
          <Link href="/login" className="text-white hover:text-accent-500 font-bold transition-colors">
            Fazer Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col relative overflow-hidden text-white">
      <Navbar />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Threads color={THREADS_COLOR} amplitude={1.2} distance={0.8} />
      </div>

      <main className="flex-1 flex items-center justify-center p-4 pt-32 relative z-10">
        <Suspense fallback={<Loader2 className="animate-spin text-accent-500 size-12" />}>
          <RegisterForm />
        </Suspense>
      </main>
    </div>
  );
}
