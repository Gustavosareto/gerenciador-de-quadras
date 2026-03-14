import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
    Upload,
    Image as ImageIcon,
    MapPin,
    Phone,
    Mail,
    Instagram,
    Clock,
    Link2,
    Check,
    Copy,
    ExternalLink,
    AlertTriangle,
    Save
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { maskPhone, maskCep } from '../utils/masks';
import { validateEmail, validateTime } from '../utils/validators';

interface ProfileTabProps {
    profileData: any;
    setProfileData: React.Dispatch<React.SetStateAction<any>>;
    tenantSlug: string;
    handleCepChange: (cep: string) => void;
    handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    publicBookingLink: string;
    copyBookingLink: () => void;
    copiedLink: boolean;
    handleSave: () => void;
    saved: boolean;
    isSaving: boolean;
}

// Otimização: Input local para evitar Rerenders do contexto Master
const LocalInput = ({ value, onCommit, applyMask = (v: string) => v, onChangeValidation, ...props }: any) => {
    const [localValue, setLocalValue] = useState(applyMask(value || ''));

    useEffect(() => {
        setLocalValue(applyMask(value || ''));
    }, [value, applyMask]);

    return (
        <input
            {...props}
            value={localValue}
            onChange={(e) => {
                const masked = applyMask(e.target.value);
                setLocalValue(masked);
                if (onChangeValidation) onChangeValidation(masked);
            }}
            onBlur={() => {
                if (onCommit) onCommit(localValue);
            }}
        />
    );
};

