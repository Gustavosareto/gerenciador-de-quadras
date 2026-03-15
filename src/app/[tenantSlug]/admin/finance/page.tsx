import { prisma } from "@/lib/prisma";
import FinanceClient from "@/components/admin/FinanceClient";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ tenantSlug: string }>;
}

export default async function FinancePage({ params }: PageProps) {
  const { tenantSlug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!company) return notFound();

  // Fetch real ledger entries
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    include: {
      payment: true,
    },
  });

  // Map DB entries to FinanceClient Transaction format
  const transactions = (ledgerEntries as any[]).map((entry: any) => ({
    id: entry.id,
    description:
      entry.description ||
      (entry.type === "CREDIT_RESERVATION"
        ? "Crédito de Reserva"
        : "Transação Financeira"),
    type: entry.direction === "IN" ? ("income" as const) : ("expense" as const),
    category: entry.type.replace(/_/g, " "),
    amount: Number(entry.amount),
    date: entry.createdAt
      ? entry.createdAt.toISOString()
      : new Date().toISOString(),
    paymentMethod: entry.payment?.provider || "Sistema",
    status: "completed" as const, // Ledger entries are usually already completed transactions
    reference: entry.paymentId || entry.payoutId || undefined,
  }));

  // Calculate totals
  const totalBalance = Number(company.balanceAvailable);
  const totalIncome = transactions
    .filter((t: any) => t.type === "income")
    .reduce((sum: number, t: any) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter((t: any) => t.type === "expense")
    .reduce((sum: number, t: any) => sum + t.amount, 0);

  // Placeholder growth
  const monthGrowth = 0;

  return (
    <FinanceClient
      initialTransactions={transactions}
      totalBalance={totalBalance}
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      monthGrowth={monthGrowth}
    />
  );
}
