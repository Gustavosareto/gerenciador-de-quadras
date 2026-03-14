"use client";

import { useState, useEffect } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { User } from "@/types";
import { createCustomerAction, updateCustomerAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Phone, User as UserIcon, CreditCard, AlertCircle } from "lucide-react";import { useToast } from "@/components/ui/Toast";
interface CustomerFormDialogProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: User;
    tenantSlug: string;
}

// Máscara para telefone
function applyPhoneMask(value: string): string {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
}

// Máscara para CPF
function applyCPFMask(value: string): string {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4').replace(/-$/, '');
}

// Validação de CPF
function isValidCPF(cpf: string): boolean {
    const numbers = cpf.replace(/\D/g, '');
    if (numbers.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    let digit = remainder >= 10 ? 0 : remainder;
    if (digit !== parseInt(numbers.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    digit = remainder >= 10 ? 0 : remainder;
    if (digit !== parseInt(numbers.charAt(10))) return false;
    
    return true;
}

// Validação de telefone
function isValidPhone(phone: string): boolean {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
}

export function CustomerFormDialog({ isOpen, onClose, initialData, tenantSlug }: CustomerFormDialogProps) {
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Initialize form data with proper defaults to avoid controlled/uncontrolled warning
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone ? applyPhoneMask(initialData.phone) : '',
        cpf: initialData?.cpf ? applyCPFMask(initialData.cpf) : ''
    });
    
    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: ''
    });
    
    const [touched, setTouched] = useState({
        name: false,
        email: false,
        phone: false,
        cpf: false
    });

    // Reset form when dialog opens or initialData changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: initialData?.name ?? '',
                email: initialData?.email ?? '',
                phone: initialData?.phone ? applyPhoneMask(initialData.phone) : '',
                cpf: initialData?.cpf ? applyCPFMask(initialData.cpf) : ''
            });
            setErrors({ name: '', email: '', phone: '', cpf: '' });
            setTouched({ name: false, email: false, phone: false, cpf: false });
        }
    }, [isOpen, initialData]);

    // Validações
    function validateField(name: string, value: string): string {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Nome é obrigatório';
                if (value.trim().length < 3) return 'Nome deve ter pelo menos 3 caracteres';
                if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras';
                return '';
            
            case 'email':
                if (!value.trim()) return 'Email é obrigatório';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
                return '';
            
            case 'phone':
                if (value && !isValidPhone(value)) return 'Telefone inválido';
                return '';
            
            case 'cpf':
                if (value && !isValidCPF(value)) return 'CPF inválido';
                return '';
            
            default:
                return '';
        }
    }

    function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        let maskedValue = value;

        // Aplica máscaras
        if (name === 'phone') {
            maskedValue = applyPhoneMask(value);
        } else if (name === 'cpf') {
            maskedValue = applyCPFMask(value);
        }

        setFormData(prev => ({ ...prev, [name]: maskedValue }));

        // Valida apenas se o campo já foi tocado
        if (touched[name as keyof typeof touched]) {
            const error = validateField(name, maskedValue);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    }

    function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        // Valida todos os campos
        const newErrors = {
            name: validateField('name', formData.name),
            email: validateField('email', formData.email),
            phone: validateField('phone', formData.phone),
            cpf: validateField('cpf', formData.cpf)
        };

        setErrors(newErrors);
        setTouched({ name: true, email: true, phone: true, cpf: true });

        // Verifica se há erros
        if (Object.values(newErrors).some(error => error !== '')) {
            return;
        }

        setIsLoading(true);
        
        const submitFormData = new FormData();
        submitFormData.append('name', formData.name);
        submitFormData.append('email', formData.email);
        submitFormData.append('phone', formData.phone.replace(/\D/g, '')); // Remove máscara
        submitFormData.append('cpf', formData.cpf.replace(/\D/g, '')); // Remove máscara
        
        try {
            if (initialData) {
                const result = await updateCustomerAction(tenantSlug, initialData.id, submitFormData);
                if (result.success) {
                    showToast("Cliente atualizado com sucesso!", "success");
                } else {
                    showToast(result.error || "Erro ao atualizar cliente", "error");
                    return;
                }
            } else {
                const result = await createCustomerAction(tenantSlug, submitFormData);
                if (result.success) {
                    showToast("Cliente cadastrado com sucesso!", "success");
                } else {
                    showToast(result.error || "Erro ao cadastrar cliente", "error");
                    return;
                }
            }
            onClose();
            router.refresh();
        } catch (error) {
            showToast("Erro ao salvar cliente", "error");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog 
            isOpen={isOpen} 
            onClose={onClose} 
            title={initialData ? "Editar Cliente" : "Novo Cliente"}
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">
                        Nome Completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="Ex: Carlos Silva"
                            className={`w-full bg-zinc-800/50 border ${
                                errors.name && touched.name ? 'border-red-500' : 'border-white/10'
                            } rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 ${
                                errors.name && touched.name ? 'focus:ring-red-500/50' : 'focus:ring-primary/50'
                            } placeholder:text-zinc-600`}
                        />
                        {errors.name && touched.name && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                                <AlertCircle className="w-3 h-3" />
                                <span>{errors.name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input 
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            onBlur={handleBlur}
                            placeholder="Ex: carlos@email.com"
                            className={`w-full bg-zinc-800/50 border ${
                                errors.email && touched.email ? 'border-red-500' : 'border-white/10'
                            } rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 ${
                                errors.email && touched.email ? 'focus:ring-red-500/50' : 'focus:ring-primary/50'
                            } placeholder:text-zinc-600`}
                        />
                        {errors.email && touched.email && (
                            <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                                <AlertCircle className="w-3 h-3" />
                                <span>{errors.email}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Phone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">Telefone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input 
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                                className={`w-full bg-zinc-800/50 border ${
                                    errors.phone && touched.phone ? 'border-red-500' : 'border-white/10'
                                } rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 ${
                                    errors.phone && touched.phone ? 'focus:ring-red-500/50' : 'focus:ring-primary/50'
                                } placeholder:text-zinc-600`}
                            />
                            {errors.phone && touched.phone && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{errors.phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CPF */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-400">CPF</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input 
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                className={`w-full bg-zinc-800/50 border ${
                                    errors.cpf && touched.cpf ? 'border-red-500' : 'border-white/10'
                                } rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 ${
                                    errors.cpf && touched.cpf ? 'focus:ring-red-500/50' : 'focus:ring-primary/50'
                                } placeholder:text-zinc-600`}
                            />
                            {errors.cpf && touched.cpf && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-red-500">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{errors.cpf}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {initialData ? "Salvar Alterações" : "Cadastrar Cliente"}
                    </button>
                </div>
            </form>
        </Dialog>
    );
}
