/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface MasjidNabawiSVGProps {
  className?: string;
  isQiyamActive?: boolean;
  theme?: 'dark' | 'light';
}

export default function MasjidNabawiSVG({ className = '', isQiyamActive = false, theme = 'dark' }: MasjidNabawiSVGProps) {
  return (
    <svg
      id="masjid-nabawi-vector"
      viewBox="0 0 800 500"
      className={`w-full h-auto select-none transition-all duration-1000 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#021a12" />  {/* Deep emerald night */}
          <stop offset="60%" stopColor="#082d20" />
          <stop offset="100%" stopColor="#0d3f2e" /> {/* Soft warm mint bottom */}
        </linearGradient>

        {/* Light theme Sky gradient - warm Medina morning sunrise glow */}
        <linearGradient id="skyGradLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eedcb3" />
          <stop offset="60%" stopColor="#f3ebd7" />
          <stop offset="100%" stopColor="#f9f5e8" />
        </linearGradient>

        <linearGradient id="skyGradQiyam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#01110a" />
          <stop offset="50%" stopColor="#02301c" />
          <stop offset="100%" stopColor="#045230" />
        </linearGradient>

        {/* Dome shading */}
        <linearGradient id="domeGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#05703f" />
          <stop offset="35%" stopColor="#10b971" />
          <stop offset="70%" stopColor="#0e9e60" />
          <stop offset="100%" stopColor="#064f2c" />
        </linearGradient>

        {/* Gold shading */}
        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe680" />
          <stop offset="50%" stopColor="#dfa11f" />
          <stop offset="100%" stopColor="#804810" />
        </linearGradient>

        {/* Marble structure shading */}
        <linearGradient id="marbleGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#d1cbba" />
          <stop offset="50%" stopColor="#f7f5ed" />
          <stop offset="100%" stopColor="#e3ded0" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        {/* Soft shadow */}
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Sky Background */}
      <rect 
        width="800" 
        height="500" 
        fill={isQiyamActive ? "url(#skyGradQiyam)" : theme === 'light' ? "url(#skyGradLight)" : "url(#skyGrad)"} 
        className="transition-all duration-1000"
      />

      {/* Islamic Star Lattice Grid Overlay (Subtle) */}
      <g opacity={theme === 'light' ? "0.03" : "0.06"} stroke="#f2d46b" strokeWidth="0.5" fill="none">
        <path d="M 0 50 L 800 50 M 0 100 L 800 100 M 0 150 L 800 150 M 0 200 L 800 200 M 0 250 L 800 250 M 0 300 L 800 300 M 0 350 L 800 350 M 0 400 L 800 400" />
        <path d="M 100 0 L 100 500 M 200 0 L 200 500 M 300 0 L 300 500 M 400 0 L 400 500 M 500 0 L 500 500 M 600 0 L 600 500 M 700 0 L 700 500" />
        {/* Rhombus lattices */}
        <path d="M 0 0 L 500 500 M 300 0 L 800 500 M 0 200 L 300 500 M 0 500 L 500 0 M 300 500 L 800 0 M 0 300 L 300 0" />
      </g>

      {/* Glowing Spiritual Stars */}
      <g id="stars-backdrop" className={`${theme === 'light' ? 'opacity-20' : 'opacity-75'} transition-opacity duration-1000`}>
        <circle cx="150" cy="80" r="1.5" fill="#fcf6d6" opacity="0.6" className="animate-pulse" />
        <circle cx="280" cy="110" r="1.2" fill="#ffe680" opacity="0.8" />
        <circle cx="450" cy="70" r="2.0" fill="#ffffff" opacity="0.5" className="animate-pulse" style={{ animationDuration: '4s' }} />
        <circle cx="580" cy="120" r="1.5" fill="#ffe680" opacity="0.7" />
        <circle cx="670" cy="90" r="1.0" fill="#fcf6d6" opacity="0.4" />
        
        {/* Major spiritual star */}
        <polygon points="450,60 452,66 458,68 452,70 450,76 448,70 442,68 448,66" fill="#f2d46b" opacity="0.75" />
      </g>

      {/* Giant Golden Spiritual Crescent Moon */}
      <g transform="translate(620, 80) scale(0.85)">
        <path 
          d="M 50 0 A 50 50 0 1 0 100 86 A 42 42 0 1 1 50 0 Z" 
          fill="url(#goldGrad)" 
          filter="url(#goldGlow)"
          className="transition-all duration-1000"
          style={{ transformOrigin: '50px 50px' }}
        />
      </g>

      {/* Real-time Spiritual Aura around Green Dome */}
      <circle 
        cx="400" 
        cy="310" 
        r="110" 
        fill="#10b971" 
        opacity={isQiyamActive ? "0.22" : "0.09"} 
        filter="url(#glowGreen)"
        className="transition-all duration-1000"
      />
      
      {isQiyamActive && (
        <circle 
          cx="400" 
          cy="310" 
          r="160" 
          fill="#ffe680" 
          opacity="0.10" 
          filter="url(#goldGlow)"
          className="transition-all duration-1000"
        />
      )}

      {/* Main Masjid Structure Group */}
      <g filter="url(#softShadow)">
        
        {/* Background Walls */}
        <rect x="220" y="320" width="360" height="110" fill="url(#marbleGrad)" />
        {/* Roof lining */}
        <rect x="200" y="315" width="400" height="8" fill="#a8a28e" />
        {/* Small crenellations/shurafāt */}
        <g fill="#918a77">
          <rect x="210" y="307" width="10" height="8" />
          <rect x="230" y="307" width="10" height="8" />
          <rect x="250" y="307" width="10" height="8" />
          <rect x="270" y="307" width="10" height="8" />
          <rect x="290" y="307" width="10" height="8" />
          <rect x="310" y="307" width="10" height="8" />
          <rect x="470" y="307" width="10" height="8" />
          <rect x="490" y="307" width="10" height="8" />
          <rect x="510" y="307" width="10" height="8" />
          <rect x="530" y="307" width="10" height="8" />
          <rect x="550" y="307" width="10" height="8" />
          <rect x="570" y="307" width="10" height="8" />
        </g>

        {/* THE GREEN DOME BASE (القاعدة الأسطوانية) */}
        {/* Base Cylinder */}
        <rect x="330" y="270" width="140" height="50" fill="url(#marbleGrad)" stroke="#b8b1a0" strokeWidth="1" />
        {/* Windows on the dome base cylinder */}
        <g fill="#0b3f2e">
          <path d="M 345 285 A 6 6 0 0 1 357 285 L 357 305 L 345 305 Z" />
          <path d="M 370 285 A 6 6 0 0 1 382 285 L 382 305 L 370 305 Z" />
          <path d="M 418 285 A 6 6 0 0 1 430 285 L 430 305 L 418 305 Z" />
          <path d="M 443 285 A 6 6 0 0 1 455 285 L 455 305 L 443 305 Z" />
        </g>
        {/* Base golden band */}
        <rect x="325" y="310" width="150" height="6" fill="url(#goldGrad)" />
        
        {/* THE GREEN DOME (القبة الخضراء) */}
        {/* Semicircle dome segment */}
        <path 
          d="M 326 270 C 326 185, 474 185, 474 270 Z" 
          fill="url(#domeGrad)" 
          stroke="#095731" 
          strokeWidth="1.5" 
        />

        {/* Dome vertical ribs (خطوط القبة البارزة) */}
        <g stroke="#26cf8d" strokeWidth="0.75" opacity="0.4" fill="none">
          <path d="M 335 270 C 342 195, 400 190, 400 190" />
          <path d="M 353 270 C 358 198, 400 190, 400 190" />
          <path d="M 375 270 C 378 200, 400 190, 400 190" />
          <path d="M 400 270 L 400 190" />
          <path d="M 425 270 C 422 200, 400 190, 400 190" />
          <path d="M 447 270 C 442 198, 400 190, 400 190" />
          <path d="M 465 270 C 458 195, 400 190, 400 190" />
        </g>

        {/* Royal Gold Spire & Golden Crescents on top of Green Dome */}
        {/* Spire shaft */}
        <rect x="398" y="165" width="4" height="25" fill="url(#goldGrad)" />
        {/* Golden spheres */}
        <circle cx="400" cy="180" r="5" fill="url(#goldGrad)" />
        <circle cx="400" cy="170" r="4.2" fill="url(#goldGrad)" />
        <circle cx="400" cy="161" r="3.2" fill="url(#goldGrad)" />
        {/* Crescent cap */}
        <path d="M 395 145 A 7 7 0 1 0 405 155 A 6 6 0 1 1 395 145 Z" fill="url(#goldGrad)" filter="url(#goldGlow)" />

        {/* Left Minaret (المأذنة اليسرى) */}
        <g id="minaret-left">
          {/* Base */}
          <rect x="150" y="240" width="35" height="190" fill="url(#marbleGrad)" />
          {/* Shaft borders */}
          <rect x="147" y="420" width="41" height="10" fill="#a8a28e" />
          <rect x="147" y="235" width="41" height="8" fill="#a8a28e" />
          
          {/* First Balcony (شرفة مستديرة أولى) */}
          <path d="M 140 235 L 145 220 L 190 220 L 195 235 Z" fill="url(#marbleGrad)" stroke="#a8a28e" />
          {/* Balcony fence gold details */}
          <rect x="143" y="220" width="49" height="4" fill="url(#goldGrad)" />
          
          {/* Octagonal Second Stage */}
          <rect x="153" y="150" width="29" height="70" fill="url(#marbleGrad)" />
          {/* Arches on the second stage */}
          <g fill="#918a77" opacity="0.8">
            <path d="M 158 170 A 4 4 0 0 1 166 170 L 166 195 L 158 195 Z" />
            <path d="M 170 170 A 4 4 0 0 1 178 170 L 178 195 L 170 195 Z" />
          </g>

          {/* Second Balcony (شرفة ثانية) */}
          <path d="M 148 150 L 151 140 L 184 140 L 187 150 Z" fill="url(#marbleGrad)" stroke="#a8a28e" />
          
          {/* Pillar Pavilion Cylinder */}
          <rect x="157" y="110" width="21" height="30" fill="url(#marbleGrad)" />
          
          {/* Golden Cap / Peak Cone */}
          <path d="M 155 110 L 167.5 75 L 180 110 Z" fill="url(#goldGrad)" />
          {/* Small gold spire */}
          <rect x="166.5" y="65" width="2" height="10" fill="url(#goldGrad)" />
          <circle cx="167.5" cy="63" r="1.8" fill="url(#goldGrad)" />
        </g>

        {/* Right Minaret (المأذنة اليمنى - مطابقة ومتوازنة) */}
        <g id="minaret-right" transform="translate(465, 0)">
          {/* Base */}
          <rect x="150" y="180" width="35" height="250" fill="url(#marbleGrad)" />
          {/* Shaft borders */}
          <rect x="147" y="420" width="41" height="10" fill="#a8a28e" />
          <rect x="147" y="175" width="41" height="8" fill="#a8a28e" />
          
          {/* First Balcony */}
          <path d="M 140 175 L 145 160 L 190 160 L 195 175 Z" fill="url(#marbleGrad)" stroke="#a8a28e" />
          <rect x="143" y="160" width="49" height="4" fill="url(#goldGrad)" />
          
          {/* Second Stage */}
          <rect x="153" y="90" width="29" height="70" fill="url(#marbleGrad)" />
          <g fill="#918a77" opacity="0.8">
            <path d="M 158 110 A 4 4 0 0 1 166 110 L 166 135 L 158 135 Z" />
            <path d="M 170 110 A 4 4 0 0 1 178 110 L 178 135 L 170 135 Z" />
          </g>

          {/* Second Balcony */}
          <path d="M 148 90 L 151 80 L 184 80 L 187 90 Z" fill="url(#marbleGrad)" stroke="#a8a28e" />
          
          {/* Pillar Pavilion */}
          <rect x="157" y="50" width="21" height="30" fill="url(#marbleGrad)" strokeWidth="0.5" />
          
          {/* Golden Cap / Peak Cone */}
          <path d="M 155 50 L 167.5 15 L 180 50 Z" fill="url(#goldGrad)" />
          <rect x="166.5" y="5" width="2" height="10" fill="url(#goldGrad)" />
          <circle cx="167.5" cy="3" r="1.8" fill="url(#goldGrad)" />
        </g>

        {/* Central Entrance & Windows block */}
        <g id="doors-windows" transform="translate(180, 0)">
          {/* Central Double Arch Doorway */}
          <path d="M 200 370 A 20 20 0 0 1 240 370 L 240 430 L 200 430 Z" fill="#4d3511" stroke="url(#goldGrad)" strokeWidth="1.5" />
          <path d="M 205 370 A 15 15 0 0 1 235 370 L 235 430 L 205 430 Z" fill="#2d1c04" />
          
          {/* Miniature gold lamps hanging above door */}
          <circle cx="220" cy="355" r="3" fill="url(#goldGrad)" filter="url(#goldGlow)" />
          <line x1="220" y1="340" x2="220" y2="352" stroke="url(#goldGrad)" strokeWidth="1" />
          
          {/* Surrounding Wall Windows */}
          <rect x="80" y="340" width="18" height="35" rx="9" fill="#0b3f2e" stroke="#f2d46b" strokeWidth="0.75" />
          <rect x="120" y="340" width="18" height="35" rx="9" fill="#0b3f2e" stroke="#f2d46b" strokeWidth="0.75" />
          
          <rect x="300" y="340" width="18" height="35" rx="9" fill="#0b3f2e" stroke="#f2d46b" strokeWidth="0.75" />
          <rect x="340" y="340" width="18" height="35" rx="9" fill="#0b3f2e" stroke="#f2d46b" strokeWidth="0.75" />
        </g>
      </g>
      
      {/* Front marble plaza ground (الساحة الشريفة) */}
      <rect x="0" y="430" width="800" height="70" fill="#ebeeeb" opacity="0.9" />
      <rect x="0" y="430" width="800" height="4" fill="url(#goldGrad)" />
      
      {/* Soft floor reflection lines */}
      <ellipse cx="400" cy="455" rx="200" ry="12" fill="#10b971" opacity={isQiyamActive ? "0.15" : "0.06"} filter="url(#glowGreen)" />
    </svg>
  );
}
