"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Trophy,
    CalendarDays,
    Settings,
    LogOut,
    Users,
    Wallet,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { UpgradeModal } from "@/components/admin/UpgradeModal";
import { PremiumBadge } from "@/components/ui/PremiumBadge";

interface AdminSidebarProps {
    tenantSlug: string;
    isPro?: boolean;
}

export function AdminSidebar({ tenantSlug, isPro = false }: AdminSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
    const [blockedFeature, setBlockedFeature] = useState("");

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMobileOpen]);

    const links: {
        icon: any;
        label: string;
        href: string;
        dataTour?: string;
        isPremium?: boolean;
    }[] = [
            { icon: LayoutDashboard, label: "Dashboard", href: `/${tenantSlug}/admin` },
            { icon: CalendarDays, label: "Reservas", href: `/${tenantSlug}/admin/bookings` },
            { icon: Trophy, label: "Quadras", href: `/${tenantSlug}/admin/courts` },
            { icon: Users, label: "Clientes", href: `/${tenantSlug}/admin/customers` },
            { icon: Wallet, label: "Financeiro", href: `/${tenantSlug}/admin/finance` },
            { icon: Settings, label: "Configurações", href: `/${tenantSlug}/admin/settings`, dataTour: "settings" },
        ];

    const handleLinkClick = (e: React.MouseEvent, link: any) => {
        if (link.isPremium && !isPro) {
            e.preventDefault();
            setBlockedFeature(link.label);
            setUpgradeModalOpen(true);
        }
    };

    const navContent = (
        <>
            {/* Header */}
            <div className="h-24 flex items-center justify-between px-6 border-b border-white/5">
                <div className={cn(
                    "flex flex-col transition-opacity duration-200",
                    isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}>
                    <span className="font-bold text-xl tracking-tighter text-white whitespace-nowrap">
                        ADMINISTRATIVO
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-accent-500 font-semibold whitespace-nowrap">
                        Painel de Gestão
                    </span>
                </div>

                {/* Desktop collapse toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "p-2 rounded-lg bg-white/5 hover:bg-accent-500/10 text-zinc-400 hover:text-accent-500 transition-all hidden lg:flex",
                        isCollapsed && "mx-auto"
                    )}
                    title={isCollapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                {/* Mobile close button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white transition-all lg:hidden"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                {!isCollapsed && (
                    <div className="px-4 mb-4">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Menu Principal</p>
                    </div>
                )}

                {links.map((link) => {
                    const isActive = pathname === link.href || (link.href !== `/${tenantSlug}/admin` && pathname.startsWith(link.href));

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={(e) => handleLinkClick(e, link)}
                            {...(link.dataTour ? { "data-tour": link.dataTour } : {})}
                            className={cn(
                                "group flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                                !isCollapsed && "border-l-4",
                                isActive && !isCollapsed
                                    ? "text-white bg-white/10 border-[rgb(204,255,0)] translate-x-1"
                                    : !isCollapsed && "text-zinc-400 border-transparent hover:text-white hover:bg-white/5 hover:translate-x-1",
                                isCollapsed && "justify-center px-2",
                                link.isPremium && !isPro && "opacity-80 hover:opacity-100"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg transition-all flex-shrink-0 relative",
                                isActive
                                    ? "bg-[rgb(204,255,0)]/10 text-[rgb(204,255,0)] ring-2 ring-[rgb(204,255,0)]/30"
                                    : "bg-zinc-900/50 text-zinc-400 group-hover:bg-accent-500/10 group-hover:text-accent-500"
                            )}>
                                <link.icon size={18} />
                                {link.isPremium && !isPro && isCollapsed && (
                                    <div className="absolute -top-1 -right-1">
                                        <PremiumBadge type="icon" className="text-amber-400 drop-shadow-md" />
                                    </div>
                                )}
                            </div>

                            <span className={cn(
                                "transition-all duration-200 whitespace-nowrap flex items-center justify-between flex-1",
                                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100",
                                !isCollapsed && isActive && "text-white"
                            )}>
                                {link.label}
                                {link.isPremium && !isPro && (
                                    <PremiumBadge type="badge" />
                                )}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-white/5 bg-black/20">
                <Link href="/">
                    <button className={cn(
                        "flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all group",
                        isCollapsed && "justify-center px-2"
                    )}>
                        <LogOut size={18} className="group-hover:translate-x-[-2px] transition-transform flex-shrink-0" />
                        <span className={cn(
                            "transition-all duration-200 whitespace-nowrap",
                            isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                        )}>
                            Sair do Painel
                        </span>
                    </button>
                </Link>
            </div>
        </>
    );

    return (
        <>
            <UpgradeModal
                isOpen={upgradeModalOpen}
                onClose={() => setUpgradeModalOpen(false)}
                featureName={blockedFeature}
                tenantSlug={tenantSlug}
            />

            {/* Mobile hamburger — fixed top-left, only on mobile */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-[60] p-2.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white lg:hidden shadow-lg"
                aria-label="Abrir menu"
            >
                <Menu size={20} />
            </button>

            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                data-tour="sidebar"
                className={cn(
                    "fixed left-0 top-0 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col z-50 transition-all duration-300 ease-in-out",
                    // Mobile: full-width drawer, slides in/out
                    "w-72",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop: always visible, respects collapsed state
                    "lg:translate-x-0",
                    isCollapsed ? "lg:w-20" : "lg:w-72"
                )}
            >
                {navContent}
            </aside>
        </>
    );
}
