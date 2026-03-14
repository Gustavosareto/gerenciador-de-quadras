"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X, Info, ShieldAlert } from "lucide-react";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Voltar",
    variant = "danger",
    isLoading = false
}: ConfirmDialogProps) {

    const variantStyles = {
        danger: {
            bg: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
            icon: <ShieldAlert className="w-8 h-8 text-red-500" />,
            glow: "bg-red-500/10",
            border: "border-red-500/20"
        },
        warning: {
            bg: "bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20",
            icon: <AlertTriangle className="w-8 h-8 text-yellow-500" />,
            glow: "bg-yellow-500/10",
            border: "border-yellow-500/20"
        },
        info: {
            bg: "bg-accent-500 hover:bg-accent-400 text-black shadow-accent-500/20",
            icon: <Info className="w-8 h-8 text-accent-500" />,
            glow: "bg-accent-500/10",
            border: "border-accent-500/20"
        }
    };

    const style = variantStyles[variant];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-md bg-zinc-950/80 border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Premium Glow Effect */}
                        <div className={`absolute -top-24 -left-24 w-48 h-48 blur-[80px] opacity-20 rounded-full ${style.glow}`} />
                        <div className={`absolute -bottom-24 -right-24 w-48 h-48 blur-[80px] opacity-20 rounded-full ${style.glow}`} />

                        <div className="p-8 relative z-10 flex flex-col items-center text-center">
                            {/* Icon Wrapper */}
                            <div className={`mb-6 p-5 rounded-3xl ${style.glow} border ${style.border} relative group`}>
                                <div className={`absolute inset-0 rounded-3xl blur-md opacity-20 group-hover:opacity-40 transition-opacity ${style.glow}`} />
                                {style.icon}
                            </div>

                            <h2 className="text-2xl font-black text-white italic uppercase tracking-tight mb-3">
                                {title}
                            </h2>

                            <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                                {message}
                            </p>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    disabled={isLoading}
                                    className={`w-full h-14 rounded-2xl font-black uppercase italic tracking-widest transition-all active:scale-[0.98] shadow-lg flex items-center justify-center text-white ${style.bg} disabled:opacity-50`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            Processando...
                                        </div>
                                    ) : confirmText}
                                </button>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="w-full h-12 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                            </div>
                        </div>

                        {/* Close Icon (Top Right) */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
