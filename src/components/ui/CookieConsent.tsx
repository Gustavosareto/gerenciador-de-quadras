'use client';

import { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Button } from './Button';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                {/* Background Detail */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/5 blur-3xl -mr-16 -mt-16" />
                
                <div className="relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="p-2.5 bg-accent-500/10 rounded-xl text-accent-500 flex-shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-white font-bold text-lg leading-tight">Valorizamos sua privacidade</h3>
                            <p className="text-zinc-400 text-sm leading-relaxed">
                                Utilizamos cookies para melhorar sua experiência, analisar o tráfego e personalizar seu acesso à nossa gestão de arenas. Ao continuar navegando, você concorda com nossa{' '}
                                <a href="/privacy" className="text-accent-500 hover:underline">Política de Privacidade</a>.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        <Button 
                            onClick={acceptCookies}
                            className="flex-1 bg-accent-500 hover:bg-accent-400 text-black font-bold h-11 rounded-xl shadow-lg shadow-accent-500/10"
                        >
                            Aceitar todos
                        </Button>
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="p-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                            aria-label="Fechar"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
