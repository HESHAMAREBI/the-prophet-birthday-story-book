/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { RotateCcw, Award, CheckCircle2, ChevronDown } from 'lucide-react';

const PRAISES = [
  "اللهمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ",
  "صَلَّى اللَّهُ عَلَى مُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
  "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ النَّبِيِّ الأُمِّيِّ",
  "الْحَمْدُ للهِ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِهِ وَعَظِيمِ سُلْطَانِهِ",
  "يَا مَرْحَبًا يَا مَرْحَبًا بِالْهَاشِمِيِّ الْمُجْتَبَى"
];

interface TasbihCounterProps {
  theme?: 'dark' | 'light';
}

export default function TasbihCounter({ theme = 'dark' }: TasbihCounterProps) {
  const [totalCount, setTotalCount] = useState<number>(() => {
    const saved = localStorage.getItem('tasbih_total');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [sessionCount, setSessionCount] = useState<number>(0);
  const [praiseIndex, setPraiseIndex] = useState<number>(0);
  const [targetCount, setTargetCount] = useState<number>(33);
  const [goalReached, setGoalReached] = useState<boolean>(false);
  const controls = useAnimation();
  const isLight = theme === 'light';

  // Save changes locally
  useEffect(() => {
    localStorage.setItem('tasbih_total', totalCount.toString());
  }, [totalCount]);

  // Click handler with scale and shadow animations and sound cue simulation
  const handlePraise = async () => {
    const nextSession = sessionCount + 1;
    const nextTotal = totalCount + 1;
    
    setSessionCount(nextSession);
    setTotalCount(nextTotal);

    // Animation scale squeeze & release
    await controls.start({
      scale: 0.95,
      transition: { duration: 0.05 }
    });
    controls.start({
      scale: 1.0,
      transition: { type: "spring", stiffness: 300, damping: 15 }
    });

    // Check goal target
    if (nextSession >= targetCount && !goalReached) {
      setGoalReached(true);
      // Slight web audio synth confirmation chirp
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } catch (err) {}
    }
  };

  const resetSession = () => {
    setSessionCount(0);
    setGoalReached(false);
  };

  const progressPercentage = Math.min((sessionCount / targetCount) * 100, 100);

  return (
    <div className={`flex flex-col items-center rounded-2xl border p-5 max-w-md w-full mx-auto ${
      isLight 
        ? 'bg-[#fbfbf9] border-[#b98e14]/25 shadow-md' 
        : 'bg-[#0a2b1d] border-[#d4af37]/35 shadow-inner'
    }`}>
      
      {/* Praise Phrase Selector */}
      <div className="w-full mb-4">
        <label className={`text-xs font-sans block mb-1.5 text-right font-medium ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>الصيغة المختارة للذكر ببركة المولد الشريف:</label>
        <div className="relative">
          <select
            value={praiseIndex}
            onChange={(e) => setPraiseIndex(parseInt(e.target.value, 10))}
            className={`w-full border rounded-xl py-2 px-3 pl-8 text-right font-serif text-sm font-bold focus:outline-none select-none appearance-none cursor-pointer ${
              isLight 
                ? 'bg-white border-[#b98e14]/30 text-[#b98e14] focus:border-[#b98e14]' 
                : 'bg-[#051a10] border-[#d4af37]/35 text-[#d4af37] focus:border-[#d4af37]'
            }`}
          >
            {PRAISES.map((praise, idx) => (
              <option key={idx} value={idx} className={isLight ? 'bg-white text-[#1b3225]' : 'bg-[#0a2b1d] text-[#f4e6d1]'}>{praise}</option>
            ))}
          </select>
          <ChevronDown className={`w-4 h-4 absolute left-3 top-3 pointer-events-none ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
        </div>
      </div>

      {/* Selected phrase presentation */}
      <div className={`min-h-[64px] flex items-center justify-center text-center p-3 rounded-xl border w-full mb-5 ${
        isLight ? 'bg-[#f4ebd0]/30 border-[#b98e14]/15' : 'bg-[#051a10] border-[#d4af37]/20'
      }`}>
        <p className={`font-serif text-lg leading-relaxed font-bold ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>
          {PRAISES[praiseIndex]}
        </p>
      </div>

      {/* Target selector */}
      <div className={`flex justify-between items-center w-full mb-4 text-xs font-sans ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>
        <div className="flex gap-2 items-center">
          <span className="font-medium">الهدف الحالي:</span>
          <select
            value={targetCount}
            onChange={(e) => {
              setTargetCount(parseInt(e.target.value, 10));
              setGoalReached(sessionCount >= parseInt(e.target.value, 10));
            }}
            className={`rounded px-2 py-0.5 font-bold focus:outline-none ${
              isLight 
                ? 'bg-white border border-[#b98e14]/35 text-[#b98e14] focus:border-[#b98e14]' 
                : 'bg-[#051a10] border border-[#d4af37]/30 text-[#d4af37] focus:border-[#d4af37]'
            }`}
          >
            <option value={33} className={isLight ? 'bg-white text-[#1b3225]' : 'bg-[#0a2b1d] text-[#f4e6d1]'}>33 مرّة</option>
            <option value={100} className={isLight ? 'bg-white text-[#1b3225]' : 'bg-[#0a2b1d] text-[#f4e6d1]'}>100 مرّة</option>
            <option value={1000} className={isLight ? 'bg-white text-[#1b3225]' : 'bg-[#0a2b1d] text-[#f4e6d1]'}>1000 مرّة</option>
          </select>
        </div>
        
        <span className={`font-sans font-medium flex items-center gap-1 ${isLight ? 'text-[#1b3225]/85' : 'text-[#f4e6d1]/80'}`}>
          <Award className={`w-3.5 h-3.5 ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
          مجموع صلواتك الكلي: <strong className={`font-bold text-sm ${isLight ? 'text-[#1b3225]' : 'text-white'}`}>{totalCount}</strong>
        </span>
      </div>

      {/* Main Clicking Bead Bead */}
      <div className="relative flex items-center justify-center py-4 mb-3">
        {/* Progress outer arc ring */}
        <svg className="w-48 h-48 transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="82"
            stroke={isLight ? "rgba(185, 142, 20, 0.12)" : "rgba(212, 175, 55, 0.12)"}
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="96"
            cy="96"
            r="82"
            stroke={isLight ? "#b98e14" : "#d4af37"}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 82}
            strokeDashoffset={2 * Math.PI * 82 * (1 - progressPercentage / 100)}
            className="transition-all duration-300 ease-out"
            strokeLinecap="round"
          />
        </svg>

        {/* Circular clicking capsule */}
        <motion.button
          onClick={handlePraise}
          animate={controls}
          id="tasbih-touch-pad"
          className={`absolute w-36 h-36 rounded-full border-4 shadow-lg flex flex-col items-center justify-center cursor-pointer hover:brightness-110 active:brightness-95 select-none focus:outline-none ${
            isLight 
              ? 'bg-[#1b3225] border-[#b98e14] text-[#f4ebd0]' 
              : 'bg-[#051a10] border-[#d4af37] text-[#f4e6d1]'
          }`}
        >
          <span className={`text-4xl font-serif font-bold ${isLight ? 'text-[#f4ebd0]' : 'text-[#d4af37]'}`}>{sessionCount}</span>
          <span className="text-[10px] font-sans tracking-wide text-white/60 mt-1 uppercase">انقر للذكر التفاعلي</span>
        </motion.button>
      </div>

      {/* Reset & Goal congrats panel */}
      <div className="w-full flex justify-between items-center">
        <button
          onClick={resetSession}
          className={`p-2 text-xs font-sans transition flex items-center gap-1 ${
            isLight ? 'text-[#1b3225]/60 hover:text-[#b98e14]' : 'text-[#f4e6d1]/60 hover:text-[#d4af37]'
          }`}
          title="تصفير العد للجلسة الحالية"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>تصفير الجلسة</span>
        </button>

        {goalReached && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-sans font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg border ${
              isLight 
                ? 'text-emerald-800 bg-emerald-50 border-emerald-300/30' 
                : 'text-emerald-300 bg-emerald-950/45 border-emerald-500/30'
            }`}
          >
            <CheckCircle2 className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span>تم تحقيق الهدف الحالي! تقبل الله.</span>
          </motion.div>
        )}
      </div>

    </div>
  );
}
