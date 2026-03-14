'use client';

import { useState, useEffect } from 'react';
import { User, FileText, Phone, AlertCircle } from 'lucide-react';

interface CustomerData {
    name: string;
    document: string;
    phone: string;
}

interface CustomerDataStepProps {
    customerData: CustomerData;
    onUpdateData: (data: CustomerData) => void;
}

export default function CustomerDataStep({ customerData, onUpdateData }: CustomerDataStepProps) {
    const [formData, setFormData] = useState<CustomerData>(customerData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [documentType, setDocumentType] = useState<'cpf' | 'cnpj'>('cpf');

    // Validações
    const validateCPF = (cpf: string): boolean => {
        cpf = cpf.replace(/[^\d]/g, '');

        if (cpf.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(cpf)) return false;

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let mod = 11 - (sum % 11);
        if (mod === 10 || mod === 11) mod = 0;
        if (mod !== parseInt(cpf.charAt(9))) return false;

        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        mod = 11 - (sum % 11);
        if (mod === 10 || mod === 11) mod = 0;
        if (mod !== parseInt(cpf.charAt(10))) return false;

        return true;
    };

    const validateCNPJ = (cnpj: string): boolean => {
        cnpj = cnpj.replace(/[^\d]/g, '');

        if (cnpj.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(cnpj)) return false;

        let size = cnpj.length - 2;
        let numbers = cnpj.substring(0, size);
        const digits = cnpj.substring(size);
        let sum = 0;
        let pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result !== parseInt(digits.charAt(0))) return false;

        size = size + 1;
        numbers = cnpj.substring(0, size);
        sum = 0;
        pos = size - 7;

        for (let i = size; i >= 1; i--) {
            sum += parseInt(numbers.charAt(size - i)) * pos--;
            if (pos < 2) pos = 9;
        }

        result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
        if (result !== parseInt(digits.charAt(1))) return false;

        return true;
    };

    // Máscaras
    const maskCPF = (value: string): string => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .slice(0, 14);
    };

    const maskCNPJ = (value: string): string => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1/$2')
            .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
            .slice(0, 18);
    };

    const maskPhone = (value: string): string => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4,5})(\d{4})$/, '$1-$2')
            .slice(0, 15);
    };

    const handleDocumentChange = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        const newType = cleaned.length <= 11 ? 'cpf' : 'cnpj';
        setDocumentType(newType);

        const masked = newType === 'cpf' ? maskCPF(value) : maskCNPJ(value);

        setFormData(prev => ({ ...prev, document: masked }));
        if (errors.document) {
            setErrors(prev => ({ ...prev, document: '' }));
        }
    };

    const handlePhoneChange = (value: string) => {
        const masked = maskPhone(value);
        setFormData(prev => ({ ...prev, phone: masked }));
        if (errors.phone) {
            setErrors(prev => ({ ...prev, phone: '' }));
        }
    };

    const handleNameChange = (value: string) => {
        setFormData(prev => ({ ...prev, name: value }));
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: '' }));
        }
    };

    const handleBlur = (field: string) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Nome é obrigatório';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Nome deve ter no mínimo 3 caracteres';
        }

        if (!formData.document.trim()) {
            newErrors.document = 'CPF/CNPJ é obrigatório';
        } else {
            const cleaned = formData.document.replace(/\D/g, '');
            if (documentType === 'cpf') {
                if (!validateCPF(cleaned)) {
                    newErrors.document = 'CPF inválido';
                }
            } else {
                if (!validateCNPJ(cleaned)) {
                    newErrors.document = 'CNPJ inválido';
                }
            }
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Telefone é obrigatório';
        } else {
            const cleaned = formData.phone.replace(/\D/g, '');
            if (cleaned.length < 10) {
                newErrors.phone = 'Telefone inválido';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Atualiza os dados no componente pai com debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (validateForm()) {
                onUpdateData(formData);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Seus Dados</h2>
                <p className="text-zinc-400">Precisamos de algumas informações para finalizar</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Nome Completo */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 ml-1">
                        <User size={16} className="text-accent-500" />
                        Nome Completo
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="Digite seu nome completo"
                        className={`w-full bg-black/20 border-2 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none focus:ring-2 transition-all ${touched.name && errors.name
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-white/10 focus:border-accent-500/50 focus:ring-accent-500/20'
                            }`}
                    />
                    {touched.name && errors.name && (
                        <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                            <AlertCircle size={14} />
                            <span>{errors.name}</span>
                        </div>
                    )}
                </div>

                {/* CPF/CNPJ */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 ml-1">
                        <FileText size={16} className="text-accent-500" />
                        CPF ou CNPJ
                    </label>
                    <input
                        type="text"
                        value={formData.document}
                        onChange={(e) => handleDocumentChange(e.target.value)}
                        onBlur={() => handleBlur('document')}
                        placeholder="000.000.000-00"
                        className={`w-full bg-black/20 border-2 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none focus:ring-2 transition-all ${touched.document && errors.document
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-white/10 focus:border-accent-500/50 focus:ring-accent-500/20'
                            }`}
                    />
                    {touched.document && errors.document && (
                        <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                            <AlertCircle size={14} />
                            <span>{errors.document}</span>
                        </div>
                    )}
                    <p className="text-xs text-zinc-500 ml-1">
                        {documentType === 'cpf' ? 'Formato CPF detectado' : 'Formato CNPJ detectado'}
                    </p>
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300 ml-1">
                        <Phone size={16} className="text-accent-500" />
                        Telefone/WhatsApp
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        onBlur={() => handleBlur('phone')}
                        placeholder="(00) 00000-0000"
                        className={`w-full bg-black/20 border-2 rounded-xl px-5 py-4 text-white placeholder:text-zinc-600 outline-none focus:ring-2 transition-all ${touched.phone && errors.phone
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                                : 'border-white/10 focus:border-accent-500/50 focus:ring-accent-500/20'
                            }`}
                    />
                    {touched.phone && errors.phone && (
                        <div className="flex items-center gap-2 text-red-500 text-sm mt-2">
                            <AlertCircle size={14} />
                            <span>{errors.phone}</span>
                        </div>
                    )}
                    <p className="text-xs text-zinc-500 ml-1">
                        Usaremos apenas para contato sobre sua reserva
                    </p>
                </div>

                {/* Info Box */}
                <div className="mt-8 p-4 bg-accent-500/5 border border-accent-500/20 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="text-accent-500 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-zinc-300">
                            <p className="font-semibold mb-1">Seus dados estão seguros</p>
                            <p className="text-zinc-400">
                                Utilizamos seus dados apenas para processar a reserva e enviar confirmações.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
