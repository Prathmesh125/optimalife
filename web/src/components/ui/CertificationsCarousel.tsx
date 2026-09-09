"use client";

import React, { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CertificationsCarousel({ certs }: { certs: { image: string, name: string }[] }) {
  // Using slidesToScroll: 1 and align: start for 4 items per row
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', dragFree: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const displayCerts = [...certs, ...certs];

  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden bg-[var(--color-base-subtle)] border-y border-slate-200">
      
      <div className="relative z-20 container mx-auto px-4 md:px-12">
        <div className="text-center mb-16">
          <span className="text-[var(--color-secondary)] font-bold text-sm tracking-widest uppercase mb-4 block">
            Quality Assurance
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 drop-shadow-sm">
            Our Certifications
          </h2>
        </div>

        <div className="relative">
          {/* Embla Viewport */}
          <div className="embla overflow-hidden" ref={emblaRef}>
            <div className="embla__container flex py-12">
              {displayCerts.map((cert, index) => (
                <div 
                  className="embla__slide flex-[0_0_85%] sm:flex-[0_0_50%] lg:flex-[0_0_25%] min-w-0 flex flex-col items-center px-4" 
                  key={index}
                >
                  <div className="w-full bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300 overflow-hidden flex flex-col h-full group">
                    {/* Image Container */}
                    <div className="w-full bg-slate-50 p-6 flex-1 flex items-center justify-center border-b border-slate-100 min-h-[250px]">
                      <img 
                        src={cert.image} 
                        alt={cert.name}
                        className="max-h-[300px] w-auto object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    {/* Text Container */}
                    <div className="p-6 text-center bg-white">
                      <span className="text-[var(--color-secondary)] font-bold text-xs tracking-wider uppercase mb-2 block">
                        Official Standard
                      </span>
                      <h3 className="text-slate-900 font-extrabold text-xl tracking-wide">{cert.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button 
            className="absolute left-0 md:-left-8 top-1/2 -translate-y-12 bg-white hover:bg-slate-50 text-[var(--color-primary)] p-3 rounded-full shadow-lg border border-slate-200 transition-colors z-30"
            onClick={scrollPrev}
            aria-label="Previous Slide"
          >
            <ChevronLeft size={28} />
          </button>
          <button 
            className="absolute right-0 md:-right-8 top-1/2 -translate-y-12 bg-white hover:bg-slate-50 text-[var(--color-primary)] p-3 rounded-full shadow-lg border border-slate-200 transition-colors z-30"
            onClick={scrollNext}
            aria-label="Next Slide"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
}