export function ProfileTab({
    profileData,
    setProfileData,
    tenantSlug,
    handleCepChange,
    handleLogoUpload,
    errors,
    setErrors,
    publicBookingLink,
    copyBookingLink,
    copiedLink,
    handleSave,
    saved,
    isSaving
}: ProfileTabProps) {
    return (
        <div className="p-8 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-sm space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center pb-8 border-b border-white/5">
                <div className="relative group/logo">
                    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-800 bg-black/40 flex items-center justify-center shadow-2xl transition-all group-hover/logo:border-accent-500/50">
                        {profileData.logo ? (
                            <Image
                                src={profileData.logo}
                                alt="Logo"
                                fill
                                sizes="128px"
                                className="object-cover"
                            />
                        ) : (
                            <ImageIcon size={40} className="text-zinc-700" />
                        )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center text-black cursor-pointer shadow-xl hover:bg-accent-400 transition-all hover:scale-110 active:scale-90 z-10">
                        <Upload size={18} strokeWidth={3} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">Logo do Estabelecimento</h3>
                    <p className="text-sm text-zinc-400 mb-0">Recomendado: 512x512px (PNG ou JPG). Máx 2MB.</p>
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-white mb-6">Informações Gerais</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                            Nome do Estabelecimento
                        </label>
                        <LocalInput
                            value={profileData.name}
                            onCommit={(val: string) => setProfileData({ ...profileData, name: val })}
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                            Slug da URL
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">
                                meuapp.com/
                            </span>
                            <input
                                disabled
                                value={tenantSlug}
                                className="w-full bg-black/10 border border-white/5 rounded-2xl pl-[110px] pr-5 py-3.5 text-zinc-500 outline-none cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-1 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                            CEP
                        </label>
                        <LocalInput
                            value={profileData.addressCep}
                            onCommit={(val: string) => handleCepChange(val)}
                            applyMask={maskCep}
                            placeholder="00000-000"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                        />
                    </div>

                    <div className="md:col-span-1 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                            Cidade
                        </label>
                        <LocalInput
                            value={profileData.addressCity}
                            onCommit={(val: string) => setProfileData({ ...profileData, addressCity: val })}
                            placeholder="São Paulo"
                            className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                        />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-6 gap-6">
                        <div className="md:col-span-1 space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                                UF
                            </label>
                            <LocalInput
                                value={profileData.addressState}
                                applyMask={(v: string) => v.toUpperCase().slice(0, 2)}
                                onCommit={(val: string) => setProfileData({ ...profileData, addressState: val })}
                                placeholder="SP"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all text-center"
                            />
                        </div>

                        <div className="md:col-span-4 space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                                <MapPin size={14} /> Endereço (Rua)
                            </label>
                            <LocalInput
                                value={profileData.address}
                                onCommit={(val: string) => setProfileData({ ...profileData, address: val, addressStreet: val })}
                                placeholder="Ex: Av. Paulista"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                            />
                        </div>

                        <div className="md:col-span-1 space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">
                                Número
                            </label>
                            <LocalInput
                                value={profileData.addressNumber}
                                onCommit={(val: string) => setProfileData({ ...profileData, addressNumber: val })}
                                placeholder="1000"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-6">Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                            <Phone size={14} /> Telefone
                        </label>
                        <LocalInput
                            value={profileData.phone}
                            applyMask={maskPhone}
                            onChangeValidation={() => setErrors({ ...errors, phone: '' })}
                            onCommit={(val: string) => {
                                setProfileData({ ...profileData, phone: val });
                            }}
                            placeholder="(11) 3000-0000"
                            className={`w-full bg-black/20 border rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-accent-500/50 focus:ring-accent-500/20'
                                }`}
                        />
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                            <Phone size={14} /> WhatsApp
                        </label>
                        <LocalInput
                            value={profileData.whatsapp}
                            applyMask={maskPhone}
                            onChangeValidation={() => setErrors({ ...errors, whatsapp: '' })}
                            onCommit={(val: string) => {
                                setProfileData({ ...profileData, whatsapp: val });
                            }}
                            placeholder="(11) 90000-0000"
                            className={`w-full bg-black/20 border rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:ring-2 transition-all ${errors.whatsapp ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-accent-500/50 focus:ring-accent-500/20'
                                }`}
                        />
                        {errors.whatsapp && <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                            <Mail size={14} /> E-mail
                        </label>
                        <LocalInput
                            type="email"
                            value={profileData.email}
                            onChangeValidation={(val: string) => {
                                if (val && !validateEmail(val)) {
                                    setErrors({ ...errors, email: 'E-mail inválido' });
                                } else {
                                    setErrors({ ...errors, email: '' });
                                }
                            }}
                            onCommit={(val: string) => setProfileData({ ...profileData, email: val })}
                            placeholder="contato@arena.com"
                            className={`w-full bg-black/20 border rounded-2xl px-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-accent-500/50 focus:ring-accent-500/20'
                                }`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                            <Instagram size={14} /> Instagram
                        </label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600">@</span>
                            <LocalInput
                                value={profileData.instagram}
                                onCommit={(val: string) => setProfileData({ ...profileData, instagram: val })}
                                placeholder="arena_oficial"
                                className="w-full bg-black/20 border border-white/10 rounded-2xl pl-9 pr-5 py-3.5 text-white placeholder:text-zinc-600 outline-none focus:border-accent-500/50 focus:ring-2 focus:ring-accent-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-6">Horário de Funcionamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                            <Clock size={14} /> Abertura
                        </label>
                        <LocalInput
                            type="time"
                            value={profileData.openTime}
                            onChangeValidation={(val: string) => {
                                if (val && !validateTime(val)) {
                                    setErrors({ ...errors, openTime: 'Horário inválido' });
                                } else {
                                    setErrors({ ...errors, openTime: '' });
                                }
                            }}
                            onCommit={(val: string) => setProfileData({ ...profileData, openTime: val })}
                            className={`w-full bg-black/20 border rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 transition-all ${errors.openTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-accent-500/50 focus:ring-accent-500/20'
                                }`}
                        />
                        {errors.openTime && <p className="text-red-500 text-xs mt-1">{errors.openTime}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 flex items-center gap-2">
                            <Clock size={14} /> Fechamento
                        </label>
                        <LocalInput
                            type="time"
                            value={profileData.closeTime}
                            onChangeValidation={(val: string) => {
                                if (val && !validateTime(val)) {
                                    setErrors({ ...errors, closeTime: 'Horário inválido' });
                                } else if (val <= profileData.openTime) {
                                    setErrors({ ...errors, closeTime: 'Deve ser após o horário de abertura' });
                                } else {
                                    setErrors({ ...errors, closeTime: '' });
                                }
                            }}
                            onCommit={(val: string) => setProfileData({ ...profileData, closeTime: val })}
                            className={`w-full bg-black/20 border rounded-2xl px-5 py-3.5 text-white outline-none focus:ring-2 transition-all ${errors.closeTime ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-accent-500/50 focus:ring-accent-500/20'
                                }`}
                        />
                        {errors.closeTime && <p className="text-red-500 text-xs mt-1">{errors.closeTime}</p>}
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-white/5">
                <h3 className="text-xl font-bold text-white mb-3">Link de Agendamento Público</h3>
                <p className="text-sm text-zinc-400 mb-6">
                    Compartilhe este link para permitir que clientes agendem quadras diretamente
                </p>

                <div className="bg-black/30 border border-white/10 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-accent-500/10 rounded-xl border border-accent-500/20">
                            <Link2 className="text-accent-500" size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
                                Seu Link Público
                            </p>
                            <p className="text-white font-mono text-sm break-all">
                                {publicBookingLink}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={copyBookingLink}
                            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent-500/30 text-white font-semibold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                        >
                            {copiedLink ? (
                                <>
                                    <Check size={18} className="text-accent-500" />
                                    <span>Link Copiado!</span>
                                </>
                            ) : (
                                <>
                                    <Copy size={18} />
                                    <span>Copiar Link</span>
                                </>
                            )}
                        </button>

                        <a
                            href={publicBookingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-accent-500 hover:bg-accent-400 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                        >
                            <ExternalLink size={18} />
                            <span>Abrir Página</span>
                        </a>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-start gap-2 text-xs text-zinc-500">
                            <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                            <p>
                                Este link permite que qualquer pessoa acesse a página de agendamento.
                                O pagamento é obrigatório para confirmar a reserva.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-white text-black font-bold px-8 py-4 rounded-2xl flex items-center gap-2 hover:bg-accent-500 transition-all hover:scale-[1.02] shadow-xl disabled:opacity-50"
                >
                    {saved ? <Check size={20} /> : <Save size={20} />}
                    {isSaving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
                </Button>
            </div>
        </div>
    );
}
