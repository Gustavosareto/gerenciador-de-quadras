import { CreditCard, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';

interface SupportTabProps {
    planType: string;
    isSupportModalOpen: boolean;
    setIsSupportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    supportMessage: string;
    setSupportMessage: React.Dispatch<React.SetStateAction<string>>;
    initialDataName: string;
    tenantSlug: string;
}

export function SupportTab({
    planType,
    isSupportModalOpen,
    setIsSupportModalOpen,
    supportMessage,
    setSupportMessage,
    initialDataName,
    tenantSlug
}: SupportTabProps) {
    return (
        <div className="space-y-6">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-sm">
                <h3 className="text-xl font-bold text-white mb-2">Central de Ajuda</h3>
                <p className="text-sm text-zinc-400 mb-6">Precisa de ajuda? Estamos aqui para você!</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {planType !== 'FREE' ? (
                        <button
                            onClick={() => setIsSupportModalOpen(true)}
                            className="p-6 bg-black/20 border border-white/5 rounded-2xl hover:border-accent-500/30 hover:bg-black/30 transition-all group text-left w-full"
                        >
                            <CreditCard size={32} className="text-purple-400 mb-4" />
                            <h4 className="text-white font-bold mb-2 group-hover:text-purple-400 transition-colors">Abrir Chamado</h4>
                            <p className="text-sm text-zinc-500">Relatar problema ou solicitar ajuda</p>
                        </button>
                    ) : (
                        <div className="p-6 bg-black/20 border border-white/5 rounded-2xl text-left w-full relative overflow-hidden">
                            <div className="absolute top-3 right-3 bg-zinc-800 text-xs px-2 py-1 rounded text-zinc-400">PRO</div>
                            <CreditCard size={32} className="text-zinc-600 mb-4" />
                            <h4 className="text-zinc-500 font-bold mb-2">Abrir Chamado</h4>
                            <p className="text-sm text-zinc-600">Upgrade para abrir chamados prioritários.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <HelpCircle size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-1">Precisa de ajuda imediata?</h4>
                        <p className="text-sm text-zinc-400 mb-3">
                            Nossa equipe está disponível de segunda a sexta, das 9h às 18h
                        </p>
                        <a href="mailto:gustavosareto1@gmail.com" className="text-blue-400 font-medium hover:text-blue-300 transition-colors">
                            gustavosareto1@gmail.com
                        </a>
                    </div>
                </div>
            </div>

            <Dialog
                isOpen={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                title="Abrir Chamado de Suporte"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-zinc-400 mb-2 block">
                            Descreva como podemos ajudar:
                        </label>
                        <textarea
                            value={supportMessage}
                            onChange={(e) => setSupportMessage(e.target.value)}
                            placeholder="Ex: Não estou conseguindo cadastrar uma nova quadra..."
                            className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl p-4 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all resize-none"
                        />
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={() => {
                                if (!supportMessage.trim()) return;
                                const phone = "5547992805274"; // Substituir pelo número real
                                const text = encodeURIComponent(`*Novo Chamado de Suporte*\n\nUnidade: ${initialDataName}\nSlug: ${tenantSlug}\n\n*Mensagem:*\n${supportMessage}`);
                                window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                                setIsSupportModalOpen(false);
                                setSupportMessage('');
                            }}
                            className="w-full bg-accent-500 hover:bg-accent-400 text-black font-bold py-4 rounded-xl"
                        >
                            Enviar para WhatsApp
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
