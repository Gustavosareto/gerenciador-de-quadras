'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Trophy, Calendar, User, CreditCard, PartyPopper, Instagram, Mail, Phone, Clock, MapPin } from 'lucide-react';
import CourtSelectionStep from './steps/CourtSelectionStep';
import DateTimeSelectionStep from './steps/DateTimeSelectionStep';
import CustomerDataStep from './steps/CustomerDataStep';
import PaymentStep from './steps/PaymentStep';
import ConfirmationStep from './steps/ConfirmationStep';

import { Tenant, Court } from '@/types';

interface PublicBookingFlowProps {
    tenant: Tenant;
    courts: Court[];
    tenantSlug: string;
    initialCourtId?: string; // New prop
}

interface BookingData {
    courtId: string | null;
    courtName: string;
    courtPrice: number;
    date: Date | null;
    time: string | null;
    duration: number; // in hours
    customerName: string;
    customerDocument: string;
    customerPhone: string;
    paymentStatus: 'pending' | 'processing' | 'confirmed' | 'failed';
    paymentId: string;
    pixCode: string;
    bookingCode: string;
}

const steps = [
    { id: 1, title: 'Escolha a Quadra', icon: Trophy },
    { id: 2, title: 'Data e Horário', icon: Calendar },
    { id: 3, title: 'Seus Dados', icon: User },
    { id: 4, title: 'Pagamento', icon: CreditCard },
    { id: 5, title: 'Confirmação', icon: PartyPopper },
];

