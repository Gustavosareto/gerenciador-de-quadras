'use client';

import { useMemo, useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, BarChart2 } from 'lucide-react';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

interface RevenueChartProps {
  transactions: Array<{
    date: string | Date;
    type: 'income' | 'expense';
    amount: number;
    status: 'completed' | 'pending' | 'failed';
  }>;
  period: '7d' | '30d' | '90d';
}

interface ChartData {
  date: Date;
  dateStr: string;
  fullDate: string;
  income: number;
  expense: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0E1113] border border-zinc-800 p-4 rounded-xl shadow-2xl min-w-[200px] z-50">
        <p className="text-zinc-400 text-xs mb-3 font-medium uppercase tracking-wider">{label}</p>
        <div className="space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm font-medium text-zinc-300">
                  {entry.name === 'income' ? 'Entradas' : 'Saídas'}
                </span>
              </div>
              <span className="text-sm font-bold text-white font-mono">
                {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ transactions, period }: RevenueChartProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isMounted, setIsMounted] = useState(false);

  // Evita erros de hidratação renderizando o gráfico apenas no cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    const days = parseInt(period.replace('d', ''));
    const data: ChartData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      data.push({
        date,
        dateStr: format(date, days <= 7 ? 'EEE' : 'dd', { locale: ptBR }),
        fullDate: format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR }),
        income: 0,
        expense: 0
      });
    }

    transactions
      .filter(t => t.status === 'completed')
      .forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        transactionDate.setHours(0, 0, 0, 0);
        
        const dayData = data.find(d => 
          d.date.getTime() === transactionDate.getTime()
        );
        
        if (dayData) {
          if (transaction.type === 'income') {
            dayData.income += transaction.amount;
          } else {
            dayData.expense += transaction.amount;
          }
        }
      });

    return data;
  }, [transactions, period]);

  const { maxIncome, maxExpense, totalIncome, totalExpense } = useMemo(() => {
    let maxInc = 0;
    let maxExp = 0;
    let totInc = 0;
    let totExp = 0;

    chartData.forEach(d => {
      if (d.income > maxInc) maxInc = d.income;
      if (d.expense > maxExp) maxExp = d.expense;
      totInc += d.income;
      totExp += d.expense;
    });

    return { maxIncome: maxInc, maxExpense: maxExp, totalIncome: totInc, totalExpense: totExp };
  }, [chartData]);

  if (!isMounted) {
    return (
        <div className="w-full h-[600px] bg-[#0B0F0E] border border-white/5 rounded-3xl animate-pulse flex items-center justify-center">
             <div className="text-zinc-500 text-sm">Carregando gráfico...</div>
        </div>
    );
  }

  return (
    <div className="w-full bg-[#0B0F0E] border border-white/5 rounded-3xl p-6 md:p-8 shadow-inner overflow-hidden flex flex-col h-full min-h-[600px]">
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <BarChart2 className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-tight">Fluxo de Caixa</h3>
          </div>
          <div className="flex items-center gap-6 text-sm ml-1">
            <div className="flex items-center gap-2.5 group">
               <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]"></span>
               <span className="text-zinc-400 font-medium">Entradas:</span>
               <span className="text-white font-semibold font-mono">{formatCurrency(totalIncome)}</span>
            </div>
            <div className="flex items-center gap-2.5 group">
               <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"></span>
               <span className="text-zinc-400 font-medium">Saídas:</span>
               <span className="text-white font-semibold font-mono">{formatCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-900/50 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
            <button 
                onClick={() => setFilter('all')}
                className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200",
                    filter === 'all' 
                        ? "bg-white/10 text-white shadow-sm" 
                        : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
            >
                Visão Geral
            </button>
            <button 
                onClick={() => setFilter('income')}
                className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2",
                    filter === 'income' 
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                        : "text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/5"
                )}
            >
                <ArrowUp size={14} />
                Entradas
            </button>
            <button 
                onClick={() => setFilter('expense')}
                className={cn(
                    "px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 flex items-center gap-2",
                    filter === 'expense' 
                        ? "bg-red-500/10 text-red-500 border border-red-500/20" 
                        : "text-zinc-500 hover:text-red-500 hover:bg-red-500/5"
                )}
            >
                <ArrowDown size={14} />
                Saídas
            </button>
        </div>
      </div>

      <div className="flex-1 w-full relative min-h-[450px]">
        {/* Renderiza o chart somente se montado */}
        {isMounted ? (
            <ResponsiveContainer width="100%" height={450}>
            <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: 0, bottom: 0 }}
                barGap={4}
                barCategoryGap="20%"
            >
                <CartesianGrid 
                    vertical={false} 
                    stroke="#27272a" 
                    strokeDasharray="4 4" 
                    opacity={0.3} 
                />
                
                <XAxis 
                    dataKey="dateStr" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                    dy={16}
                    padding={{ left: 10, right: 10 }}
                />
                
                <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `R$ ${value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value}`}
                    dx={-10}
                />
                
                <Tooltip 
                    cursor={{ fill: '#ffffff', opacity: 0.03 }}
                    content={<CustomTooltip />}
                />

                {(filter === 'all' || filter === 'income') && (
                    <Bar 
                        dataKey="income" 
                        name="income"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={120}
                        style={{ filter: 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.15))' }}
                    >
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-income-${index}`} 
                                fill={entry.income === maxIncome && maxIncome > 0 ? '#4ADE80' : '#22C55E'}
                                stroke={entry.income === maxIncome && maxIncome > 0 ? '#bbf7d0' : 'none'}
                                strokeWidth={entry.income === maxIncome && maxIncome > 0 ? 2 : 0}
                                fillOpacity={1}
                            />
                        ))}
                    </Bar>
                )}

                {(filter === 'all' || filter === 'expense') && (
                    <Bar 
                        dataKey="expense" 
                        name="expense"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={120}
                        style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.15))' }}
                    >
                        {chartData.map((entry, index) => (
                            <Cell 
                                key={`cell-expense-${index}`} 
                                fill={entry.expense === maxExpense && maxExpense > 0 ? '#F87171' : '#EF4444'}
                                stroke={entry.expense === maxExpense && maxExpense > 0 ? '#fecaca' : 'none'}
                                strokeWidth={entry.expense === maxExpense && maxExpense > 0 ? 2 : 0}
                                fillOpacity={1}
                            />
                        ))}
                    </Bar>
                )}

            </BarChart>
            </ResponsiveContainer>
        ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                Carregando dados do gráfico...
            </div>
        )}
      </div>
    </div>
  );
}
