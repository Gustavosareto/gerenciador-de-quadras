'use client';

import { useState } from 'react';
import { X, DollarSign, Calendar as CalendarIcon, Tag, CreditCard, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: TransactionFormData) => void;
}

export interface TransactionFormData {
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
}

const categories = {
  income: ['Reservas', 'Aulas', 'Eventos', 'Mensalidades', 'Torneios', 'Bar/Lanchonete', 'Outros'],
  expense: ['Energia', 'Água', 'Salários', 'Manutenção', 'Materiais', 'Marketing', 'Impostos', 'Aluguel', 'Internet', 'Seguros', 'Outros']
};

const paymentMethods = [
  'PIX',
  'Dinheiro',
  'Cartão de Crédito',
  'Cartão de Débito',
  'Boleto',
  'Transferência Bancária',
  'Outros'
];

export default function TransactionModal({ isOpen, onClose, onSubmit }: TransactionModalProps) {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: '',
    type: 'income',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'PIX',
    reference: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [displayAmount, setDisplayAmount] = useState<string>('');

  // Função para formatar valor em BRL
  const formatBRL = (value: string): string => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    if (!numbers) return '';
    
    // Converte para número com centavos
    const amount = parseFloat(numbers) / 100;
    
    // Formata para BRL
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Função para converter display para número
  const parseBRL = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return parseFloat(numbers) / 100 || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação
    const newErrors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }
    
    if (!formData.category) {
      newErrors.category = 'Selecione uma categoria';
    }
    
    if (formData.amount <= 0) {
      newErrors.amount = 'Valor deve ser maior que zero';
    }
    
    if (!formData.date) {
      newErrors.date = 'Data é obrigatória';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      description: '',
      type: 'income',
      category: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'PIX',
      reference: '',
      notes: ''
    });
    setDisplayAmount('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Nova Transação</h2>
            <p className="text-sm text-zinc-400">Registre uma entrada ou saída manual</p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Transação */}
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-3 block">Tipo de Transação</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: 'income', category: '' });
                  setErrors({ ...errors, category: '' });
                }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  formData.type === 'income'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-black/20 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold">
                  <DollarSign size={20} />
                  Entrada
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({ ...formData, type: 'expense', category: '' });
                  setErrors({ ...errors, category: '' });
                }}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  formData.type === 'expense'
                    ? 'bg-red-500/10 border-red-500 text-red-500'
                    : 'bg-black/20 border-white/10 text-zinc-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-center gap-2 font-bold">
                  <DollarSign size={20} />
                  Saída
                </div>
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Descrição <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value });
                  setErrors({ ...errors, description: '' });
                }}
                placeholder="Ex: Pagamento de Energia - Janeiro"
                className={`w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-500/50 transition-colors ${
                  errors.description ? 'border-red-500' : 'border-white/10'
                }`}
              />
            </div>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
          </div>

          {/* Categoria e Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Categoria <span className="text-red-500">*</span>
              </label>
              <Select
                value={formData.category}
                onChange={(value) => {
                  setFormData({ ...formData, category: value });
                  setErrors({ ...errors, category: '' });
                }}
                options={[
                  { label: 'Selecione...', value: '' },
                  ...categories[formData.type].map(cat => ({ label: cat, value: cat }))
                ]}
                placeholder="Selecione a categoria"
              />
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Valor <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">R$</span>
                <input
                  type="text"
                  value={displayAmount}
                  onChange={(e) => {
                    const formatted = formatBRL(e.target.value);
                    setDisplayAmount(formatted);
                    const numericValue = parseBRL(formatted);
                    setFormData({ ...formData, amount: numericValue });
                    setErrors({ ...errors, amount: '' });
                  }}
                  placeholder="0,00"
                  className={`w-full pl-14 pr-4 py-3 bg-black/40 border rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-500/50 transition-colors ${
                    errors.amount ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
              )}
            </div>
          </div>

          {/* Data e Método de Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">
                Data <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CalendarIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => {
                    setFormData({ ...formData, date: e.target.value });
                    setErrors({ ...errors, date: '' });
                  }}
                  className={`w-full pl-12 pr-4 py-3 bg-black/40 border rounded-xl text-white focus:outline-none focus:border-accent-500/50 transition-colors ${
                    errors.date ? 'border-red-500' : 'border-white/10'
                  }`}
                />
              </div>
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">{errors.date}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 mb-2 block">Método de Pagamento</label>
              <Select
                value={formData.paymentMethod}
                onChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                options={paymentMethods.map(method => ({ label: method, value: method }))}
              />
            </div>
          </div>

          {/* Referência (opcional) */}
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Referência/Nº do Documento (opcional)</label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Ex: #8492, NF-001234"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>

          {/* Observações (opcional) */}
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-2 block">Observações (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Adicione detalhes extras sobre esta transação..."
              rows={3}
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-500/50 transition-colors resize-none"
            />
          </div>

          {/* Ações */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className={`flex-1 ${
                formData.type === 'income'
                  ? 'bg-emerald-500 hover:bg-emerald-400'
                  : 'bg-red-500 hover:bg-red-400'
              }`}
            >
              Adicionar {formData.type === 'income' ? 'Entrada' : 'Saída'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
