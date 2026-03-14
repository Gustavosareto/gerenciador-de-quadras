'use client';

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Search,
  Receipt,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select, SelectOption } from '@/components/ui/Select';
import TransactionModal, { TransactionFormData } from './TransactionModal';
import RevenueChart from './RevenueChart';
import CountUp from '@/components/ui/CountUp';

interface Transaction {
  id: string;
  description: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed';
  reference?: string;
}

interface FinanceClientProps {
  initialTransactions: Transaction[];
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  monthGrowth: number;
}

export default function FinanceClient({
  initialTransactions,
  totalBalance,
  totalIncome,
  totalExpense,
  monthGrowth
}: FinanceClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddTransaction = (formData: TransactionFormData) => {
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      description: formData.description,
      type: formData.type,
      category: formData.category,
      amount: formData.amount,
      date: new Date(formData.date).toISOString(),
      paymentMethod: formData.paymentMethod,
      status: 'completed',
      reference: formData.reference
    };

    setTransactions([newTransaction, ...transactions]);
  };

  const categories = {
    income: ['Reservas', 'Aulas', 'Eventos', 'Outros (Receita)'],
    expense: ['Energia', 'Água', 'Salários', 'Manutenção', 'Materiais', 'Marketing', 'Impostos', 'Outros (Despesa)']
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    if (dateRange !== 'all') {
      const now = new Date();
      const days = parseInt(dateRange);
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate);
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm, filterType, filterCategory, dateRange]);

  const periodStats = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = filteredTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return { income, expense, net: income - expense };
  }, [filteredTransactions]);

  const exportToCSV = () => {
    const headers = ['Data', 'Descrição', 'Tipo', 'Categoria', 'Valor', 'Método', 'Status', 'Referência'];
    const rows = filteredTransactions.map(t => [
      new Date(t.date).toLocaleDateString('pt-BR'),
      t.description,
      t.type === 'income' ? 'Entrada' : 'Saída',
      t.category,
      t.amount.toFixed(2),
      t.paymentMethod,
      t.status,
      t.reference || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financeiro_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-1">Financeiro</h1>
          <p className="text-zinc-400 text-sm">Controle completo de fluxo de caixa e relatórios.</p>
        </div>

        <div className="flex gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center gap-2"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Exportar</span>
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2"
          >
            <DollarSign size={18} />
            <span className="hidden sm:inline">Nova Transação</span>
            <span className="sm:hidden">Nova</span>
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="p-5 sm:p-6 bg-zinc-900/40 border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 sm:p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <Wallet size={20} className="text-emerald-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full font-bold border border-emerald-500/30 hidden sm:block">
                Disponível
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mb-1 font-medium">Saldo em Conta</p>
            <h3 className="text-xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              R$ <CountUp to={totalBalance} decimals={2} separator="." />
            </h3>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
              <TrendingUp size={12} />
              {monthGrowth > 0 ? '+' : ''}{monthGrowth.toFixed(1)}%
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 bg-zinc-900/40 border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 sm:p-3 bg-blue-500/20 rounded-xl border border-blue-500/30 shadow-lg shadow-blue-500/10">
                <TrendingUp size={20} className="text-blue-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full font-bold border border-blue-500/30 hidden sm:block">
                {dateRange === '7d' ? '7d' : dateRange === '30d' ? '30d' : dateRange === '90d' ? '90d' : 'Total'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mb-1 font-medium">Entradas</p>
            <h3 className="text-xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              R$ <CountUp to={periodStats.income} decimals={2} separator="." />
            </h3>
            <div className="flex items-center gap-1 text-blue-400 text-xs font-medium">
              <Receipt size={12} />
              {filteredTransactions.filter(t => t.type === 'income').length} tx
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 bg-zinc-900/40 border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 sm:p-3 bg-red-500/20 rounded-xl border border-red-500/30 shadow-lg shadow-red-500/10">
                <TrendingDown size={20} className="text-red-400" />
              </div>
              <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full font-bold border border-red-500/30 hidden sm:block">
                {dateRange === '7d' ? '7d' : dateRange === '30d' ? '30d' : dateRange === '90d' ? '90d' : 'Total'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mb-1 font-medium">Saídas</p>
            <h3 className="text-xl sm:text-3xl font-black text-white mb-2 tracking-tight">
              R$ <CountUp to={periodStats.expense} decimals={2} separator="." />
            </h3>
            <div className="flex items-center gap-1 text-red-400 text-xs font-medium">
              <Receipt size={12} />
              {filteredTransactions.filter(t => t.type === 'expense').length} tx
            </div>
          </div>
        </Card>

        <Card className="p-5 sm:p-6 bg-zinc-900/40 border-white/5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 sm:p-3 rounded-xl border shadow-lg ${periodStats.net >= 0 ? 'bg-purple-500/20 border-purple-500/30 shadow-purple-500/10' : 'bg-orange-500/20 border-orange-500/30 shadow-orange-500/10'}`}>
                <BarChart3 size={20} className={periodStats.net >= 0 ? 'text-purple-400' : 'text-orange-400'} />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-bold border hidden sm:block ${periodStats.net >= 0 ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-orange-500/20 text-orange-400 border-orange-500/30'}`}>
                Balanço
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mb-1 font-medium">Resultado</p>
            <h3 className={`text-xl sm:text-3xl font-black mb-2 tracking-tight ${periodStats.net >= 0 ? 'text-white' : 'text-orange-400'}`}>
              R$ <CountUp to={periodStats.net} decimals={2} separator="." />
            </h3>
            <div className={`flex items-center gap-1 text-xs font-bold ${periodStats.net >= 0 ? 'text-purple-400' : 'text-orange-400'}`}>
              <DollarSign size={12} />
              {((periodStats.income > 0 ? (periodStats.net / periodStats.income) * 100 : 0)).toFixed(1)}% margem
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-sm relative z-20">
        <div className="flex flex-col gap-3">
          {/* Busca — full width */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por descrição ou referência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-500/50 transition-colors"
            />
          </div>

          {/* Selects — row on sm+, grid on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              value={filterType}
              onChange={(value) => setFilterType(value as any)}
              options={[
                { label: 'Todos os Tipos', value: 'all' },
                { label: 'Apenas Entradas', value: 'income' },
                { label: 'Apenas Saídas', value: 'expense' }
              ]}
            />

            <Select
              value={dateRange}
              onChange={(value) => setDateRange(value as any)}
              options={[
                { label: 'Últimos 7 dias', value: '7d' },
                { label: 'Últimos 30 dias', value: '30d' },
                { label: 'Últimos 90 dias', value: '90d' },
                { label: 'Todo o período', value: 'all' }
              ]}
            />

            <Select
              value={filterCategory}
              onChange={(value) => setFilterCategory(value)}
              options={[
                { label: 'Todas Categorias', value: 'all' },
                ...(filterType !== 'expense' ? categories.income.map(cat => ({ label: cat, value: cat })) : []),
                ...(filterType !== 'income' ? categories.expense.map(cat => ({ label: cat, value: cat })) : [])
              ]}
            />
          </div>
        </div>
      </div>

      {/* Gráfico de Receitas */}
      <RevenueChart
        transactions={filteredTransactions}
        period={dateRange === 'all' ? '30d' : dateRange}
      />

      {/* Lista de Transações */}
      <div className="p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-zinc-900/40 border border-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-white">
            Transações {filteredTransactions.length > 0 && `(${filteredTransactions.length})`}
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt size={32} className="text-zinc-700" />
            </div>
            <p className="text-zinc-400 mb-2">Nenhuma transação encontrada</p>
            <p className="text-sm text-zinc-600">Tente ajustar os filtros ou adicione uma nova transação</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-black/20 border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 ${transaction.type === 'income'
                    ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-black'
                    : 'bg-red-500/5 border-red-500/10 text-red-500 group-hover:bg-red-500 group-hover:text-white'
                    }`}>
                    {transaction.type === 'income' ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white mb-0.5 truncate">{transaction.description}</p>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(transaction.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                      <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="hidden sm:inline">{transaction.paymentMethod}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 truncate max-w-[80px] sm:max-w-none">{transaction.category}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2 flex-shrink-0 ml-2">
                  {transaction.status !== 'completed' && (
                    <span className={`text-xs px-2 py-1 rounded-full font-medium hidden sm:block ${transaction.status === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                      : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                      {transaction.status === 'pending' ? 'Pendente' : 'Falhou'}
                    </span>
                  )}
                  <p className={`text-base sm:text-lg font-black whitespace-nowrap ${transaction.type === 'income' ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Adicionar Transação */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddTransaction}
      />
    </div>
  );
}
