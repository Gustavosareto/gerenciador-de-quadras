"use client";

import { useState, useMemo } from "react";
import { User } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import { CustomerFormDialog } from "@/components/admin/CustomerFormDialog";
import { deleteCustomerAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface CustomerWithStats extends User {
  totalSpent?: number;
  lastVisit?: string;
  bookingsCount?: number;
}

interface CustomersClientProps {
  tenantSlug: string;
  initialCustomers: CustomerWithStats[];
  stats: {
    totalCustomers: number;
    avgTicket: number;
    newCustomersToday: number;
    trends: {
      total: string;
      ticket: string;
      newToday: string;
    };
  };
}

export function CustomersClient({
  tenantSlug,
  initialCustomers,
  stats,
}: CustomersClientProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [customers] = useState<CustomerWithStats[]>(initialCustomers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<User | undefined>(undefined);
  const [deletingCustomer, setDeletingCustomer] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const filteredCustomers = useMemo(() =>
    customers.filter(
      (c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.cpf && c.cpf.includes(searchTerm))
    ),
    [customers, searchTerm]
  );

  const handleEdit = (customer: User) => {
    setEditingCustomer(customer);
    setIsDialogOpen(true);
  };

  const handleDelete = (customer: User) => {
    setDeletingCustomer(customer);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingCustomer) return;
    try {
      const result = await deleteCustomerAction(tenantSlug, deletingCustomer.id);
      if (result.success) {
        showToast("Cliente excluído com sucesso!", "success");
        router.refresh();
      } else {
        showToast(result.error || "Erro ao excluir cliente", "error");
      }
    } catch {
      showToast("Erro ao excluir cliente", "error");
    } finally {
      setDeletingCustomer(null);
      setShowDeleteDialog(false);
    }
  };

  const handleCreate = () => {
    setEditingCustomer(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1">
            Base de Clientes
          </h1>
          <p className="text-zinc-400 text-sm">
            Gerencie seus clientes, contatos e histórico.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-accent-500 hover:bg-accent-400 text-black font-semibold px-5 py-3 rounded-xl flex items-center gap-2 transition-all w-full sm:w-auto justify-center"
        >
          <UserPlus size={18} />
          Cadastrar Cliente
        </button>
      </div>

      {/* Stats — 3 cols in sm+, 1 col stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total de Clientes", value: stats.totalCustomers.toString(), sub: stats.trends.total, icon: Users },
          { label: "Ticket Médio", value: formatCurrency(stats.avgTicket), sub: stats.trends.ticket, icon: Calendar },
          { label: "Novos Hoje", value: stats.newCustomersToday.toString(), sub: stats.trends.newToday, icon: UserPlus },
        ].map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-5 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm"
          >
            <div className="p-3 rounded-xl bg-accent-500/10 border border-accent-500/20 flex-shrink-0">
              <m.icon size={20} className="text-accent-500" />
            </div>
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-0.5">{m.label}</p>
              <h3 className="text-2xl font-bold text-white leading-none">{m.value}</h3>
              {m.sub && <p className="text-xs text-emerald-500 font-medium mt-1">{m.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, email ou CPF..."
              className="w-full bg-black/20 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────
            DESKTOP: traditional table (hidden on mobile)
        ──────────────────────────────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Contato</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Última Visita</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Reservas</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Total Gasto</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 font-bold border border-accent-500/20 flex-shrink-0">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-accent-500 transition-colors">
                            {customer.name}
                          </p>
                          {customer.cpf && (
                            <p className="text-[10px] text-zinc-500">{customer.cpf}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <Mail size={11} className="text-zinc-500 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-300">
                          <Phone size={11} className="text-zinc-500 flex-shrink-0" />
                          {customer.phone || "-"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Calendar size={13} className="text-zinc-600" />
                        {customer.lastVisit || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
                        {customer.bookingsCount} reservas
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-white">
                        {customer.totalSpent ? formatCurrency(customer.totalSpent) : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(customer)} className="p-2 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors" title="Editar">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(customer)} className="p-2 rounded-lg hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-colors" title="Excluir">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ────────────────────────────────────────────────────────────
            MOBILE: card list (hidden on md+)
            Pattern: "Stacked Mobile Card" — each row becomes a card
        ──────────────────────────────────────────────────────────── */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredCustomers.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 text-sm">
              Nenhum cliente encontrado.
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between gap-3">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-accent-500 font-bold border border-accent-500/20 flex-shrink-0 text-sm">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">{customer.name}</p>
                      <p className="text-xs text-zinc-500 truncate">{customer.email}</p>
                    </div>
                  </div>

                  {/* Action buttons — always visible on mobile (no hover) */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
                      className="p-2 rounded-lg bg-red-500/5 text-red-500/70 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Info chips row */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {customer.phone && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-white/5 px-2 py-1 rounded-lg">
                      <Phone size={10} className="text-zinc-500" />
                      {customer.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-white/5 px-2 py-1 rounded-lg">
                    <Calendar size={10} className="text-zinc-500" />
                    {customer.bookingsCount ?? 0} reservas
                  </div>
                  {customer.totalSpent && customer.totalSpent > 0 && (
                    <div className="flex items-center gap-1 text-[11px] text-accent-500 bg-accent-500/10 px-2 py-1 rounded-lg border border-accent-500/20 font-semibold">
                      {formatCurrency(customer.totalSpent)}
                    </div>
                  )}
                  {customer.lastVisit && (
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 bg-white/5 px-2 py-1 rounded-lg">
                      Última: {customer.lastVisit}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <CustomerFormDialog
        isOpen={isDialogOpen}
        onClose={() => { setIsDialogOpen(false); setEditingCustomer(undefined); }}
        initialData={editingCustomer}
        tenantSlug={tenantSlug}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => { setShowDeleteDialog(false); setDeletingCustomer(null); }}
        onConfirm={confirmDelete}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir ${deletingCustomer?.name}? Todas as reservas e histórico deste cliente serão perdidos.`}
        confirmText="Sim, excluir"
        variant="danger"
      />
    </div>
  );
}
