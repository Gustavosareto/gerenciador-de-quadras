import { Check } from 'lucide-react';

interface SubscriptionTabProps {
    planType: string;
    subscriptionDetails: any;
    handleUpgrade: () => void;
    setIsCancelModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isCanceling: boolean;
}

export function SubscriptionTab({
    planType,
    subscriptionDetails,
    handleUpgrade,
    setIsCancelModalOpen,
    isCanceling
}: SubscriptionTabProps) {
    return (
        <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Plano Atual</h3>
                        <p className="text-sm text-zinc-400">Gerencie sua assinatura e faturamento</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full border ${planType === 'PROFISSIONAL' ? 'bg-accent-500/20 border-accent-500/30 text-accent-500' : 'bg-white/10 border-white/20 text-white'}`}>
                        <span className="font-bold text-sm">{planType === 'PROFISSIONAL' ? 'Plano Pro' : 'Plano Gratuito'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-zinc-400 text-sm mb-2">Valor Mensal</p>
                        <p className="text-3xl font-black text-white">
                            {subscriptionDetails ? `R$ ${subscriptionDetails.amount.toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                        </p>
                    </div>
                    <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-zinc-400 text-sm mb-2">Próximo Vencimento</p>
                        <p className="text-3xl font-black text-white">
                            {subscriptionDetails?.nextBillingDate || '--/--/--'}
                        </p>
                    </div>
                    <div className="p-6 bg-black/20 rounded-2xl border border-white/5">
                        <p className="text-zinc-400 text-sm mb-2">Status</p>
                        <p className={`text-2xl font-black ${subscriptionDetails?.status === 'Ativo' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                            {subscriptionDetails?.status || 'Inativo'}
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h4 className="text-lg font-bold text-white">Recursos Inclusos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            'Quadras ilimitadas',
                            'Relatórios avançados',
                            'Suporte prioritário',
                            'Integração com pagamentos',
                            'App mobile personalizado'
                        ].map((feature, i) => (
                            <div key={i} className={`flex items-center gap-3 ${planType === 'PROFISSIONAL' ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${planType === 'PROFISSIONAL' ? 'bg-accent-500/20 border border-accent-500/30' : 'bg-zinc-800'}`}>
                                    <Check size={12} className={planType === 'PROFISSIONAL' ? "text-accent-500" : "text-zinc-600"} />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4">
                {planType !== 'PROFISSIONAL' && (
                    <button
                        onClick={handleUpgrade}
                        className="flex-1 px-6 py-4 bg-accent-500 text-black border border-accent-500/50 rounded-2xl font-bold hover:bg-accent-400 transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)]"
                    >
                        Fazer Upgrade Agora
                    </button>
                )}

                {planType === 'PROFISSIONAL' && (
                    <button
                        onClick={() => setIsCancelModalOpen(true)}
                        disabled={isCanceling}
                        className="flex-1 px-6 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 font-medium hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                        {isCanceling ? 'Processando...' : 'Cancelar Assinatura'}
                    </button>
                )}
            </div>
        </div>
    );
}
