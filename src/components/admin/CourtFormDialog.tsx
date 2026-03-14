"use client";

import { useTransition, useState, useEffect } from "react";
import { Plus, Check, Loader2, Upload, Trash2, GripVertical, Info } from "lucide-react";
import { Reorder } from "framer-motion";
import { nanoid } from "nanoid";
import { createCourtAction, updateCourtAction } from "@/app/actions";
import { Dialog } from "@/components/ui/Dialog";
import { Select } from "@/components/ui/Select";
import { Court } from "@/types";
import { useToast } from "@/components/ui/Toast";

export interface CourtFormDialogProps {
    tenantSlug: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (court: Court) => void;
    courtToEdit?: Court | null;
}

export function CourtFormDialog({ tenantSlug, isOpen, onClose, onSuccess, courtToEdit }: CourtFormDialogProps) {
    const { showToast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState<{
        name: string;
        type: string;
        hourlyRate: string;
        description: string;
        images: { id: string; url: string }[];
        reservationType: string;
        isMaintenance: boolean;
        useCompanyAddress: boolean;
        customAddress: string;
        minPlayers: string;
        maxPlayers: string;
        surface: string;
        dimensions: string;
    }>({
        name: "",
        type: "society",
        hourlyRate: "120,00",
        description: "",
        images: [],
        reservationType: "FIXED",
        isMaintenance: false,
        useCompanyAddress: true,
        customAddress: "",
        minPlayers: "",
        maxPlayers: "",
        surface: "",
        dimensions: ""
    });

    useEffect(() => {
        if (courtToEdit) {
            setFormData({
                name: courtToEdit.name,
                type: courtToEdit.type,
                hourlyRate: courtToEdit.hourlyRate?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00",
                description: courtToEdit.description || "",
                images: courtToEdit.images && courtToEdit.images.length > 0
                    ? courtToEdit.images.map(url => ({ id: nanoid(), url }))
                    : (courtToEdit.image ? [{ id: nanoid(), url: courtToEdit.image }] : []),
                reservationType: courtToEdit.reservationType || "FIXED",
                isMaintenance: courtToEdit.isMaintenance || false,
                useCompanyAddress: courtToEdit.useCompanyAddress ?? true,
                customAddress: courtToEdit.customAddress || "",
                minPlayers: courtToEdit.minPlayers?.toString() || "",
                maxPlayers: courtToEdit.maxPlayers?.toString() || "",
                surface: courtToEdit.surface || "",
                dimensions: courtToEdit.dimensions || ""
            });
        } else {
            setFormData({
                name: "",
                type: "society",
                hourlyRate: "120,00",
                description: "",
                images: [],
                reservationType: "FIXED",
                isMaintenance: false,
                useCompanyAddress: true,
                customAddress: "",
                minPlayers: "",
                maxPlayers: "",
                surface: "",
                dimensions: ""
            });
        }
    }, [courtToEdit, isOpen]);

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        value = value.replace(/\D/g, "");
        if (!value) {
            setFormData({ ...formData, hourlyRate: "" });
            return;
        }
        const numberValue = parseInt(value, 10) / 100;
        const formatted = numberValue.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        setFormData({ ...formData, hourlyRate: formatted });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const currentCount = formData.images.length;
            const availableSlots = 5 - currentCount;

            if (availableSlots <= 0) {
                showToast("Você já atingiu o limite de 5 imagens.", "warning");
                return;
            }

            const filesToProcess = files.slice(0, availableSlots);
            const newImages: { id: string; url: string }[] = [];
            let processedCount = 0;

            filesToProcess.forEach(file => {
                if (file.size > 4.5 * 1024 * 1024) {
                    showToast(`A imagem ${file.name} tem mais de 4.5MB.`, "warning");
                    processedCount++;
                    return;
                }

                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        newImages.push({ id: nanoid(), url: reader.result });
                    }
                    processedCount++;
                    if (processedCount === filesToProcess.length) {
                        setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
                    }
                };
                reader.readAsDataURL(file);
            });

            e.target.value = "";
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleReorder = (newOrder: { id: string; url: string }[]) => {
        setFormData(prev => ({ ...prev, images: newOrder }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("type", formData.type);
        const rawPrice = formData.hourlyRate ? formData.hourlyRate.replace(/\./g, "").replace(",", ".") : "0";
        data.append("hourlyRate", rawPrice);
        data.append("description", formData.description);
        data.append("images", JSON.stringify(formData.images.map(img => img.url)));
        data.append("reservationType", formData.reservationType);
        data.append("isMaintenance", String(formData.isMaintenance));
        data.append("useCompanyAddress", String(formData.useCompanyAddress));
        if (!formData.useCompanyAddress) {
            data.append("customAddress", formData.customAddress);
        }
        data.append("minPlayers", formData.minPlayers);
        data.append("maxPlayers", formData.maxPlayers);
        data.append("surface", formData.surface);
        data.append("dimensions", formData.dimensions);

        startTransition(async () => {
            let result;
            if (courtToEdit) {
                result = await updateCourtAction(tenantSlug, courtToEdit.id, data);
            } else {
                result = await createCourtAction(tenantSlug, data);
            }

            if (result.success) {
                showToast(courtToEdit ? "Quadra atualizada!" : "Quadra criada!", "success");
                onClose();
                if (result.data && onSuccess) {
                    const mapped: Court = {
                        id: result.data.id,
                        tenantId: result.data.tenantId,
                        name: result.data.name,
                        type: result.data.type,
                        hourlyRate: result.data.hourlyRate,
                        image: result.data.images && result.data.images.length > 0 ? result.data.images[0] : undefined,
                        images: result.data.images,
                        description: result.data.description,
                        reservationType: result.data.reservationType,
                        isMaintenance: result.data.isMaintenance,
                        useCompanyAddress: result.data.useCompanyAddress ?? undefined,
                        customAddress: result.data.customAddress,
                        minPlayers: result.data.minPlayers,
                        maxPlayers: result.data.maxPlayers,
                        surface: result.data.surface,
                        dimensions: result.data.dimensions
                    };
                    onSuccess(mapped);
                }
            } else {
                showToast(result.error || "Erro ao salvar", "error");
            }
        });
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={courtToEdit ? "Editar Quadra" : "Nova Quadra"}>
            <form onSubmit={handleSubmit} className="px-1 sm:px-0 space-y-6 pb-4">
                {/* Nome */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Nome da Quadra</label>
                    <input
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Arena Principal - Society"
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:border-accent-500 transition-all outline-none"
                    />
                </div>

                {/* Imagens */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Fotos da Quadra</label>
                        <span className="text-[10px] font-bold text-zinc-500">{formData.images.length}/5</span>
                    </div>

                    {formData.images.length > 0 && (
                        <Reorder.Group
                            axis="x"
                            values={formData.images}
                            onReorder={handleReorder}
                            className="flex gap-3 overflow-x-auto pb-4 px-1 scrollbar-hide"
                        >
                            {formData.images.map((img, index) => (
                                <Reorder.Item
                                    key={img.id}
                                    value={img}
                                    className="relative w-32 h-24 rounded-2xl border border-white/5 overflow-hidden bg-black/40 flex-shrink-0 cursor-grab active:cursor-grabbing group"
                                >
                                    <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2 p-1 bg-black/60 rounded-lg">
                                        <GripVertical size={10} className="text-zinc-400" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-lg text-white"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}

                    {formData.images.length < 5 && (
                        <label className="cursor-pointer">
                            <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                            <div className="w-full h-14 bg-black/20 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center gap-2 text-zinc-500 hover:text-white hover:border-accent-500 transition-all">
                                <Upload size={18} />
                                <span className="text-xs font-bold uppercase tracking-wider">Adicionar Fotos</span>
                            </div>
                        </label>
                    )}
                </div>

                {/* Tipo e Preço */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <Select
                        label="MODALIDADE"
                        value={formData.type}
                        onChange={(value) => setFormData({ ...formData, type: value })}
                        options={[
                            { label: "Society", value: "society" },
                            { label: "Tênis", value: "tennis" },
                            { label: "Beach Tennis", value: "beach-tennis" },
                            { label: "Futsal", value: "futsal" },
                            { label: "Vôlei", value: "volleyball" },
                            { label: "Basquete", value: "basketball" }
                        ]}
                    />
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Preço por Hora (R$)</label>
                        <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm font-bold">R$</span>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formData.hourlyRate}
                                onChange={handlePriceChange}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-sm text-white focus:border-accent-500 transition-all outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Jogadores */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Mín. Jogadores</label>
                        <input
                            type="number"
                            value={formData.minPlayers}
                            onChange={e => setFormData({ ...formData, minPlayers: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-accent-500 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Máx. Jogadores</label>
                        <input
                            type="number"
                            value={formData.maxPlayers}
                            onChange={e => setFormData({ ...formData, maxPlayers: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-accent-500 transition-all"
                        />
                    </div>
                </div>

                {/* Piso e Dimensões */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Tipo de Piso</label>
                        <input
                            value={formData.surface}
                            onChange={e => setFormData({ ...formData, surface: e.target.value })}
                            placeholder="Ex: Grama Sintética"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-accent-500 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Dimensões (Opcional)</label>
                        <input
                            value={formData.dimensions}
                            onChange={e => setFormData({ ...formData, dimensions: e.target.value })}
                            placeholder="Ex: 20m x 40m"
                            className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-accent-500 transition-all"
                        />
                    </div>
                </div>

                {/* Status Manutenção */}
                <label className="flex items-center gap-4 p-5 rounded-2xl bg-black/30 border border-white/5 cursor-pointer hover:bg-white/[0.03] transition-all group">
                    <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${formData.isMaintenance ? 'bg-red-500' : 'bg-emerald-500'}`}>
                        <div className={`w-4 h-4 rounded-full bg-white shadow-xl transition-transform duration-300 ${formData.isMaintenance ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                    <input type="checkbox" checked={formData.isMaintenance} onChange={e => setFormData({ ...formData, isMaintenance: e.target.checked })} className="hidden" />
                    <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${formData.isMaintenance ? 'text-red-400' : 'text-emerald-400'}`}>
                            {formData.isMaintenance ? 'EM MANUTENÇÃO' : 'QUADRA ATIVA'}
                        </span>
                        <span className="text-[10px] text-zinc-500">Status de disponibilidade para reservas públicas</span>
                    </div>
                </label>

                {/* Endereço */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                    <label className="flex items-center gap-4 p-5 rounded-2xl bg-black/30 border border-white/5 cursor-pointer hover:bg-white/[0.05] transition-all group">
                        <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${formData.useCompanyAddress ? 'bg-accent-500' : 'bg-zinc-700'}`}>
                            <div className={`w-4 h-4 rounded-full bg-black transition-transform duration-300 ${formData.useCompanyAddress ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                        <input type="checkbox" checked={formData.useCompanyAddress} onChange={e => setFormData({ ...formData, useCompanyAddress: e.target.checked })} className="hidden" />
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-widest text-white">Usar endereço padrão</span>
                            <span className="text-[10px] text-zinc-500">Usa o mesmo endereço cadastrado para a empresa</span>
                        </div>
                    </label>

                    {!formData.useCompanyAddress && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Endereço Personalizado</label>
                            <input
                                required
                                value={formData.customAddress}
                                onChange={e => setFormData({ ...formData, customAddress: e.target.value })}
                                placeholder="Rua, Número, Bairro, Cidade"
                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-accent-500"
                            />
                        </div>
                    )}
                </div>

                {/* Submit */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-accent-500 hover:bg-accent-400 text-black font-black uppercase tracking-[0.2em] py-5 rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : (courtToEdit ? <Check /> : <Plus />)}
                        {isPending ? "SALVANDO..." : (courtToEdit ? "SALVAR ALTERAÇÕES" : "CRIAR QUADRA")}
                    </button>
                    <p className="text-[10px] text-center text-zinc-500 mt-4 flex items-center justify-center gap-1.5 uppercase tracking-tighter">
                        <Info size={12} /> Preencha todos os campos obrigatórios para continuar
                    </p>
                </div>
            </form>
        </Dialog>
    );
}
