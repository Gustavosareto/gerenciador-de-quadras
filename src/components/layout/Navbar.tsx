import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { User, Trophy } from "lucide-react";

interface NavbarProps {
    type?: 'saas' | 'tenant';
    tenantName?: string;
    logoUrl?: string;
}

export function Navbar({ type = 'saas', tenantName }: NavbarProps) {
    return (
        <nav className="fixed top-0 w-full z-50 bg-transparent backdrop-blur-[2px] border-b border-white/5 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_15px_rgba(204,255,0,0.5)] group-hover:scale-110 transition-transform duration-300">
                        <Trophy size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-extrabold text-2xl tracking-tighter text-white group-hover:text-accent-500 transition-colors">
                        {type === 'tenant' ? tenantName : 'Agendouu'}
                    </span>
                </Link>

                <div className="flex items-center gap-8">
                    {/* Navigation Links (Desktop) - Styled like ag-nav-link */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/#funcionalidades" className="font-semibold text-neutral-300 hover:text-accent-500 transition-colors relative group py-2">
                            Funcionalidades
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 transition-all duration-300 group-hover:w-full box-shadow-[0_0_10px_#ccff00]" />
                        </Link>
                        <Link href="/#planos" className="font-semibold text-neutral-300 hover:text-accent-500 transition-colors relative group py-2">
                            Planos
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent-500 transition-all duration-300 group-hover:w-full" />
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {type === 'saas' ? (
                            <>
                                <Link href="/login" className="font-semibold text-neutral-300 hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link href="/register">
                                    <Button size="sm" variant="primary">Criar Conta</Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/my-bookings" className="font-semibold text-neutral-300 hover:text-white transition-colors">
                                    Minhas Reservas
                                </Link>
                                <Link href="/profile">
                                    <Button variant="ghost" size="icon">
                                        <User size={20} />
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
