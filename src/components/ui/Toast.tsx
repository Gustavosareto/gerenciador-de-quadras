"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }
    return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (message: string, type: ToastType = "info") => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[200] space-y-2 max-w-md">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons = {
        success: CheckCircle2,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
    };

    const styles = {
        success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
        error: "bg-red-500/10 border-red-500/20 text-red-500",
        warning: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
        info: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    };

    const Icon = icons[toast.type];

    return (
        <div
            className={cn(
                "flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-in slide-in-from-right duration-300",
                styles[toast.type]
            )}
        >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium text-white">{toast.message}</p>
            <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
                <X size={16} />
            </button>
        </div>
    );
}
