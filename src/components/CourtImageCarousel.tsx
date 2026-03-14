'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CourtImageCarouselProps {
    images: string[];
    courtName: string;
    courtType?: string;
    className?: string;
    onImageClick?: () => void;
}

export function CourtImageCarousel({ images, courtName, courtType, className = "", onImageClick }: CourtImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const hasImages = images && images.length > 0;

    if (!hasImages) {
        return (
            <div
                className={`w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl overflow-hidden cursor-pointer ${className}`}
                onClick={onImageClick}
            >
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                    }}
                ></div>
                <div className="w-16 h-16 rounded-full bg-black/20 flex items-center justify-center mb-3 border border-white/5 backdrop-blur-sm">
                    <ImageIcon size={32} className="text-zinc-600" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
                    Sem Imagem
                </span>
                {courtType && (
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase border border-white/10">
                        {courtType}
                    </div>
                )}
            </div>
        );
    }

    const nextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className={`relative group/carousel w-full h-full overflow-hidden rounded-xl ${className}`}>
            <div
                className="w-full h-full cursor-pointer"
                onClick={onImageClick}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={images[currentIndex]}
                        alt={`${courtName} - Imagem ${currentIndex + 1}`}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="w-full h-full object-cover rounded-xl"
                    />
                </AnimatePresence>
            </div>

            {/* Badge Tipo de Quadra */}
            {courtType && (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-white uppercase border border-white/10 z-10">
                    {courtType}
                </div>
            )}

            {/* Setas de Navegação */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white md:opacity-0 md:group-hover/carousel:opacity-100 transition-all hover:bg-accent-500 hover:text-black hover:border-accent-500 active:scale-90 z-20 shadow-xl"
                    >
                        <ChevronLeft size={20} strokeWidth={3} />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white md:opacity-0 md:group-hover/carousel:opacity-100 transition-all hover:bg-accent-500 hover:text-black hover:border-accent-500 active:scale-90 z-20 shadow-xl"
                    >
                        <ChevronRight size={20} strokeWidth={3} />
                    </button>

                    {/* Indicador de Quantidade */}
                    <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-white tracking-widest border border-white/20 z-10 shadow-lg">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Dots Indicadores */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentIndex(idx);
                                }}
                                className={`w-2 h-2 rounded-full transition-all shadow-md ${idx === currentIndex ? 'bg-accent-500 w-5' : 'bg-white/40 hover:bg-white/60'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Overlay Gradient suave */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
    );
}
