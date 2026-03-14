import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/Card";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function MyBookingsPage() {
  const tomorrow = addDays(new Date(), 1);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar type="saas" />

      <div className="container mx-auto px-4 pt-32 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8">Minhas Reservas</h1>

        <div className="space-y-4">
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-white/5">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
              <CalendarDays size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Nenhuma reserva encontrada
            </h3>
            <p className="text-zinc-500">
              Você ainda não realizou nenhuma reserva em nossas arenas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
