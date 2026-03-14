import * as React from "react"
import { cn } from "@/lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {

        // Base styles from .ag-btn
        const baseStyles = "relative inline-flex items-center justify-center rounded-2xl font-bold tracking-wide transition-all duration-300 shadow-lg active:scale-95 active:translate-y-0 hover:-translate-y-0.5 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed group";

        const variants = {
            // .ag-btn-primary (Fluorescent Green)
            primary: "bg-accent-500 text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:bg-accent-400",
            // .ag-btn-secondary
            secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
            // .ag-btn-outline
            outline: "bg-transparent border-2 border-accent-500 text-accent-500 hover:bg-accent-500 hover:text-black shadow-none",
            // .ag-btn-ghost
            ghost: "bg-white/5 text-white hover:bg-white/10 shadow-none hover:translate-y-0",
            // .ag-btn-danger
            danger: "bg-gradient-to-br from-danger-500 to-red-600 text-white shadow-danger-500/30",
        };

        const sizes = {
            sm: "h-9 px-4 text-sm rounded-xl",   // .ag-btn-sm
            md: "h-[50px] px-8 text-base",       // Standard
            lg: "h-[60px] px-10 text-lg rounded-[20px]", // .ag-btn-lg
            icon: "h-10 w-10 p-0 rounded-xl",
        };

        return (
            <button
                ref={ref}
                disabled={isLoading || disabled}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {/* Shine Effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

                {isLoading ? (
                    <span className="animate-spin mr-2">⏳</span>
                ) : null}

                <span className="relative z-10 flex items-center gap-2">
                    {children}
                </span>
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
