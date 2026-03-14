import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import PlanClient from "./PlanClient";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;

  // Auth Check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirectTo=/${tenantSlug}/admin/plan`);

  const company = await prisma.company.findUnique({
    where: { slug: tenantSlug },
  });

  if (!company) return <div>Tenant não encontrado</div>;

  // Verifica se o usuário é o dono da arena
  if (company.ownerId !== user.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Acesso Restrito</h1>
        <p className="text-zinc-500">
          Apenas o proprietário da arena pode gerenciar o plano de assinatura.
        </p>
      </div>
    );
  }

  // Convert decimal to number for easier prop passing if needed,
  // but here we just pass the company object.
  const companyData = {
    ...company,
    convenienceFeeValue: Number(company.convenienceFeeValue),
    balanceAvailable: Number(company.balanceAvailable),
    balancePending: Number(company.balancePending),
  };

  return (
    <PlanClient
      company={companyData as any}
      plans={PLANS}
      tenantSlug={tenantSlug}
      userEmail={user.email}
    />
  );
}
