"use client";

import { useState, useTransition } from "react";
import { Court, Tenant } from "@/types";
import { CourtFormDialog } from "@/components/admin/CourtFormDialog";
import { CourtImageCarousel } from "@/components/CourtImageCarousel";
import {
  Edit,
  Image as ImageIcon,
  MapPin,
  Trophy,
  Trash2,
  Plus,
  AlertTriangle,
  Clock,
  Play,
  Users,
  Layers,
  Maximize2
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { deleteCourtAction } from "@/app/actions";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface CourtsClientProps {
  initialCourts: Court[];
  tenant: Tenant;
  tenantSlug: string;
}

export function CourtsClient({
  initialCourts,
  tenant,
  tenantSlug,
}: CourtsClientProps) {
  const { showToast } = useToast();
  const [courts, setCourts] = useState<Court[]>(initialCourts);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [deletingCourt, setDeletingCourt] = useState<Court | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleSave = (court: Court) => {
    if (editingCourt) {
      setCourts(courts.map((c) => (c.id === court.id ? court : c)));
    } else {
      setCourts([...courts, court]);
    }
  };

  const handleEdit = (court: Court) => {
    setEditingCourt(court);
  };

  const handleDelete = async () => {
    if (!deletingCourt) return;

    startDeleteTransition(async () => {
      const result = await deleteCourtAction(tenantSlug, deletingCourt.id);
      if (result.success) {
        showToast("Quadra excluída com sucesso!", "success");
        setCourts(courts.filter((c) => c.id !== deletingCourt.id));
        setDeletingCourt(null);
      } else {
        showToast(result.error || "Erro ao excluir quadra", "error");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Gerenciar Quadras
          </h1>
          <p className="text-zinc-400">
            Visualização e controle das suas unidades esportivas.
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
            {tenant.plan === "essencial"
              ? "Plano Essencial"
              : "Plano Profissional"}
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-accent-500 hover:bg-accent-400 text-black font-semibold px-6 py-3 rounded-xl text-sm transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={18} strokeWidth={3} /> Nova Quadra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courts.map((court) => (
          <div
            key={court.id}
            className="group relative overflow-hidden rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm transition-all duration-300 hover:border-accent-500/30 hover:bg-zinc-900/60"
          >
            <div className="relative h-56 w-full">
              <CourtImageCarousel
                images={court.images && court.images.length > 0 ? court.images : (court.image ? [court.image] : [])}
                courtName={court.name}
                className="h-full"
              />

              {/* Action Buttons (Edit/Delete) */}
              <div className="absolute top-4 right-4 flex gap-2 sm:translate-y-[-10px] sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300 z-20">
                <button
                  onClick={() => handleEdit(court)}
                  className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
                  title="Editar"
                >
                  <Edit size={18} className="sm:size-4" />
                </button>
                <button
                  onClick={() => setDeletingCourt(court)}
                  className="h-10 w-10 sm:h-9 sm:w-9 rounded-xl bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={18} className="sm:size-4" />
                </button>
              </div>

              {/* Custom Overlay Badges at bottom */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-20">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] bg-accent-500 text-black font-bold uppercase tracking-wider backdrop-blur-md">
                  <Trophy size={12} strokeWidth={3} />
                  {court.type}
                </span>
                {court.reservationType === "FIXED" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] bg-indigo-500 text-white font-bold uppercase tracking-wider backdrop-blur-md border border-indigo-400/30">
                    <Clock size={10} />
                    Fixo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] bg-emerald-500 text-white font-bold uppercase tracking-wider backdrop-blur-md border border-emerald-400/30">
                    <Play size={10} />
                    Aberto
                  </span>
                )}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent-500 transition-colors">
                {court.name}
              </h3>

              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-4">
                <MapPin size={16} className="text-zinc-600" />
                <span>{tenant.name || "Principal Arena"}</span>
              </div>

              {/* Court Metadata Summary */}
              <div className="flex flex-wrap gap-4 mb-6">
                {(court.minPlayers || court.maxPlayers) && (
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                    <Users size={12} className="text-zinc-600" />
                    <span>
                      {court.minPlayers && court.maxPlayers
                        ? `${court.minPlayers}-${court.maxPlayers} Jog.`
                        : court.maxPlayers
                          ? `Até ${court.maxPlayers} Jog.`
                          : `${court.minPlayers} Jog. mín.`}
                    </span>
                  </div>
                )}
                {court.surface && (
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-white/5 px-2 py-1 rounded-md border border-white/5 text-nowrap">
                    <Layers size={12} className="text-zinc-600" />
                    <span className="capitalize">{court.surface}</span>
                  </div>
                )}
                {court.dimensions && (
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 bg-white/5 px-2 py-1 rounded-md border border-white/5 text-nowrap">
                    <Maximize2 size={12} className="text-zinc-600" />
                    <span>{court.dimensions}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1">
                    Preço/Hora
                  </p>
                  <p className="text-lg font-bold text-white">
                    {formatCurrency(court.hourlyRate)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-1">
                    Status
                  </p>
                  <div className="flex items-center justify-end gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${court.isMaintenance ? "bg-red-500" : "bg-emerald-500"}`}
                    />
                    <span
                      className={`text-sm font-medium ${court.isMaintenance ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {court.isMaintenance ? "Manutenção" : "Ativa"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* "Add New" Card */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="group relative w-full h-full min-h-[350px] rounded-3xl border border-dashed border-zinc-700 bg-white/[0.02] hover:bg-white/[0.05] hover:border-accent-500/50 transition-all duration-300 flex flex-col items-center justify-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:border-accent-500/50 transition-all duration-300">
            <Plus
              size={32}
              className="text-zinc-500 group-hover:text-accent-500 transition-colors"
            />
          </div>
          <span className="text-sm font-semibold text-zinc-500 group-hover:text-white transition-colors">
            Adicionar Nova Quadra
          </span>
        </button>
      </div>

      <CourtFormDialog
        tenantSlug={tenantSlug}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleSave}
        courtToEdit={null}
      />

      <CourtFormDialog
        tenantSlug={tenantSlug}
        isOpen={!!editingCourt}
        onClose={() => setEditingCourt(null)}
        courtToEdit={editingCourt}
        onSuccess={handleSave}
      />

      <ConfirmDialog
        isOpen={!!deletingCourt}
        onClose={() => setDeletingCourt(null)}
        onConfirm={handleDelete}
        title="Excluir Quadra"
        message={`Tem certeza que deseja excluir a quadra ${deletingCourt?.name}? Essa ação não pode ser desfeita e todas as reservas associadas serão perdidas.`}
        confirmText="Sim, excluir"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
