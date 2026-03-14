import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Trophy, CheckCircle2, Crown, Zap, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
    tenantSlug: string;
}

export function UpgradeModal({ isOpen, onClose, featureName = "Recurso Premium", tenantSlug }: UpgradeModalProps) {
    // Escape key handler
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleEsc);
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleEsc);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content - Custom styled for Upgrade */}
            <div className="relative w-full max-w-[500px] bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 text-white/50 hover:text-white hover:bg-black/40 transition-colors backdrop-blur-sm"
                >
                    <X size={20} />
                </button>

                {/* Header with Gradient */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-900 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-[60px] opacity-40"></div>
                    <div className="absolute top-10 left-10 w-20 h-20 bg-indigo-400 rounded-full blur-[40px] opacity-30"></div>

                    <div className="relative z-10 flex flex-col items-center animate-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-300 to-amber-500 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.4)] flex items-center justify-center mb-[-40px]">
                            <Crown size={32} className="text-black fill-black/20" />
                        </div>
                    </div>
                </div>

                <div className="px-8 pt-12 pb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black tracking-tight flex flex-col gap-1 text-white">
                            <span className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Plano Profissional</span>
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-400">
                                Desbloqueie o {featureName}
                            </span>
                        </h2>
                        <p className="text-zinc-400 text-base mt-2">
                            Leve a gestão da sua arena para o próximo nível com recursos exclusivos de automação e controle financeiro.
                        </p>
                    </div>

                    {/* Benefits List */}
                    <div className="space-y-4 mb-8 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                        <BenefitItem icon={ShieldCheck} text="Proteção contra calotes (Sinal PIX)" />
                        <BenefitItem icon={Trophy} text="Relatórios financeiros detalhados" />
                        <BenefitItem icon={CheckCircle2} text="Quadras ilimitadas" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <Link href={`/${tenantSlug}/admin/plan`} className="w-full">
                            <Button size="lg" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] border-0">
                                Fazer Upgrade Agora
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="text-zinc-500 hover:text-zinc-300 hover:bg-transparent"
                        >
                            Talvez depois
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


function BenefitItem({ icon: Icon, text }: { icon: any, text: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-500">
                <Icon size={14} />
            </div>
            <span className="text-sm text-zinc-300 font-medium">{text}</span>
        </div>
    );
}