export default function PublicBookingFlow({ tenant, courts, tenantSlug, initialCourtId }: PublicBookingFlowProps) {
    // Determine initial state based on initialCourtId
    const initialCourt = initialCourtId ? courts.find(c => c.id === initialCourtId) : null;

    // If court is pre-selected, start at step 2
    const [currentStep, setCurrentStep] = useState(initialCourt ? 2 : 1);

    const [bookingData, setBookingData] = useState<BookingData>({
        courtId: initialCourt?.id || null,
        courtName: initialCourt?.name || '',
        courtPrice: initialCourt?.hourlyRate || 0,
        date: null,
        time: null,
        duration: 1,
        customerName: '',
        customerDocument: '',
        customerPhone: '',
        paymentStatus: 'pending',
        paymentId: '',
        pixCode: '',
        bookingCode: ''
    });

    // Company ID do tenant
    const companyId = tenant.id;

    const updateBookingData = (data: Partial<BookingData>) => {
        setBookingData(prev => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        setCurrentStep(prev => (prev < 5 ? prev + 1 : prev));
    };

    const previousStep = () => {
        setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));
    };

    const canProceedToNextStep = () => {
        switch (currentStep) {
            case 1:
                return bookingData.courtId !== null;
            case 2:
                return bookingData.date !== null && bookingData.time !== null;
            case 3:
                return bookingData.customerName && bookingData.customerDocument && bookingData.customerPhone;
            case 4:
                return bookingData.paymentStatus === 'confirmed';
            default:
                return false;
        }
    };

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 flex flex-col items-center">
                    {tenant.logo && (
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-accent-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-zinc-900 flex items-center justify-center">
                                <img
                                    src={tenant.logo}
                                    alt={tenant.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}
                    <h1 className="text-5xl font-black text-white mb-2 tracking-tighter uppercase italic drop-shadow-sm">
                        {tenant.name}
                    </h1>
                    <p className="text-zinc-400 text-lg font-medium opacity-80">Agende sua quadra em poucos passos</p>

                    {/* Contact info and Hours */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-zinc-500 mb-8 border-t border-white/5 pt-8 w-full max-w-4xl">
                        {tenant.address && (
                            <div className="flex items-center gap-2 hover:text-accent-500 transition-colors">
                                <MapPin size={16} className="text-accent-500" />
                                <span>{tenant.address}</span>
                            </div>
                        )}
                        {tenant.whatsapp && (
                            <div className="flex items-center gap-2 hover:text-accent-500 transition-colors">
                                <Phone size={16} className="text-accent-500" />
                                <span>{tenant.whatsapp}</span>
                            </div>
                        )}
                        {tenant.instagram && (
                            <div className="flex items-center gap-2 hover:text-accent-500 transition-colors">
                                <Instagram size={16} className="text-accent-500" />
                                <span>{tenant.instagram}</span>
                            </div>
                        )}
                        {tenant.email && (
                            <div className="flex items-center gap-2 hover:text-accent-500 transition-colors">
                                <Mail size={16} className="text-accent-500" />
                                <span>{tenant.email}</span>
                            </div>
                        )}
                        {tenant.openingHours && (
                            <div className="flex items-center gap-2 bg-accent-500/10 px-4 py-2 rounded-full border border-accent-500/20 text-accent-500">
                                <Clock size={16} />
                                <span className="font-bold">Aberto: {tenant.openingHours.open} às {tenant.openingHours.close}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="mb-12">
                    <div className="flex items-center justify-between max-w-4xl mx-auto">
                        {steps.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = currentStep > step.id;
                            const isCurrent = currentStep === step.id;

                            return (
                                <div key={step.id} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center flex-1">
                                        <div
                                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
                                                ? 'bg-accent-500 text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]'
                                                : isCurrent
                                                    ? 'bg-white text-black shadow-xl'
                                                    : 'bg-zinc-800 text-zinc-500'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <Check size={24} className="font-bold" />
                                            ) : (
                                                <StepIcon size={24} />
                                            )}
                                        </div>
                                        <p className={`text-xs font-medium mt-3 text-center hidden sm:block ${isCurrent ? 'text-white' : 'text-zinc-500'
                                            }`}>
                                            {step.title}
                                        </p>
                                    </div>

                                    {index < steps.length - 1 && (
                                        <div className={`h-0.5 flex-1 mx-2 transition-all duration-300 ${isCompleted ? 'bg-accent-500' : 'bg-zinc-800'
                                            }`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-zinc-900/60 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        {currentStep === 1 && (
                            <CourtSelectionStep
                                courts={courts}
                                tenantAddress={tenant.address}
                                selectedCourtId={bookingData.courtId}
                                onSelectCourt={(court) => updateBookingData({
                                    courtId: court.id,
                                    courtName: court.name,
                                    courtPrice: court.hourlyRate,
                                    duration: 1 // Reset duration when court changes
                                })}
                            />
                        )}

                        {currentStep === 2 && (
                            <DateTimeSelectionStep
                                courtId={bookingData.courtId!}
                                tenantSlug={tenantSlug}
                                selectedDate={bookingData.date}
                                selectedTime={bookingData.time}
                                selectedDuration={bookingData.duration}
                                court={courts.find(c => c.id === bookingData.courtId)! as any}
                                openingHours={tenant.openingHours}
                                onSelectDateTime={(date: Date, time: string, duration?: number) => updateBookingData({
                                    date,
                                    time,
                                    duration: duration ?? bookingData.duration
                                })}
                            />
                        )}

                        {currentStep === 3 && (
                            <CustomerDataStep
                                customerData={{
                                    name: bookingData.customerName,
                                    document: bookingData.customerDocument,
                                    phone: bookingData.customerPhone
                                }}
                                onUpdateData={(data: { name: string; document: string; phone: string }) => updateBookingData({
                                    customerName: data.name,
                                    customerDocument: data.document,
                                    customerPhone: data.phone
                                })}
                            />
                        )}

                        {currentStep === 4 && (
                            <PaymentStep
                                courtPrice={bookingData.courtPrice * bookingData.duration}
                                bookingData={bookingData as any}
                                companyId={companyId}
                                onPaymentConfirm={(paymentId: string, pixCode: string) => {
                                    const uniqueCode = `RES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                                    updateBookingData({
                                        paymentStatus: 'confirmed',
                                        paymentId,
                                        pixCode,
                                        bookingCode: uniqueCode
                                    });
                                    nextStep();
                                }}
                            />
                        )}

                        {currentStep === 5 && (
                            <ConfirmationStep
                                bookingData={bookingData}
                                tenantName={tenant.name}
                                bookingCode={bookingData.bookingCode}
                            />
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    {currentStep < 5 && (
                        <div className="px-8 md:px-12 pb-8 flex items-center justify-between gap-4">
                            {currentStep > 1 ? (
                                <button
                                    onClick={previousStep}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl flex items-center gap-2 transition-all"
                                >
                                    <ArrowLeft size={20} />
                                    Voltar
                                </button>
                            ) : (
                                <div />
                            )}

                            <button
                                onClick={nextStep}
                                disabled={!canProceedToNextStep()}
                                className={`px-8 py-4 rounded-xl flex items-center gap-2 font-bold transition-all ${canProceedToNextStep()
                                    ? 'bg-accent-500 hover:bg-accent-400 text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-[1.02]'
                                    : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                    }`}
                            >
                                {currentStep === 4 ? 'Confirmar Pagamento' : 'Próximo Passo'}
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
