/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ancestorList } from '../data/bookData';
import { motion, AnimatePresence } from 'motion/react';
import { User, Shield, Info, Heart, Award } from 'lucide-react';

interface FamilyTreeProps {
  theme?: 'dark' | 'light';
}

export default function FamilyTree({ theme = 'dark' }: FamilyTreeProps) {
  const [selectedAncestor, setSelectedAncestor] = useState<number>(0);
  const isLight = theme === 'light';

  return (
    <div className={`flex flex-col lg:flex-row gap-6 mt-4 p-4 rounded-xl border ${
      isLight 
        ? 'border-[#b98e14]/30 bg-[#f4ebd0]/15 shadow-inner' 
        : 'border-[#d4af37]/30 bg-[#051a10]/40'
    } backdrop-blur-sm`}>
      
      {/* Ancestor Cards list (Scrollable Timeline) */}
      <div className="w-full lg:w-1/2 flex flex-col">
        <h3 className={`text-md font-sans font-bold mb-3 flex items-center gap-2 border-b pb-2 font-serif ${
          isLight ? 'text-[#b98e14] border-[#b98e14]/25' : 'text-[#d4af37] border-[#d4af37]/25'
        }`}>
          <Award className={`w-5 h-5 ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
          <span>سلسلة النسب النبوي الشريف (من نزار وعدنان)</span>
        </h3>
        
        {/* Scroller */}
        <div className="max-h-[360px] overflow-y-auto pr-1 flex flex-col gap-2 custom-scrollbar">
          {ancestorList.map((ancestor, index) => {
            const isSelected = selectedAncestor === index;
            return (
              <button
                key={ancestor.name}
                id={`ancestor-btn-${index}`}
                onClick={() => setSelectedAncestor(index)}
                className={`w-full text-right p-3 rounded-xl transition-all duration-300 flex items-center justify-between border ${
                  isSelected
                    ? isLight
                      ? 'bg-[#b98e14] text-white border-[#b98e14] shadow-md ring-1 ring-[#b98e14]'
                      : 'bg-[#d4af37] text-[#051a10] border-[#d4af37] shadow-md ring-1 ring-[#d4af37]'
                    : isLight
                      ? 'bg-white hover:bg-[#b98e14]/10 text-[#1b3225] border-[#b98e14]/15'
                      : 'bg-[#0a2b1d] hover:bg-[#0a2b1d]/75 text-[#f4e6d1] border-[#d4af37]/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-sans text-xs font-bold ${
                    isLight ? 'bg-[#f4ebd0] text-[#b98e14]' : 'bg-[#051a10] text-[#d4af37]'
                  }`}>
                    {ancestorList.length - index}
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="font-serif text-lg font-bold">{ancestor.name}</span>
                    {ancestor.title && (
                      <span className={`text-xs ${
                        isSelected 
                          ? isLight ? 'text-white/85' : 'text-[#051a10]/80' 
                          : isLight ? 'text-[#1b3225]/60' : 'text-[#f4e6d1]/60'
                      }`}>
                        {ancestor.title}
                      </span>
                    )}
                  </div>
                </div>
                
                <span className={`text-xs px-2 py-1 rounded-md font-sans ${
                  isSelected 
                    ? isLight ? 'bg-white/15 text-white font-bold' : 'bg-[#051a10]/15 text-[#051a10] font-bold' 
                    : isLight ? 'bg-[#1b3225]/10 text-[#b98e14]' : 'bg-[#051a10] text-[#d4af37]/75'
                }`}>
                  {index === 0 ? 'سيد الخلق' : `الجد ${index}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Ancestor Detail View */}
      <div className={`w-full lg:w-1/2 flex flex-col justify-between rounded-xl p-5 border shadow-md min-h-[300px] ${
        isLight ? 'bg-white border-[#b98e14]/25' : 'bg-[#0a2b1d] border-[#d4af37]/25'
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedAncestor}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                  isLight 
                    ? 'bg-[#f4ebd0]/50 text-[#b98e14] border-[#b98e14]/25' 
                    : 'bg-[#051a10] text-[#d4af37] border-[#d4af37]/30'
                }`}>
                  <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
                  شرف النسب الزاهر
                </span>
                
                <span className={`text-xl font-serif font-bold ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>
                  #{ancestorList.length - selectedAncestor} في النسب
                </span>
              </div>

              {/* Title & Name */}
              <h4 className={`text-2xl font-serif font-bold mb-1 leading-snug ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>
                {ancestorList[selectedAncestor].name}
              </h4>
              
              {ancestorList[selectedAncestor].title && (
                <p className={`text-sm font-sans font-medium mb-3 ${isLight ? 'text-[#1b3225]/85' : 'text-[#f4e6d1]/85'}`}>
                  ({ancestorList[selectedAncestor].title})
                </p>
              )}

              <hr className={`mb-4 ${isLight ? 'border-[#b98e14]/15' : 'border-[#d4af37]/20'}`} />

              {/* Story Description */}
              <p className={`font-sans leading-relaxed text-md mb-6 whitespace-pre-line text-right ${
                isLight ? 'text-[#1b3225]/85' : 'text-[#f4e6d1]/80'
              }`}>
                {ancestorList[selectedAncestor].description}
              </p>
            </div>

            {/* Noble lineage connection alert */}
            <div className={`p-3.5 rounded-lg border flex items-start gap-2.5 ${
              isLight ? 'bg-[#f4ebd0]/30 border-[#b98e14]/20' : 'bg-[#051a10] border-[#d4af37]/20'
            }`}>
              <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
              <p className={`text-xs font-sans leading-relaxed text-right ${isLight ? 'text-[#1b3225]/80' : 'text-[#f4e6d1]/80'}`}>
                وقال رسول الله ﷺ: <span className={`font-serif font-bold text-sm ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>"إنَّ اللهَ اصْطَفَى كِنَانَةَ مِنْ وَلَدِ إسْمَاعِيلَ، واصْطَفَى قُرَيْشًا مِنْ كِنَانَةَ، واصْطَفَى مِنْ قُرَيْشٍ بَنِي هَاشِمٍ، واصْطَفَانِي مِنْ بَنِي هَاشِمٍ"</span>
              </p>
            </div>
            
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
