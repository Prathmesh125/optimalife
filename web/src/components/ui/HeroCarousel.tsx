"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroCarousel({ slides }: { slides: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  if (!slides || slides.length === 0) return null;

  return (
    <section className="relative w-full h-[90vh] min-h-[700px] overflow-hidden bg-slate-900">
      <div className="embla w-full h-full" ref={emblaRef}>
        <div className="embla__container h-full">
          {slides.map((slide, index) => (
            <div className="embla__slide flex-[0_0_100%] relative h-full w-full flex-shrink-0" key={index}>
              {/* Image */}
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover object-center"
              />
              
              {/* Very clean gradient overlay strictly from left for text contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 via-[#0f172a]/50 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Floating Left-Aligned Content with Framer Motion */}
      <div className="absolute inset-0 pointer-events-none flex items-center z-10">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl pointer-events-auto relative h-[300px] flex flex-col justify-center">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-block py-1.5 px-4 rounded-md bg-[var(--color-primary)] !text-white text-sm font-bold tracking-widest mb-6 uppercase shadow-lg border border-white/10">
                {slides[selectedIndex]?.badge}
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold !text-white leading-[1.1] mb-8 drop-shadow-2xl whitespace-pre-line font-serif">
                {slides[selectedIndex]?.title}
              </h1>
              
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                <Link 
                  href="/products" 
                  className="bg-[var(--color-secondary)] text-white px-8 py-4 rounded-sm text-lg font-bold hover:bg-[var(--color-secondary-dark)] transition-all shadow-xl hover:-translate-y-1 flex items-center"
                >
                  Explore Products
                </Link>
                <Link 
                  href="/about-us" 
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-sm text-lg font-bold hover:bg-white hover:text-slate-900 transition-all shadow-xl hover:-translate-y-1 flex items-center"
                >
                  Our Story
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Clean Bottom Divider */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-20 pointer-events-none">
        <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[80px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" className="fill-white"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-50.24V0Z" opacity=".5" className="fill-white"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" className="fill-white"></path>
        </svg>
      </div>
    </section>
  );
}
