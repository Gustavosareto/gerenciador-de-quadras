'use client';

import { Trophy, Clock, MapPin, Users, Maximize2, Layers, Image as ImageIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useState } from 'react';
import { CourtImageCarousel } from '@/components/CourtImageCarousel';

interface Court {
    id: string;
    name: string;
    type: string;
    hourlyRate: number;
    reservationType: 'FIXED' | 'OPEN';
    image?: string;
    images?: string[];
    useCompanyAddress?: boolean;
    customAddress?: string;
    minPlayers?: number;
    maxPlayers?: number;
    surface?: string;
    dimensions?: string;
}

interface CourtSelectionStepProps {
    courts: Court[];
    selectedCourtId: string | null;
    tenantAddress?: string;
    onSelectCourt: (court: Court) => void;
}

export default function CourtSelectionStep({ courts, selectedCourtId, tenantAddress, onSelectCourt }: CourtSelectionStepProps) {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Escolha sua Quadra</h2>
                <p className="text-zinc-400">Selecione a quadra ideal para seu jogo</p>
            </div>

            {courts.length === 0 ? (
                <div className="text-center py-12">
                    <Trophy size={48} className="text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-500">Nenhuma quadra disponível no momento</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courts.map((court) => {
                        const isSelected = selectedCourtId === court.id;
                        const addressToDisplay = court.useCompanyAddress !== false ? tenantAddress : (court.customAddress || null);
                        const displayImages = court.images && court.images.length > 0
                            ? court.images
                            : (court.image ? [court.image] : []);

                        return (
                            <div
                                key={court.id}
                                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-left flex flex-col h-full ${isSelected
                                    ? 'border-accent-500 bg-accent-500/10 shadow-[0_0_30px_rgba(204,255,0,0.2)]'
                                    : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
                                    }`}
                            >
                                <div className="flex-1 w-full">
                                    {isSelected && (
                                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center shadow-lg z-10">
                                            <Trophy size={16} className="text-black" />
                                        </div>
                                    )}

                                    <div className="mb-4 h-44 w-full">
                                        <CourtImageCarousel
                                            images={displayImages}
                                            courtName={court.name}
                                            courtType={court.type}
                                            onImageClick={() => onSelectCourt(court)}
                                        />
                                    </div>

                                    <div className="mb-4 cursor-pointer" onClick={() => onSelectCourt(court)}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-white">{court.name}</h3>
                                        </div>
                                        {addressToDisplay && (
                                            <div className="flex items-start gap-1.5 text-xs text-zinc-400 mt-2 min-w-0">
                                                <MapPin size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2 leading-relaxed">{addressToDisplay}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Court Metadata */}
                                    <div className="grid grid-cols-2 gap-3 mb-6 pt-4 border-t border-white/5">
                                        {(court.minPlayers || court.maxPlayers) && (
                                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                <Users size={14} className="text-zinc-500 flex-shrink-0" />
                                                <span className="truncate">
                                                    {court.minPlayers && court.maxPlayers
                                                        ? `${court.minPlayers}-${court.maxPlayers} Jog.`
                                                        : court.maxPlayers
                                                            ? `Até ${court.maxPlayers} Jog.`
                                                            : `${court.minPlayers} Jog. mín.`
                                                    }
                                                </span>
                                            </div>
                                        )}
                                        {court.surface && (
                                            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                                                <Layers size={14} className="text-zinc-500 flex-shrink-0" />
                                                <span className="truncate capitalize">{court.surface}</span>
                                            </div>
                                        )}
                                        {court.dimensions && (
                                            <div className="flex items-center gap-2 text-[11px] text-zinc-400 col-span-2">
                                                <Maximize2 size={14} className="text-zinc-500 flex-shrink-0" />
                                                <span className="truncate">Tamanho: {court.dimensions}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-white/10 cursor-pointer" onClick={() => onSelectCourt(court)}>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-white">
                                                {formatCurrency(court.hourlyRate)}
                                            </span>
                                            <span className="text-sm text-zinc-500">/hora</span>
                                        </div>
                                        <p className="mt-2 text-xs text-zinc-500">
                                            Reserva mínima de 1 hora. Você escolhe o tempo no próximo passo.
                                        </p>
                                    </div>
                                </div>

                                <div className={`mt-4 pt-4 border-t transition-colors w-full cursor-pointer ${isSelected ? 'border-accent-500/30' : 'border-white/5'
                                    }`} onClick={() => onSelectCourt(court)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                                            <Clock size={14} />
                                            <span>Agendamento por Hora</span>
                                        </div>
                                        {!isSelected && (
                                            <span className="text-xs font-bold text-accent-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                SELECIONAR
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
