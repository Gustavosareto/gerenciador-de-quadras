"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    label?: string;
    className?: string;
    disabled?: boolean;
}

export function Select({ 
    value, 
    onChange, 
    options, 
    placeholder = "Selecione...", 
    label,
    className,
    disabled = false
}: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={cn("relative space-y-2", className)} ref={containerRef}>
            {label && (
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 block">
                    {label}
                </label>
            )}
            
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={cn(
                    "w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-200 group border text-left",
                    "bg-black/20 border-white/10 text-white",
                    "hover:bg-white/[0.03] hover:border-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500/50",
                    isOpen && "border-accent-500/50 bg-black/40 shadow-[0_0_20px_-10px_rgba(202,255,51,0.3)]",
                    disabled && "opacity-50 cursor-not-allowed hover:bg-black/20 hover:border-white/10"
                )}
            >
                <span className={cn("block truncate", !selectedOption && "text-zinc-500")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown 
                    size={16} 
                    className={cn(
                        "text-zinc-500 transition-transform duration-300",
                        isOpen && "rotate-180 text-accent-500",
                        !isOpen && "group-hover:text-zinc-300"
                    )} 
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-[9999] w-full mt-2 overflow-hidden bg-[#121214] border border-white/10 rounded-xl shadow-xl backdrop-blur-xl ring-1 ring-black/20"
                    >
                        <div className="max-h-[240px] overflow-auto py-1 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                            {options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={cn(
                                        "w-full flex items-center justify-between px-4 py-3 text-sm transition-colors",
                                        "hover:bg-white/5",
                                        option.value === value 
                                            ? "text-accent-500 bg-accent-500/10 font-medium" 
                                            : "text-zinc-300"
                                    )}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {option.value === value && (
                                        <Check size={14} className="text-accent-500" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
