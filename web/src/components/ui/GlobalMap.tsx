"use client";

import React, { useState, useEffect } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";

const geoUrl = "/world-110m.json";

interface Location {
  name: string;
  coordinates: [number, number];
  type: "HQ" | "Office" | "Partner";
  color: string;
}

const markers: Location[] = [
  {
    name: "Pune, India (Headquarters)",
    coordinates: [73.8567, 18.5204],
    type: "HQ",
    color: "#3a356a" // Deep Purple
  },
  {
    name: "Dubai, UAE (Global FZ LLC)",
    coordinates: [55.2708, 25.2048],
    type: "Office",
    color: "#38bdf8" // Light Blue
  },
  {
    name: "Netherlands (International BV)",
    coordinates: [4.9041, 52.3676],
    type: "Office",
    color: "#f472b6" // Pink
  },
  {
    name: "Ho Chi Minh City, Vietnam",
    coordinates: [106.6297, 10.8231],
    type: "Partner",
    color: "#a78bfa" // Light Purple
  },
  {
    name: "São Paulo, Brazil",
    coordinates: [-46.6333, -23.5505],
    type: "Partner",
    color: "#a78bfa"
  },
  {
    name: "Nairobi, Kenya",
    coordinates: [36.8219, -1.2921],
    type: "Partner",
    color: "#a78bfa"
  },
  {
    name: "Cairo, Egypt",
    coordinates: [31.2357, 30.0444],
    type: "Partner",
    color: "#a78bfa"
  },
  {
    name: "Paris, France",
    coordinates: [2.3522, 48.8566],
    type: "Partner",
    color: "#a78bfa"
  }
];

export default function GlobalMap() {
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div 
      className="relative w-full aspect-[2/1] min-h-[400px] max-w-6xl mx-auto rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      
      {/* Legend */}
      <div className="absolute bottom-6 right-6 md:bottom-8 md:right-8 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 z-10 flex flex-col space-y-3 text-left">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-[#3a356a]"></div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700">OPTIMA LIFE SCIENCES PVT. LTD (HQ)</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-[#38bdf8]"></div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700">OPTIMA GLOBAL FZ LLC</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-[#f472b6]"></div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700">OPTIMA INTERNATIONAL BV</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-[#a78bfa]"></div>
          <span className="text-[10px] sm:text-xs font-bold text-slate-700">GLOBAL PARTNERS</span>
        </div>
      </div>

      <ComposableMap
        projectionConfig={{
          scale: 140,
          center: [0, 15]
        }}
        className="w-full h-full"
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#e2e8f0"
                stroke="#ffffff"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#cbd5e1", outline: "none", cursor: "crosshair" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {isMounted && markers.map((marker, idx) => (
          <Marker 
            key={idx} 
            coordinates={marker.coordinates}
            onMouseEnter={() => setHoveredLocation(marker)}
            onMouseLeave={() => setHoveredLocation(null)}
          >
            {/* Pulsing ring */}
            <motion.circle
              r={12}
              fill={marker.color}
              opacity={0.3}
              animate={{
                scale: [1, 2.5, 2.5],
                opacity: [0.6, 0, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: idx * 0.2, // Stagger animations
              }}
            />
            {/* Solid dot */}
            <circle 
              r={5} 
              fill={marker.color} 
              className="cursor-pointer stroke-white stroke-2 drop-shadow-md transition-all duration-300"
              onMouseEnter={(e) => {
                 (e.target as SVGCircleElement).setAttribute('r', '7');
              }}
              onMouseLeave={(e) => {
                 (e.target as SVGCircleElement).setAttribute('r', '5');
              }}
            />
          </Marker>
        ))}
      </ComposableMap>

      {/* Floating HTML Tooltip */}
      <AnimatePresence>
        {hoveredLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed pointer-events-none z-50 bg-[#1e293b] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-2xl flex flex-col items-center whitespace-nowrap border border-slate-700"
            style={{
              left: mousePos.x,
              top: mousePos.y - 55,
              transform: 'translateX(-50%)'
            }}
          >
            {hoveredLocation.name}
            {/* Tooltip triangle */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1e293b] rotate-45 border-r border-b border-slate-700"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
