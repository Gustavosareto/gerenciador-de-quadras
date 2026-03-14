import { Eye, EyeOff, Save, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SecurityTabProps {
    securityData: any;
    setSecurityData: React.Dispatch<React.SetStateAction<any>>;
    showPassword: boolean;
    setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
    handlePasswordUpdate: () => void;
    isSaving: boolean;
    saved: boolean;
}

export function SecurityTab({
    securityData,
    setSecurityData,
    showPassword,
    setShowPassword,
    handlePasswordUpdate,
    isSaving,
    saved
}: SecurityTabProps) {
    return (
        <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-sm space-y-8">
            <div>
                <h3 className="text-xl font-bold text-white mb-2">Alterar Senha</h3>
                <p className="text-sm text-zinc-400 mb-6">
                    Mantenha sua conta segura com uma senha forte
                </p>

                <div className="space-y-6 max-w-xl">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                            Senha Atual
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={securityData.currentPassword}
                                onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                placeholder="Digite sua senha atual"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 pr-12 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                            Nova Senha
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={securityData.newPassword}
                            onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                            placeholder="Digite sua nova senha"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                            Confirmar Nova Senha
                        </label>
                        <input
                            type={showPassword ? "text" : "password"}
                            value={securityData.confirmPassword}
                            onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                            placeholder="Confirme sua nova senha"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                        />
                    </div>

                    {securityData.newPassword && securityData.confirmPassword && securityData.newPassword !== securityData.confirmPassword && (
                        <p className="text-red-500 text-sm flex items-center gap-2">
                            <X size={16} /> As senhas não coincidem
                        </p>
                    )}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handlePasswordUpdate}
                    disabled={isSaving}
                    className="bg-white text-black font-bold px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-accent-500 transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saved ? <Check size={20} /> : <Save size={20} />}
                    {isSaving ? 'Atualizando...' : saved ? 'Senha Atualizada!' : 'Atualizar Senha'}
                </Button>
            </div>
        </div>
    );
}
