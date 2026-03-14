import { Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
    type?: 'badge' | 'icon' | 'text';
    className?: string;
}

export function PremiumBadge({ type = 'badge', className }: PremiumBadgeProps) {
    if (type === 'icon') {
        return <Lock size={12} className={cn("text-amber-400", className)} />;
    }

    if (type === 'text') {
        return (
            <span className={cn("text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1", className)}>
                <Crown size={10} /> Pro
            </span>
        );
    }

    // Default 'badge'
    return (
        <div className={cn(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(251,191,36,0.1)]",
            className
        )}>
            <Lock size={8} /> Pro
        </div>
    );
}
