import { AdminSidebar } from "@/components/layout/AdminSidebar";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ tenantSlug: string }>;
}

export default async function AdminLayout({ children, params }: LayoutProps) {
  const { tenantSlug } = await params;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-accent-500/30">
      {/* Ambient Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-accent-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <AdminSidebar tenantSlug={tenantSlug} />

      {/* On mobile: no left padding (sidebar is a drawer overlay).
          On desktop: pl-72 (sidebar expanded) or pl-20 (sidebar collapsed via CSS var is not available here,
          so keeping pl-72 as default since collapsed state lives in client component) */}
      <main className="relative z-10 min-h-screen transition-all duration-300 ease-in-out pl-0 lg:pl-72 overflow-x-hidden">
        <div className="container p-4 pt-16 sm:p-6 sm:pt-8 lg:p-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
