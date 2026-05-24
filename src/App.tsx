/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Award, Sparkles, User, Info, ArrowRight, ArrowLeft, ZoomIn, ZoomOut, BookMarked, Sun, Moon, Volume2, Download, Smartphone, X } from 'lucide-react';
import { ContentType, BookSection, Bookmark } from './types';
import { bookSections, authorBiography } from './data/bookData';
import MasjidNabawiSVG from './components/MasjidNabawiSVG';
import FamilyTree from './components/FamilyTree';
import AudioPlayer from './components/AudioPlayer';
import MawlidAudioPlayer from './components/MawlidAudioPlayer';
import TasbihCounter from './components/TasbihCounter';

type TabType = 'about' | 'read' | 'lineage' | 'tasbih';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('read');
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number>(0);
  const [useColorCode, setUseColorCode] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(20); // default font size in px
  const [backgroundOpacity, setBackgroundOpacity] = useState<number>(0.12); // Dimmer for Nabawi Masjid SVG
  const [isQiyamActive, setIsQiyamActive] = useState<boolean>(false);
  const [qiyamCount, setQiyamCount] = useState<number>(0);
  const [rosewaterSplashes, setRosewaterSplashes] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);

  // Page Scroll Mode: continuous vertical vs single page
  const [isContinuousScroll, setIsContinuousScroll] = useState<boolean>(() => {
    const saved = localStorage.getItem('mawlid_continuous_scroll');
    return saved === 'true';
  });

  // Save continuous scroll state locally
  useEffect(() => {
    localStorage.setItem('mawlid_continuous_scroll', isContinuousScroll.toString());
  }, [isContinuousScroll]);

  // Theme states: 'dark' (default traditional emerald) vs 'light' (ivory/daylight)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('mawlid_theme');
    return (saved === 'light' || saved === 'dark') ? (saved as 'dark' | 'light') : 'dark';
  });

  // Custom premium interactive Toast states instead of window.alert() prompts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    // Auto-dismiss within 4 seconds
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  const isLight = theme === 'light';

  // PWA & Mobile Installation Handler States
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(() => {
    const isDismissed = sessionStorage.getItem('pwa_install_dismissed');
    return isDismissed !== 'true';
  });
  const [showIOSHint, setShowIOSHint] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const isDismissed = sessionStorage.getItem('pwa_install_dismissed');
      if (isDismissed !== 'true') {
        setShowInstallBtn(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforePrompt);

    // If app is already running inside PWA standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBtn(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        showToast('جاري تثبيت كتاب المولد على هاتفك بنجاح! شكراً لك 🌱✨');
        setShowInstallBtn(false);
      } else {
        showToast('تم إلغاء عملية التثبيت المؤقتة ✵');
      }
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        setShowIOSHint(true);
      } else {
        showToast('للتحميل: اضغط على زر خيارات المتصفح (⋮) ثم اختر "التثبيت" أو "إضافة إلى الشاشة الرئيسية" 📲');
      }
    }
  };

  const handleDismissInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInstallBtn(false);
    sessionStorage.setItem('pwa_install_dismissed', 'true');
    showToast('تم إخفاء شريط التثبيت لهذا المجلس ✵');
  };

  // Save Theme state locally
  useEffect(() => {
    localStorage.setItem('mawlid_theme', theme);
  }, [theme]);

  // Bookmark loader
  useEffect(() => {
    const savedBookmark = localStorage.getItem('mawlid_bookmark');
    if (savedBookmark) {
      try {
        const parsed: Bookmark = JSON.parse(savedBookmark);
        const index = bookSections.findIndex(s => s.id === parsed.sectionId);
        if (index !== -1) {
          setCurrentSectionIndex(index);
        }
      } catch (e) {
        console.error("Failed to load bookmark:", e);
      }
    }
  }, []);

  // Save Bookmark state
  const handleSaveBookmark = () => {
    const activeSection = bookSections[currentSectionIndex];
    const bookmark: Bookmark = {
      sectionId: activeSection.id,
      pageNumber: activeSection.pageNumber,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };
    localStorage.setItem('mawlid_bookmark', JSON.stringify(bookmark));
    showToast(`تم حفظ علامة القراءة بنجاح عند ص ${activeSection.pageNumber} (${activeSection.title})`);
  };

  const handleNextSection = () => {
    if (currentSectionIndex < bookSections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
    }
  };

  // Color mapper according to Sheikh Ali Amin Syala's instructions (Page 11-12)
  const getSegmentColorClass = (type: ContentType) => {
    if (!useColorCode) return isLight ? 'text-[#1b3225]' : 'text-[#f4e6d1]';
    switch (type) {
      case ContentType.PROSE:
        return isLight
          ? 'text-[#1b3225] border-r-2 border-dashed border-[#b98e14]/40 pr-3'
          : 'text-[#f4e6d1] border-r-2 border-dashed border-[#d4af37]/35 pr-3'; // Ivory Ink
      case ContentType.CONGREGATIONAL:
        return isLight
          ? 'text-emerald-800 font-bold border-r-2 border-emerald-500 pr-3 bg-emerald-50 p-2 rounded-l-lg'
          : 'text-emerald-300 font-bold border-r-2 border-emerald-400 pr-3 bg-emerald-950/40 p-2 rounded-l-lg'; // Green ink (المداد الأخضر)
      case ContentType.INDIVIDUAL_SCRIPTURE:
        return isLight
          ? 'text-amber-800 font-medium italic border-r-2 border-amber-600 pr-3'
          : 'text-amber-300 font-medium italic border-r-2 border-amber-500 pr-3'; // Gold/Amber ink (المداد البني)
      case ContentType.INDIVIDUAL_POETRY:
        return isLight
          ? 'text-sky-800 font-semibold border-r-2 border-sky-500 pr-3 bg-sky-50 p-2 rounded-l-lg'
          : 'text-sky-300 font-semibold border-r-2 border-sky-400 pr-3 bg-sky-950/40 p-2 rounded-l-lg'; // Blue ink (المداد الأزرق)
      default:
        return isLight ? 'text-[#1b3225]' : 'text-[#f4e6d1]';
    }
  };

  // Sound chime effect for interactive rosewater splash in the Qiyam screen
  const playSplashSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Chime wave
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
      
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {}
  };

  // Rosewater splash handler
  const handleRosewaterSplash = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btnRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - btnRect.left;
    const y = e.clientY - btnRect.top;
    
    const newSplash = {
      id: Date.now() + Math.random(),
      x,
      y
    };
    
    setRosewaterSplashes(prev => [...prev, newSplash]);
    setQiyamCount(prev => prev + 1);
    playSplashSound();

    // Remove splash animation afterwards
    setTimeout(() => {
      setRosewaterSplashes(prev => prev.filter(s => s.id !== newSplash.id));
    }, 1200);
  };

  return (
    <div className={`relative min-h-screen font-sans flex flex-col justify-between overflow-x-hidden antialiased transition-colors duration-1000 ${
      isLight ? 'bg-[#faf7f0] text-[#1b3225]' : 'bg-[#051a10] text-[#f4e6d1]'
    }`}>
      
      {/* Dynamic Nabawi Masjid Background - floating/dimmable */}
      <div 
        className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 transition-opacity duration-1000 select-none"
        style={{ opacity: backgroundOpacity }}
      >
        <MasjidNabawiSVG className="max-w-4xl" isQiyamActive={isQiyamActive} theme={theme} />
      </div>

      {/* Decorative Golden Islamic Borders */}
      <div className={`absolute top-0 right-0 w-32 h-32 pattern-overlay pointer-events-none opacity-20 z-10 bg-radial-gradient ${
        isLight ? 'from-[#b98e14]/30 via-transparent to-transparent' : 'from-[#d4af37]/45 via-transparent to-transparent'
      }`}></div>
      <div className={`absolute top-0 left-0 w-32 h-32 pattern-overlay pointer-events-none opacity-20 z-10 bg-radial-gradient ${
        isLight ? 'from-[#b98e14]/30 via-transparent to-transparent' : 'from-[#d4af37]/45 via-transparent to-transparent'
      }`}></div>

      {/* GLOBAL HEADER */}
      <header className={`relative z-10 border-b backdrop-blur-md px-4 py-4 md:px-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-1000 ${
        isLight ? 'border-[#b98e14]/15 bg-white/85' : 'border-[#d4af37]/20 bg-[#0a2b1d]/85'
      }`}>
        
        {/* Books Title & Authorship */}
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-md ${
            isLight 
              ? 'bg-gradient-to-br from-[#f4ebd0] to-white border-[#b98e14]/40 text-[#b98e14]' 
              : 'bg-gradient-to-br from-emerald-900 to-emerald-950 border-[#d4af37]/30 text-[#d4af37]'
          }`}>
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex flex-col text-right">
            <h1 className={`font-serif text-xl md:text-2xl font-black tracking-wide transition-colors ${
              isLight ? 'text-[#1b3225]' : 'text-[#d4af37]'
            }`}>
              رَيْحَانَةُ الأرْوَاحِ فِي مَوْلِدِ خَيْرِ المَلاحِ
            </h1>
            <p className={`text-xs font-sans font-semibold flex items-center gap-1.5 mt-0.5 ${
              isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/85'
            }`}>
              <span>تأليف العارف بالله الشيخ علي أمين سيالة</span>
              <span className={isLight ? 'text-[#b98e14]/50' : 'text-[#d4af37]/65'}>|</span>
              <span className={isLight ? 'text-[#1b3225]/60' : 'text-[#f4e6d1]/60'}>تحقيق محمد الجعفري</span>
            </p>
          </div>
        </div>

        {/* Global Controls: Audio ambient, Bookmark & Theme */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Integrated Web Audio Player */}
          <AudioPlayer theme={theme} />
          
          {/* Quick Theme Toggle Button in Header */}
          <button
            onClick={() => {
              const newTheme = theme === 'light' ? 'dark' : 'light';
              setTheme(newTheme);
              showToast(newTheme === 'light' ? 'مرحباً بك في النمط النهاري الفاتح ☀️' : 'مرحباً بك في النمط الداكن الروحاني 🌙');
            }}
            className={`p-2.5 rounded-xl border transition flex items-center justify-center cursor-pointer ${
              isLight 
                ? 'bg-white text-[#b98e14] border-[#b98e14]/25 hover:bg-[#b98e14]/10' 
                : 'bg-[#0a2b1d] text-[#d4af37] border-[#d4af37]/30 hover:bg-[#d4af37]/15'
            }`}
            title={isLight ? "تحويل للنمط الداكن" : "تحويل للنمط الفاتح"}
          >
            {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Bookmark Quick Access */}
          <button
            onClick={() => {
              const saved = localStorage.getItem('mawlid_bookmark');
              if (saved) {
                try {
                  const parsed: Bookmark = JSON.parse(saved);
                  const sIdx = bookSections.findIndex(s => s.id === parsed.sectionId);
                  if (sIdx !== -1) {
                    setCurrentSectionIndex(sIdx);
                    setActiveTab('read');
                    showToast(`تم الرجوع بنجاح إلى علامة قراءتك المحفوظة لصفحة ${parsed.pageNumber}`);
                  }
                } catch (e) {}
              } else {
                showToast("لم تحفظ أي علامة قراءة بعد. احفظ موضع قراءتك الحالي أولاً!");
              }
            }}
            className={`p-2.5 rounded-xl border transition flex items-center gap-1 text-xs font-sans font-bold cursor-pointer ${
              isLight 
                ? 'bg-white text-[#b98e14] border-[#b98e14]/25 hover:bg-[#b98e14]/10' 
                : 'bg-[#0a2b1d] text-[#d4af37] border-[#d4af37]/30 hover:bg-[#d4af37]/15'
            }`}
            title="انقر للانتقال لموضع القراءة المحفوظ"
          >
            <BookMarked className="w-4 h-4 text-bounce-glow" />
            <span className="hidden sm:inline">موضع قراءتي</span>
          </button>
        </div>

      </header>

      {/* CORE FRAME LAYOUT */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        
        {/* SIDE BAR NAVIGATION MODULE */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4">
          
          {/* Main Navigation Tab Container */}
          <div className={`rounded-2xl border p-3.5 shadow-sm transition-all duration-1000 ${
            isLight ? 'bg-white/95 border-[#b98e14]/20' : 'bg-[#0a2b1d]/90 border-[#d4af37]/25'
          }`}>
            <h2 className={`text-xs font-sans font-bold block mb-2 text-right tracking-wider uppercase select-none ${
              isLight ? 'text-[#b98e14]/95' : 'text-[#d4af37]/75'
            }`}>بوابات ريحانة الأرواح</h2>
            
            <div className="flex flex-col gap-1.5 font-sans">
              <button
                onClick={() => setActiveTab('read')}
                className={`w-full text-right py-2.5 px-4 rounded-xl flex items-center justify-between text-sm transition-all cursor-pointer ${
                  activeTab === 'read'
                    ? isLight 
                      ? 'bg-[#b98e14] text-white font-bold shadow-md' 
                      : 'bg-[#d4af37] text-[#051a10] font-bold shadow-md'
                    : isLight 
                      ? 'text-[#1b3225]/85 hover:bg-[#b98e14]/10 hover:text-[#b98e14]' 
                      : 'text-[#f4e6d1]/85 hover:bg-[#051a10]/60 hover:text-[#d4af37]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Book className="w-4 h-4" />
                  <span>قراءة فصول المولد الشريف</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  activeTab === 'read' 
                    ? isLight ? 'bg-white/20 text-white' : 'bg-[#051a10]/20 text-[#051a10]' 
                    : isLight ? 'bg-[#b98e14]/15 text-[#b98e14]' : 'bg-[#d4af37]/15 text-[#d4af37]'
                }`}>151 صفحة</span>
              </button>

              <button
                onClick={() => setActiveTab('lineage')}
                className={`w-full text-right py-2.5 px-4 rounded-xl flex items-center justify-between text-sm transition-all cursor-pointer ${
                  activeTab === 'lineage'
                    ? isLight 
                      ? 'bg-[#b98e14] text-white font-bold shadow-md' 
                      : 'bg-[#d4af37] text-[#051a10] font-bold shadow-md'
                    : isLight 
                      ? 'text-[#1b3225]/85 hover:bg-[#b98e14]/10 hover:text-[#b98e14]' 
                      : 'text-[#f4e6d1]/85 hover:bg-[#051a10]/60 hover:text-[#d4af37]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4" />
                  <span>النسب النبوي الشريف</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  activeTab === 'lineage' 
                    ? isLight ? 'bg-white/20 text-white' : 'bg-[#051a10]/20 text-[#051a10]' 
                    : isLight ? 'bg-emerald-600/15 text-[#b98e14]' : 'bg-emerald-500/15 text-emerald-300'
                }`}>تفاعلي</span>
              </button>

              <button
                onClick={() => setActiveTab('tasbih')}
                className={`w-full text-right py-2.5 px-4 rounded-xl flex items-center justify-between text-sm transition-all cursor-pointer ${
                  activeTab === 'tasbih'
                    ? isLight 
                      ? 'bg-[#b98e14] text-white font-bold shadow-md' 
                      : 'bg-[#d4af37] text-[#051a10] font-bold shadow-md'
                    : isLight 
                      ? 'text-[#1b3225]/85 hover:bg-[#b98e14]/10 hover:text-[#b98e14]' 
                      : 'text-[#f4e6d1]/85 hover:bg-[#051a10]/60 hover:text-[#d4af37]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4" />
                  <span>المسبحة والصلوات المحمدية</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                  activeTab === 'tasbih' 
                    ? isLight ? 'bg-white/20 text-white' : 'bg-[#051a10]/20 text-[#051a10]' 
                    : isLight ? 'bg-amber-600/15 text-[#b98e14]' : 'bg-amber-500/15 text-amber-300'
                }`}>عدّاد ذكر</span>
              </button>

              <button
                onClick={() => setActiveTab('about')}
                className={`w-full text-right py-2.5 px-4 rounded-xl flex items-center justify-between text-sm transition-all cursor-pointer ${
                  activeTab === 'about'
                    ? isLight 
                      ? 'bg-[#b98e14] text-white font-bold shadow-md' 
                      : 'bg-[#d4af37] text-[#051a10] font-bold shadow-md'
                    : isLight 
                      ? 'text-[#1b3225]/85 hover:bg-[#b98e14]/10 hover:text-[#b98e14]' 
                      : 'text-[#f4e6d1]/85 hover:bg-[#051a10]/60 hover:text-[#d4af37]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4" />
                  <span>عن المخطوط والشيخ المؤلف</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  activeTab === 'about' 
                    ? isLight ? 'bg-white/20 text-white' : 'bg-[#051a10]/20 text-[#051a10]' 
                    : isLight ? 'bg-[#b98e14]/10 text-[#b98e14]' : 'bg-white/10 text-[#f4e6d1]/60'
                }`}>سيرة</span>
              </button>
            </div>
          </div>

          {/* BACKGROUND OPACITY CONTROL & THEME DIMMER DIAL */}
          <div className={`rounded-2xl border p-4 shadow-sm select-none transition-all duration-1000 ${
            isLight ? 'bg-white/95 border-[#b98e14]/20' : 'bg-[#0a2b1d]/90 border-[#d4af37]/25'
          }`}>
            <h2 className={`text-xs font-sans font-bold block mb-3 text-right uppercase ${
              isLight ? 'text-[#b98e14]' : 'text-[#d4af37]/75'
            }`}>تخصيص المشهد الروحاني</h2>
            
            <div className="flex flex-col gap-3">
              {/* Opacity Dimmer */}
              <div>
                <div className={`flex justify-between text-[11px] font-sans mb-1 font-medium text-right ${isLight ? 'text-[#1b3225]/60' : 'text-[#f4e6d1]/60'}`}>
                  <span>بروز كامل</span>
                  <span>شفافية مريحة</span>
                  <span>مخفي</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.45"
                  step="0.01"
                  value={backgroundOpacity}
                  onChange={(e) => setBackgroundOpacity(parseFloat(e.target.value))}
                  className={`w-full h-1 rounded-lg cursor-pointer ${
                    isLight ? 'accent-[#b98e14] bg-[#f4ebd0]' : 'accent-[#d4af37] bg-[#051a10]'
                  }`}
                />
              </div>

              <hr className={isLight ? 'border-[#b98e14]/10' : 'border-[#d4af37]/20'} />

              {/* General Font resizing, Color codes, and Themes */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-sans font-medium ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>حجم خط القراءة:</span>
                  <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                    isLight ? 'bg-white border-[#b98e14]/25' : 'bg-[#051a10] border-[#d4af37]/25'
                  }`}>
                    <button 
                      onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
                      className={`p-1 rounded-md transition ${isLight ? 'text-[#b98e14] hover:bg-[#f4ebd0]' : 'text-[#d4af37] hover:bg-[#0a2b1d]'}`} 
                      title="تصغير الخط"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className={`text-xs font-sans font-bold px-1 ${isLight ? 'text-[#1b3225]' : 'text-[#f4e6d1]'}`}>{fontSize}px</span>
                    <button 
                      onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                      className={`p-1 rounded-md transition ${isLight ? 'text-[#b98e14] hover:bg-[#f4ebd0]' : 'text-[#d4af37] hover:bg-[#0a2b1d]'}`}
                      title="تكبير الخط"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-sans font-medium ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>الترميز اللوني للمخطوط:</span>
                  <button
                    onClick={() => setUseColorCode(prev => !prev)}
                    className={`text-xs font-sans py-1 px-2.5 rounded-lg border font-bold transition-all cursor-pointer ${
                      useColorCode 
                        ? isLight 
                          ? 'bg-[#b98e14] text-white border-[#b98e14]/30' 
                          : 'bg-[#d4af37] text-[#051a10] border-[#d4af37]/50' 
                        : isLight 
                          ? 'bg-white text-[#1b3225]/50 border-[#b98e14]/20' 
                          : 'bg-[#0a2b1d]/85 text-[#f4e6d1]/60 border-white/10'
                    }`}
                  >
                    {useColorCode ? 'مفعّل' : 'معطّل'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-xs font-sans font-medium ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>طريقة تصفّح المخطوط:</span>
                  <div className={`flex items-center p-0.5 rounded-lg border gap-0.5 ${
                    isLight ? 'bg-white border-[#b98e14]/25' : 'bg-[#051a10] border-[#d4af37]/25'
                  }`}>
                    <button
                      onClick={() => {
                        setIsContinuousScroll(false);
                        showToast('تم تفعيل نمط التصفح صفحة بصفحة 📖');
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-sans font-bold transition-all cursor-pointer ${
                        !isContinuousScroll 
                          ? isLight ? 'bg-[#b98e14] text-white shadow' : 'bg-[#d4af37] text-[#051a10] shadow'
                          : isLight ? 'text-[#1b3225]/60 hover:text-[#b98e14]' : 'text-[#f4e6d1]/60 hover:text-[#d4af37]'
                      }`}
                    >
                      <span>منفردة</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsContinuousScroll(true);
                        showToast('تم تفعيل نمط التصفح المتتابع العمودي ↕');
                      }}
                      className={`px-2 py-1 rounded text-[11px] font-sans font-bold transition-all cursor-pointer ${
                        isContinuousScroll 
                          ? isLight ? 'bg-[#b98e14] text-white shadow' : 'bg-[#d4af37] text-[#051a10] shadow'
                          : isLight ? 'text-[#1b3225]/60 hover:text-[#b98e14]' : 'text-[#f4e6d1]/60 hover:text-[#d4af37]'
                      }`}
                    >
                      <span>متتابعة ↕</span>
                    </button>
                  </div>
                </div>

                {/* Explicit Theme Selector */}
                <div className="flex items-center justify-between mt-0.5">
                  <span className={`text-xs font-sans font-medium ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>نمط عرض المخطوط:</span>
                  <div className={`flex items-center p-0.5 rounded-lg border gap-0.5 ${
                    isLight ? 'bg-white border-[#b98e14]/25' : 'bg-[#051a10] border-[#d4af37]/25'
                  }`}>
                    <button
                      onClick={() => {
                        setTheme('light');
                        showToast('تم التحويل للنمط النهاري الفاتح ☀️');
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-sans font-bold flex items-center gap-1 transition ${
                        isLight 
                          ? 'bg-[#b98e14] text-white shadow' 
                          : 'text-[#f4e6d1]/60 hover:text-[#d4af37]'
                      }`}
                    >
                      <Sun className="w-3 h-3" />
                      <span>نهاري فاتح</span>
                    </button>
                    <button
                      onClick={() => {
                        setTheme('dark');
                        showToast('تم التحويل للنمط الليلى الداكن 🌙');
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-sans font-bold flex items-center gap-1 transition ${
                        !isLight 
                          ? 'bg-[#d4af37] text-[#051a10] shadow' 
                          : 'text-[#1b3225]/60 hover:text-[#b98e14]'
                      }`}
                    >
                      <Moon className="w-3 h-3" />
                      <span>داكن مريح</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Key Guide explanation */}
          {useColorCode && activeTab === 'read' && (
            <div className={`rounded-2xl border p-4 shadow-sm text-xs font-sans select-none animate-fade-in transition-all duration-1000 ${
              isLight ? 'bg-white/95 border-[#b98e14]/20 shadow' : 'bg-[#0a2b1d]/90 border-[#d4af37]/25'
            }`}>
              <h3 className={`border-b pb-2 mb-2 font-bold text-right flex items-center gap-1 justify-end font-serif ${
                isLight ? 'text-[#b98e14] border-[#b98e14]/15' : 'text-[#d4af37] border-[#d4af37]/15'
              }`}>
                <span>الترميز اللوني لمخطوط الشيوخ</span>
                <Info className="w-3.5 h-3.5" />
              </h3>
              <p className={`leading-relaxed text-right mb-3 ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>
                تفرّد مخطوط "ريحانة الأرواح" بتعليمات خطّية دقيقة لضبط إيقاع القراءة الجماعية بالألوان كالتالي:
              </p>
              <ul className="flex flex-col gap-2.5 text-right">
                <li className="flex items-center justify-end gap-2 text-[#f4e6d1]/95">
                  <span className={isLight ? 'text-[#1b3225] font-serif font-semibold' : 'text-[#f4e6d1]'}>القصة المولديّة النثريّة</span>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLight ? 'bg-[#1b3225]' : 'bg-[#f4e6d1]'}`}></span>
                </li>
                <li className={`flex items-center justify-end gap-2 font-serif font-bold ${isLight ? 'text-emerald-850' : 'text-emerald-300'}`}>
                  <span>الشعر والقرآن والأحاديث المرددة جماعة</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                </li>
                <li className={`flex items-center justify-end gap-2 font-serif font-medium italic ${isLight ? 'text-amber-850' : 'text-amber-300'}`}>
                  <span>الآيات والأعراف المرددة فردياً</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                </li>
                <li className={`flex items-center justify-end gap-2 font-serif font-semibold ${isLight ? 'text-sky-800' : 'text-sky-300'}`}>
                  <span>القصائد والمدائح الفردية والابتهال</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
                </li>
              </ul>
            </div>
          )}

        </div>

        {/* CORE WORKSPACE PANEL - DYNAMIC SWITCHED BASED ON TAB */}
        <div className="flex-1 flex flex-col gap-4">
          
          <AnimatePresence mode="wait">
            
            {/* TAB: AUTHOR BIO & THE MANUSCRIPT */}
            {activeTab === 'about' && (
              <motion.div
                key="about-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border p-6 md:p-8 shadow-md transition-all duration-1000 ${
                  isLight ? 'bg-white/95 border-[#b98e14]/20' : 'bg-[#0a2b1d]/90 border-[#d4af37]/25'
                }`}
              >
                {/* Traditional Framed biography container */}
                <div className="max-w-3xl mx-auto flex flex-col gap-6">
                  
                  {/* Title banner */}
                  <div className="text-center">
                    <span className={`text-xs uppercase tracking-widest font-sans font-bold ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>سيرة مباركة عطرة</span>
                    <h2 className={`font-serif text-3xl font-extrabold mt-1 ${isLight ? 'text-[#1b3225]' : 'text-[#f4e6d1]'}`}>الشيخ المربي علي أمين سيالة</h2>
                    <div className={`w-24 h-1 mx-auto mt-3 bg-gradient-to-r ${
                      isLight ? 'from-transparent via-[#b98e14]/50 to-transparent' : 'from-transparent via-[#d4af37]/50 to-transparent'
                    }`}></div>
                  </div>

                  {/* Wood-border frame */}
                  <div className={`p-1 rounded-2xl shadowbg-gradient-to-tr shadow-md ${
                    isLight ? 'from-[#a27a18] to-[#b98e14]' : 'from-[#693b11] to-[#d4af37]'
                  }`}>
                    <div className={`rounded-xl p-5 md:p-6 border ${
                      isLight ? 'bg-[#fbfbf9]/95 border-[#b98e14]/20' : 'bg-[#051a10]/85 border-[#d4af37]/25'
                    }`}>
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Mock Portrait representation with elegant icon */}
                        <div className={`w-24 h-24 rounded-full border flex items-center justify-center shrink-0 shadow-md animate-pulse ${
                          isLight ? 'bg-[#f4ebd0] border-[#b98e14] text-[#b98e14]' : 'bg-[#0a2b1d] border-[#d4af37] text-[#d4af37]'
                        }`}>
                          <User className="w-12 h-12" />
                        </div>
                        
                        <div className="text-right">
                          <h3 className={`font-serif text-xl font-bold ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>{authorBiography.name}</h3>
                          <p className={`text-xs font-sans mt-0.5 font-semibold ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]'}`}>{authorBiography.birthplace}</p>
                          <p className={`text-sm font-sans mt-2 leading-relaxed ${isLight ? 'text-[#1b3225]/85' : 'text-[#f4e6d1]/75'}`}>
                            {authorBiography.dates}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Description block */}
                  <div className={`text-right flex flex-col gap-4 font-sans text-md leading-relaxed ${
                    isLight ? 'text-[#1b3225]/90' : 'text-[#f4e6d1]/90'
                  }`}>
                    <div>
                      <h4 className={`font-bold mb-2 border-r-4 pr-2 pb-0.5 ${isLight ? 'text-[#b98e14] border-[#b98e14]' : 'text-[#d4af37] border-[#d4af37]'}`}>مسيرته وعمله الشريف:</h4>
                      <p className={isLight ? 'text-[#1b3225]/80' : 'text-[#f4e6d1]/80'}>{authorBiography.career}</p>
                    </div>

                    <div>
                      <h4 className={`font-bold mb-2 border-r-4 pr-2 pb-0.5 ${isLight ? 'text-[#b98e14] border-[#b98e14]' : 'text-[#d4af37] border-[#d4af37]'}`}>أثره الفني والأدبي والروحي:</h4>
                      <p className={isLight ? 'text-[#1b3225]/80' : 'text-[#f4e6d1]/80'}>{authorBiography.legacy}</p>
                    </div>

                    <div className={`border p-4 rounded-xl mt-4 ${
                      isLight ? 'bg-[#f4ebd0]/30 border-[#b98e14]/20' : 'bg-[#051a10]/60 border-[#d4af37]/20'
                    }`}>
                      <h5 className={`font-bold mb-1 flex items-center gap-1.5 justify-end ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>
                        <span>مخطوط "ريحانة الأرواح" التفاعلي</span>
                        <Sparkles className="w-4 h-4" />
                      </h5>
                      <p className={`text-xs text-right leading-relaxed ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/60'}`}>
                        يبرز هذا المولد في تظاهره بالبساطة والابتكار اللحني، حيث وضع فيه الشيخ السايح تراكيب مدائحية سهلة الحفظ مفعمة بمقامات الذكر والحلم، ما جعل من المولد أداة تربوية حصنت الهوية والدين للناشئة والكهول في وجه التغريب قديماً. تم تصميم هذا المعرض التفاعلي باحترافية لإعادة إحياء مخطوطاته الثلاث بنسق وبصمة إسلامية أصلية تليق بمقامه العظيم.
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB: INTERACTIVE PROPHET ANCESTRAL TREE */}
            {activeTab === 'lineage' && (
              <motion.div
                key="lineage-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border p-5 md:p-6 shadow-md transition-all duration-1000 ${
                  isLight ? 'bg-white/95 border-[#b98e14]/20 shadow' : 'bg-[#0a2b1d]/90 border-[#d4af37]/25'
                }`}
              >
                <div className="mb-4 text-right">
                  <h2 className={`font-serif text-2xl font-bold ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>شجرة نسب المصطفى صلى الله عليه وسلم</h2>
                  <p className={`text-xs font-sans mt-1 ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>تتبع آباء رسول الله صعوداً من والده عبد الله وبني هاشم الكرام إلى عدنان، مع سرد مهامهم التاريخية ومكرماتهم.</p>
                </div>

                <FamilyTree theme={theme} />
              </motion.div>
            )}

            {/* TAB: DIGITAL TASBIH AND SALAWAT COUNTER */}
            {activeTab === 'tasbih' && (
              <motion.div
                key="tasbih-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl border p-6 shadow-md flex flex-col items-center transition-all duration-1000 ${
                  isLight ? 'bg-white/95 border-[#b98e14]/20 shadow' : 'bg-[#0a2b1d]/90 border-[#d4af37]/25'
                }`}
              >
                <div className="mb-6 text-center">
                  <h2 className={`font-serif text-2xl font-bold flex items-center justify-center gap-1.5 font-serif ${
                    isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'
                  }`}>
                    <span>مسبحة الصلوات والمحامد الرقمية</span>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </h2>
                  <p className={`text-xs font-sans mt-1 ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>رتل الأوراد والأدعية وحصّن وقتك بالصلاة على الحبيب صلى الله عليه وسلم. احفظ صلواتك وناظر تقدمك.</p>
                </div>

                <TasbihCounter theme={theme} />
              </motion.div>
            )}

            {/* TAB: LIVE INTERACTIVE BOOK READER */}
            {activeTab === 'read' && (
              <motion.div
                key="read-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col gap-4"
              >
                {/* Search and Navigation chapter bar */}
                <div className={`rounded-2xl border p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 font-sans transition-all duration-1000 ${
                  isLight ? 'bg-white/95 border-[#b98e14]/20 shadow' : 'bg-[#0a2b1d]/90 border-[#d4af37]/25'
                }`}>
                  {/* Select Chapter Dropdown */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className={`text-xs font-bold shrink-0 ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/65'}`}>الفصل:</span>
                    <select
                      value={currentSectionIndex}
                      onChange={(e) => {
                        const idx = parseInt(e.target.value, 10);
                        setCurrentSectionIndex(idx);
                        if (isContinuousScroll) {
                          setTimeout(() => {
                            const element = document.getElementById(`section-card-${idx}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 50);
                        }
                      }}
                      className={`border rounded-xl py-1.5 px-3 font-serif font-bold text-sm focus:outline-none select-none cursor-pointer ${
                        isLight 
                          ? 'bg-[#f4ebd0]/30 border-[#b98e14]/25 text-[#b98e14] focus:border-[#b98e14]' 
                          : 'bg-[#051a10] border-[#d4af37]/30 text-[#d4af37] focus:border-[#d4af37]'
                      }`}
                    >
                      {bookSections.map((section, idx) => (
                        <option key={section.id} value={idx} className={isLight ? 'bg-white text-[#1b3225]' : 'bg-[#0a2b1d] text-[#f4e6d1]'}>{section.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={handleSaveBookmark}
                    className={`p-2 px-4 rounded-xl hover:shadow transition flex items-center gap-1.5 shadow-sm text-xs font-bold cursor-pointer ${
                      isLight 
                        ? 'bg-[#b98e14] text-white hover:bg-[#b98e14]/90 shadow-md border border-[#b98e14]/30' 
                        : 'bg-[#d4af37] text-[#051a10] hover:bg-[#d4af37]/90 hover:shadow shadow-sm'
                    }`}
                    title="حفظ موضع قراءتك الحالي للعودة إليه لاحقاً"
                  >
                    <BookMarked className="w-4 h-4 shrink-0" />
                    <span>حفظ علامة القراءة</span>
                  </button>
                </div>

                {/* Voice Recitation Audio Player Synced with Chapters */}
                <MawlidAudioPlayer 
                  theme={theme}
                  currentSectionId={bookSections[currentSectionIndex].id}
                  onSectionSelect={(idx) => {
                    setCurrentSectionIndex(idx);
                    if (isContinuousScroll) {
                      setTimeout(() => {
                        const element = document.getElementById(`section-card-${idx}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }
                  }}
                  showToast={showToast}
                  onPlayStateChange={setIsAudioPlaying}
                />

                {/* THE BOOK CORE READER FRAME (Parchment Paper Styling) */}
                {isContinuousScroll ? (
                  <div className="flex flex-col gap-8">
                    {bookSections.map((section, idx) => {
                      const isActive = idx === currentSectionIndex;
                      return (
                        <div
                          key={section.id}
                          id={`section-card-${idx}`}
                          className={`relative overflow-hidden border rounded-3xl p-6 md:p-8 text-right flex flex-col justify-between transition-all duration-1000 ${
                            isActive
                              ? isAudioPlaying
                                ? isLight
                                  ? 'active-reading-light border-[#b98e14] text-[#1b3225] scale-[1.015] shadow-2xl relative z-10'
                                  : 'active-reading-dark border-[#d4af37] text-[#f4e6d1] scale-[1.015] shadow-2xl relative z-10'
                                : isLight
                                  ? 'bg-[#b98e14]/5 border-[#b98e14] text-[#1b3225] shadow-lg scale-[1.005]'
                                  : 'bg-[#d4af37]/5 border-[#d4af37] text-[#f4e6d1] shadow-lg scale-[1.005]'
                              : isLight 
                                ? 'parchment-light-smooth border-[#b98e14]/25 text-[#1b3225] shadow-xl' 
                                : 'parchment-gold-smooth border-[#d4af37]/35 text-[#f4e6d1] shadow-xl'
                          }`}
                        >
                          {/* Splendid Islamic Corner Ornaments */}
                          <div className={`absolute top-4 right-4 w-8 h-8 opacity-45 border-t-2 border-r-2 pointer-events-none ${
                            isLight ? 'border-[#b98e14]' : 'border-[#d4af37]'
                          }`}></div>
                          <div className={`absolute top-4 left-4 w-8 h-8 opacity-45 border-t-2 border-l-2 pointer-events-none ${
                            isLight ? 'border-[#b98e14]' : 'border-[#d4af37]'
                          }`}></div>
                          <div className={`absolute bottom-4 right-4 w-8 h-8 opacity-45 border-b-2 border-r-2 pointer-events-none ${
                            isLight ? 'border-[#b98e14]' : 'border-[#d4af37]'
                          }`}></div>
                          <div className={`absolute bottom-4 left-4 w-8 h-8 opacity-45 border-b-2 border-l-2 pointer-events-none ${
                            isLight ? 'border-[#b98e14]' : 'border-[#d4af37]'
                          }`}></div>
  
                          {/* Section Title Header */}
                          <div>
                            <div className={`flex justify-between items-center text-xs font-sans border-b pb-3 mb-6 select-none ${
                              isLight ? 'text-[#1b3225]/60 border-[#b98e14]/15' : 'text-[#f4e6d1]/60 border-[#d4af37]/20'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold px-2 py-0.5 rounded ${
                                  isLight ? 'bg-[#b98e14]/15 text-[#b98e14]' : 'bg-[#d4af37]/20 text-[#d4af37]'
                                }`}>ص {section.pageNumber}</span>
                                {isActive && isAudioPlaying && (
                                  <span className="animate-pulse flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-[#b98e14] text-white dark:bg-[#d4af37]/35 dark:text-[#d4af37]">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#d4af37] animate-ping"></span>
                                    <span>جاري الاستماع للقرّاءة 🎧</span>
                                  </span>
                                )}
                              </div>
                            
                            <div className="text-center mx-auto">
                              <h3 className={`font-serif text-2xl font-black leading-snug ${
                                isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'
                              }`}>
                                {section.title}
                              </h3>
                              {section.subtitle && (
                                <p className={`text-xs mt-0.5 font-bold ${isLight ? 'text-[#1b3225]/85' : 'text-[#f4e6d1]/85'}`}>
                                  ({section.subtitle})
                                </p>
                              )}
                            </div>

                            <span className={`font-sans font-bold ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>ريحانة الأرواح</span>
                          </div>

                          {/* Book Text Content */}
                          <div
                            className="flex flex-col gap-6 md:gap-8 pb-4"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {section.segments.map((segment, sIdx) => {
                              const isPoetry = segment.type === ContentType.INDIVIDUAL_POETRY || (segment.type === ContentType.CONGREGATIONAL && segment.content.includes('\n'));
                              return (
                                <div 
                                  key={sIdx} 
                                  className={`transition-all duration-300 leading-relaxed font-serif ${getSegmentColorClass(segment.type)}`}
                                >
                                  {isPoetry ? (
                                    <div className="text-center font-serif flex flex-col gap-3 py-1 font-bold">
                                      {segment.content.split('\n').map((line, lIdx) => (
                                        <p key={lIdx} className="italic tracking-wide text-pulse-gold-green">
                                          {line}
                                        </p>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="font-serif leading-loose tracking-wide text-right whitespace-pre-line">
                                      {segment.content}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* SPECIAL TRIGGER: Birth Section Standing (القيام) state button! */}
                        {section.isQiyamSection && (
                          <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            className={`my-5 p-5 rounded-3xl border text-center shadow-lg relative overflow-hidden flex flex-col items-center transition-all duration-1000 ${
                              isLight 
                                ? 'bg-[#1b3225] border-[#b98e14]/35 text-[#f4ebd0]' 
                                : 'bg-[#051a10] border-[#d4af37]/35 text-[#f4e6d1]'
                            }`}
                          >
                            <div className="absolute inset-0 bg-radial-gradient from-[#d4af37]/15 via-transparent to-transparent pointer-events-none"></div>
                            <Sparkles className={`w-8 h-8 mb-2 animate-bounce ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
                            <h4 className={`font-serif text-xl font-bold mb-1 ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>وُلِدَ الْهَادِي صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ!</h4>
                            <p className={`text-xs font-sans max-w-sm mb-4 ${isLight ? 'text-white/80' : 'text-[#f4e6d1]/80'}`}>
                              جرت عادة محبي المصطفى الوقوف تهليلاً وترحاباً بمولده الشريف. انضم لمجلس القيام الافتراضي للتسبيح والصلوات الجماعية.
                            </p>
                            
                            <button
                              onClick={() => setIsQiyamActive(true)}
                              className={`p-3 px-6 font-sans font-black text-sm rounded-xl transition duration-300 shadow cursor-pointer ${
                                isLight 
                                  ? 'bg-[#b98e14] hover:bg-[#b98e14]/90 text-white' 
                                  : 'bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#051a10]'
                              }`}
                            >
                              قُـمْ هَيْبَـةً لِلْحَبِيـبِ تَعْظِيمًـا ﷺ
                            </button>
                          </motion.div>
                        )}

                        {/* Card footer options */}
                        <div className="flex justify-between items-center text-[10px] font-sans opacity-60 pt-3 mt-4 border-t border-dashed border-[#b98e14]/20">
                          <button
                            onClick={() => {
                              setCurrentSectionIndex(idx);
                              const bookmark: Bookmark = {
                                sectionId: section.id,
                                pageNumber: section.pageNumber,
                                timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
                              };
                              localStorage.setItem('mawlid_bookmark', JSON.stringify(bookmark));
                              showToast(`تم حفظ علامة قراءة عند ص ${section.pageNumber} (${section.title})`);
                            }}
                            className={`px-2.5 py-1 rounded hover:bg-black/5 transition flex items-center gap-1.5 font-bold cursor-pointer ${
                              isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'
                            }`}
                          >
                            <BookMarked className="w-3.5 h-3.5 text-bounce-glow" />
                            <span>حفظ علامة هنا</span>
                          </button>
                          <span>الفصل {idx + 1} من {bookSections.length}</span>
                        </div>
                      </div>
                    );
                  })}

                    {/* Back to Top */}
                    <div className="flex justify-center mt-3 mb-6">
                      <button
                        onClick={() => {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                          showToast('تم الرجوع إلى أعلى الصفحة ✵');
                        }}
                        className={`py-2.5 px-6 rounded-full font-sans font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                          isLight 
                            ? 'bg-[#1b3225] text-white hover:bg-[#1b3225]/90 shadow border border-white/10' 
                            : 'bg-[#d4af37] text-[#051a10] hover:bg-[#d4af37]/90 shadow border border-white/5'
                        }`}
                      >
                        <ArrowRight className="w-4 h-4 rotate-90" />
                        <span>الرجوع إلى الأعلى</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`relative overflow-hidden border rounded-3xl p-6 md:p-8 text-right flex flex-col justify-between transition-all duration-1000 ${
                    isAudioPlaying
                      ? isLight
                        ? 'active-reading-light border-[#b98e14] text-[#1b3225] scale-[1.005] shadow-2xl relative z-10'
                        : 'active-reading-dark border-[#d4af37] text-[#f4e6d1] scale-[1.005] shadow-2xl relative z-10'
                      : isLight 
                        ? 'parchment-light-smooth border-[#b98e14]/25 text-[#1b3225] shadow-xl' 
                        : 'parchment-gold-smooth border-[#d4af37]/35 text-[#f4e6d1] shadow-xl'
                  }`}>
                    
                    {/* Splendid Islamic Corner Ornaments */}
                    <div className={`absolute top-4 right-4 w-8 h-8 opacity-45 border-t-2 border-r-2 pointer-events-none ${
                      isLight ? 'border-[#b98e14]' : 'border-[#d4af37]'
                    }`}></div>
                    <div className={`absolute top-4 left-4 w-8 h-8 opacity-45 border-t-2 border-l-2 pointer-events-none ${
                      isLight ? 'border-[#b98e14]' : 'border-[#d4af37]'
                    }`}></div>
                    <div className={`absolute bottom-4 right-4 w-8 h-8 opacity-45 border-b-2 border-r-2 pointer-events-none ${
                      isLight ? 'border-[#b98e14]' : 'border-[#d4af37]'
                    }`}></div>
                    <div className={`absolute bottom-4 left-4 w-8 h-8 opacity-45 border-b-2 border-l-2 pointer-events-none ${
                      isLight ? 'border-[#b98e14]' : 'border-[#d4af37]'
                    }`}></div>

                    {/* Section Title Header */}
                    <div>
                      <div className={`flex justify-between items-center text-xs font-sans border-b pb-3 mb-6 select-none ${
                        isLight ? 'text-[#1b3225]/60 border-[#b98e14]/15' : 'text-[#f4e6d1]/60 border-[#d4af37]/20'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-2 py-0.5 rounded ${
                            isLight ? 'bg-[#b98e14]/15 text-[#b98e14]' : 'bg-[#d4af37]/20 text-[#d4af37]'
                          }`}>ص {bookSections[currentSectionIndex].pageNumber}</span>
                          {isAudioPlaying && (
                            <span className="animate-pulse flex items-center gap-1 font-bold text-[10px] px-2.5 py-0.5 rounded-full bg-[#b98e14] text-white dark:bg-[#d4af37]/35 dark:text-[#d4af37]">
                              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#d4af37] animate-ping"></span>
                              <span>جاري الاستماع للقرّاءة 🎧</span>
                            </span>
                          )}
                        </div>
                        
                        <div className="text-center mx-auto">
                          <h3 className={`font-serif text-2xl font-black leading-snug ${
                            isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'
                          }`}>
                            {bookSections[currentSectionIndex].title}
                          </h3>
                          {bookSections[currentSectionIndex].subtitle && (
                            <p className={`text-xs mt-0.5 font-bold ${isLight ? 'text-[#1b3225]/85' : 'text-[#f4e6d1]/85'}`}>
                              ({bookSections[currentSectionIndex].subtitle})
                            </p>
                          )}
                        </div>

                        <span className={`font-sans font-bold ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>ريحانة الأرواح</span>
                      </div>

                      {/* Book Text Content with smooth fade transitions */}
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentSectionIndex}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.25 }}
                          className="flex flex-col gap-6 md:gap-8 pb-8"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {bookSections[currentSectionIndex].segments.map((segment, sIdx) => {
                            const isPoetry = segment.type === ContentType.INDIVIDUAL_POETRY || (segment.type === ContentType.CONGREGATIONAL && segment.content.includes('\n'));
                            return (
                              <div 
                                key={sIdx} 
                                className={`transition-all duration-300 leading-relaxed font-serif ${getSegmentColorClass(segment.type)}`}
                              >
                                {isPoetry ? (
                                  <div className="text-center font-serif flex flex-col gap-3 py-1 font-bold">
                                    {segment.content.split('\n').map((line, lIdx) => (
                                      <p key={lIdx} className="italic tracking-wide text-pulse-gold-green">
                                        {line}
                                      </p>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="font-serif leading-loose tracking-wide text-right whitespace-pre-line">
                                    {segment.content}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* SPECIAL TRIGGER: Birth Section Standing (القيام) state button! */}
                    {bookSections[currentSectionIndex].isQiyamSection && (
                      <motion.div 
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`my-5 p-5 rounded-3xl border text-center shadow-lg relative overflow-hidden flex flex-col items-center transition-all duration-1000 ${
                          isLight 
                            ? 'bg-[#1b3225] border-[#b98e14]/35 text-[#f4ebd0]' 
                            : 'bg-[#051a10] border-[#d4af37]/35 text-[#f4e6d1]'
                        }`}
                      >
                        <div className="absolute inset-0 bg-radial-gradient from-[#d4af37]/15 via-transparent to-transparent pointer-events-none"></div>
                        <Sparkles className={`w-8 h-8 mb-2 animate-bounce ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
                        <h4 className={`font-serif text-xl font-bold mb-1 ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`}>وُلِدَ الْهَادِي صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ!</h4>
                        <p className={`text-xs font-sans max-w-sm mb-4 ${isLight ? 'text-white/80' : 'text-[#f4e6d1]/80'}`}>
                          جرت عادة محبي المصطفى الوقوف تهليلاً وترحاباً بمولده الشريف. انضم لمجلس القيام الافتراضي للتسبيح والصلوات الجماعية.
                        </p>
                        
                        <button
                          onClick={() => setIsQiyamActive(true)}
                          className={`p-3 px-6 font-sans font-black text-sm rounded-xl transition duration-300 shadow cursor-pointer ${
                            isLight 
                              ? 'bg-[#b98e14] hover:bg-[#b98e14]/90 text-white' 
                              : 'bg-[#d4af37] hover:bg-[#d4af37]/90 text-[#051a10]'
                          }`}
                        >
                          قُـمْ هَيْبَـةً لِلْحَبِيـبِ تَعْظِيمًـا ﷺ
                        </button>
                      </motion.div>
                    )}

                    {/* Previous & Next Page controls inside footer of reader */}
                    <div className={`flex justify-between items-center border-t pt-4 mt-8 select-none font-sans text-xs ${
                      isLight ? 'border-[#b98e14]/15' : 'border-[#d4af37]/20'
                    }`}>
                      <button
                        onClick={handleNextSection}
                        disabled={currentSectionIndex === bookSections.length - 1}
                        className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl transition cursor-pointer ${
                          currentSectionIndex === bookSections.length - 1
                            ? isLight ? 'text-[#1b3225]/35 cursor-not-allowed opacity-35' : 'text-[#f4e6d1]/30 cursor-not-allowed opacity-35'
                            : isLight 
                              ? 'text-white bg-[#b98e14] hover:bg-[#b98e14]/85 border border-[#b98e14]/30' 
                              : 'text-[#d4af37] bg-[#0a2b1d] hover:bg-[#0a2b1d]/75 border border-[#d4af37]/30'
                        }`}
                      >
                        <ArrowLeft className="w-4 h-4 ml-1" />
                        <span>الفصل التالي</span>
                      </button>
                      
                      <span className={isLight ? 'text-[#1b3225]/75 font-bold' : 'text-[#f4e6d1]/75 font-bold'}>
                        الفصل {currentSectionIndex + 1} من {bookSections.length}
                      </span>

                      <button
                        onClick={handlePrevSection}
                        disabled={currentSectionIndex === 0}
                        className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl transition cursor-pointer ${
                          currentSectionIndex === 0
                            ? isLight ? 'text-[#1b3225]/35 cursor-not-allowed opacity-35' : 'text-[#f4e6d1]/30 cursor-not-allowed opacity-35'
                            : isLight 
                              ? 'text-white bg-[#b98e14] hover:bg-[#b98e14]/85 border border-[#b98e14]/30'
                              : 'text-[#d4af37] bg-[#0a2b1d] hover:bg-[#0a2b1d]/75 border border-[#d4af37]/30'
                        }`}
                      >
                        <span>الفصل السابق</span>
                        <ArrowRight className="w-4 h-4 mr-1" />
                      </button>
                    </div>

                  </div>
                )}

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </main>

      {/* FULLSCREEN IMMERSIVE CELEBRATIVE QIYAM MODAL (شاشة القيام وعقد الترحاب) */}
      <AnimatePresence>
        {isQiyamActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-hidden bg-slate-950/98 flex flex-col justify-between p-6 text-center font-serif select-none"
          >
            {/* Background glowing particles simulation helper */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-700/10 rounded-full filter blur-2xl animate-pulse"></div>
              {[...Array(15)].map((_, i) => (
                <div
                  key={i}
                  className="absolute float-leaf-anim text-gold-300/40 text-xl font-serif pointer-events-none"
                  style={{
                    left: `${15 + i * 5}%`,
                    bottom: `${10 + (i % 3) * 10}%`,
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${4 + (i % 2) * 2}s`
                  }}
                >
                  ✿
                </div>
              ))}
            </div>

            {/* Qiyam Header */}
            <div className="relative z-10 flex justify-between items-center max-w-4xl w-full mx-auto font-sans text-xs border-b border-gold-900/40 pb-4">
              <span className="text-gold-300 font-bold flex items-center gap-1">
                <Volume2 className="w-4 h-4 text-gold-400" />
                تنتشر العطور والرياحين بقراءتك
              </span>
              <h5 className="font-serif text-lg font-bold text-gold-400 text-pulse-gold-green">عَقْدُ الْقِيَامِ تَعْظِيمَاً لِلْمُصْطَفَى ﷺ</h5>
              <button
                onClick={() => setIsQiyamActive(false)}
                className="p-1 px-3.5 bg-red-950 text-red-300 hover:bg-red-900/60 border border-red-800/40 rounded-lg transition"
              >
                اجلس بسلام
              </button>
            </div>

            {/* Central glowing welcome frame */}
            <div className="relative z-10 max-w-2xl w-full mx-auto my-auto flex flex-col gap-6 py-4">
              
              <div className="p-0.5 rounded-3xl bg-gradient-to-tr from-gold-600 via-emerald-800 to-gold-400 shadow-2xl">
                <div className="bg-emerald-950/95 text-gold-100 rounded-2.5xl p-6 md:p-8 border border-gold-900/50 flex flex-col justify-around gap-6 relative">
                  
                  <div className="absolute top-4 right-4 w-6 h-6 border-t border-r border-gold-600/50"></div>
                  <div className="absolute top-4 left-4 w-6 h-6 border-t border-l border-gold-600/50"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b border-r border-gold-600/50"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b border-l border-gold-600/50"></div>

                  <span className="text-gold-500 font-sans text-xs tracking-widest font-bold">نشيد الترحيب الشريف (تواتر جماعي)</span>

                  {/* Welcome poetry */}
                  <div className="flex flex-col gap-4 md:gap-5 text-xl md:text-2xl font-extrabold text-gold-200">
                    <p className="animate-pulse">يَا مَرْحَبًا يَا مَرْحَبًا يَا نُورَ عَيْنِي</p>
                    <p className="text-gold-400">يَا مَرْحَبًا جَدَّ الْحُسَيْنِ</p>
                    <hr className="w-16 border-gold-800/40 mx-auto" />
                    <p className="animate-pulse" style={{ animationDelay: '1s' }}>يَا مَرْحَبًا يَا مَرْحَبًا بِالْهَاشِمِيِّ الْمُجْتَبَى</p>
                    <p className="text-gold-400">أَهْلًا بِهِ نُورًا بَدَا</p>
                  </div>
                </div>
              </div>

              {/* Interactive rosewater splash trigger */}
              <div className="flex flex-col items-center gap-3">
                <span className="text-xs font-sans text-white/50">اضغط على زر المرش الشريف لرش عطر الورد وجمع الترحاب:</span>
                
                <button
                  onClick={handleRosewaterSplash}
                  className="relative overflow-hidden w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 hover:brightness-110 active:brightness-90 text-emerald-950 font-sans font-black flex flex-col items-center justify-center shadow-lg ring-4 ring-white/15 focus:outline-none cursor-pointer"
                >
                  <Sparkles className="w-7 h-7 text-emerald-950 mb-1" />
                  <span className="text-[10px] tracking-wider font-bold">رش الورد</span>
                  
                  {/* Floating rosewater drops inside button visual container */}
                  {rosewaterSplashes.map(splash => (
                    <span 
                      key={splash.id}
                      className="absolute w-2 h-2 rounded-full bg-gold-100 animate-ping"
                      style={{ left: `${splash.x}px`, top: `${splash.y}px` }}
                    />
                  ))}
                </button>

                {/* Counter of virtual greetings in the room */}
                <span className="text-xs font-sans text-gold-300 font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  لقد رحبت بالحبيب ﷺ : <strong className="text-white text-sm">{qiyamCount}</strong> مرّات
                </span>
              </div>

            </div>

            {/* Qiyam Footer */}
            <div className="relative z-10 max-w-4xl w-full mx-auto text-xs font-sans text-white/40 border-t border-gold-900/30 pt-4">
              قال جابر بن سمرة رضي الله عنه: "رأيتُ رسولَ اللهِ ﷺ في ليلةٍ إضْحِيانٍ (مضيئة)، فجعلتُ أنظرُ إلى رسولِ اللهِ وإلى القمرِ، فلهو عندي أحسنُ من القمرِ"
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className={`relative z-10 border-t px-4 py-3.5 text-center text-xs select-none transition-all duration-1000 ${
        isLight ? 'border-[#b98e14]/15 bg-white/85' : 'border-[#d4af37]/20 bg-[#0a2b1d]/85'
      }`}>
        <p className={`font-sans font-medium ${isLight ? 'text-[#1b3225]/85' : 'text-[#f4e6d1]/75'}`}>
          تم تصميم وصقل هذا المولد التفاعلي شرفاً وفخراً ببعثة سيد الكونين رسول الله ﷺ
        </p>
        <p className={`font-sans text-[10px] mt-1 ${isLight ? 'text-[#1b3225]/50' : 'text-[#f4e6d1]/50'}`}>
          حقوق المخطوط محفوظة لمدرسة مصعب بن عمير القرآنية بطرابلس الغرب (1277 هـ | 1860 م)
        </p>
      </footer>

      {/* PWA MOBILE/DESKTOP INSTALL FLOATING BUTTON */}
      <AnimatePresence>
        {showInstallBtn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            className={`fixed bottom-6 right-6 z-45 max-w-[280px] sm:max-w-xs shadow-2xl rounded-2xl border p-3.5 flex flex-col gap-2.5 antialiased transition-all duration-1000 ${
              isLight 
                ? 'bg-gradient-to-br from-white to-[#f4ebd0] border-[#b98e14]/30 text-[#1b3225]' 
                : 'bg-gradient-to-br from-[#062315] to-[#01120a] border-[#d4af37]/30 text-[#f4e6d1]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg shrink-0 ${isLight ? 'bg-[#b98e14]/15 text-[#b98e14]' : 'bg-[#d4af37]/20 text-[#d4af37]'}`}>
                  <Smartphone className="w-4 h-4" />
                </div>
                <h4 className={`text-xs font-serif font-black ${isLight ? 'text-[#1b3225]' : 'text-[#d4af37]'}`}>
                  تطبيق الهاتف المستقل ✵
                </h4>
              </div>
              <button 
                onClick={handleDismissInstall}
                className={`p-1 rounded-full opacity-60 hover:opacity-100 transition duration-150 cursor-pointer ${isLight ? 'text-[#1b3225] hover:bg-[#1b3225]/10' : 'text-[#f4e6d1] hover:bg-[#f4e6d1]/10'}`}
                title="إغلاق اللوحة"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className={`text-[10px] sm:text-[11px] font-sans font-medium text-right leading-relaxed ${isLight ? 'text-[#1b3225]/80' : 'text-[#f4e6d1]/80'}`}>
              قم بتثبيت كتاب وقصة المولد على هاتفك أو حاسوبك للوصول السريع بدون متصفح وتصفح مريح للمجلس الشريف 📖🕌
            </p>

            <button
              onClick={handleInstallClick}
              className={`w-full py-2 px-3 rounded-xl text-xs font-sans font-extrabold flex items-center justify-center gap-1.5 shadow-md hover:shadow transition-all duration-300 transform active:scale-95 cursor-pointer ${
                isLight 
                  ? 'bg-[#b98e14] text-white hover:bg-[#9e760c]' 
                  : 'bg-[#d4af37] text-[#051a10] hover:bg-[#bca031]'
              }`}
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span>قم بتثبيت قصة المولد على هاتفك</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS SAFARI INSTALL GUIDE MODAL SHEET */}
      <AnimatePresence>
        {showIOSHint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`max-w-sm w-full rounded-3xl border p-6 text-right flex flex-col gap-4 relative shadow-2xl transition-all duration-1000 ${
                isLight ? 'bg-white border-[#b98e14]/40 text-[#1b3225]' : 'bg-[#062315] border-[#d4af37]/40 text-[#f4e6d1]'
              }`}
            >
              <button 
                onClick={() => setShowIOSHint(false)}
                className={`absolute top-4 left-4 p-1 rounded-full opacity-60 hover:opacity-100 transition cursor-pointer ${isLight ? 'hover:bg-black/5 text-[#1b3225]' : 'hover:bg-white/10 text-[#f4e6d1]'}`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b pb-3 border-dashed border-emerald-800/20">
                <div className={`p-2.5 rounded-2xl ${isLight ? 'bg-[#b98e14]/15 text-[#b98e14]' : 'bg-[#d4af37]/20 text-[#d4af37]'}`}>
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-black leading-snug">تثبيت التطبيق على آيفون / آيباد</h3>
                  <p className={`text-[10px] font-sans ${isLight ? 'text-[#1b3225]/60' : 'text-[#f4e6d1]/60'}`}>نظام iOS Safari</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 font-sans text-xs mt-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-800/20 flex items-center justify-center text-[10px] font-bold shrink-0">١</span>
                  <p className="leading-relaxed">انقر على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari السفلي (مربع يحمل سهم للأعلى 📤).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-800/20 flex items-center justify-center text-[10px] font-bold shrink-0">٢</span>
                  <p className="leading-relaxed">مرر للأسفل قليلاً داخل قائمة المشاركة حتى تجد خيار <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-800/20 flex items-center justify-center text-[10px] font-bold shrink-0">٣</span>
                  <p className="leading-relaxed">انقر فوقها ثم اضغط <strong>إضافة (Add)</strong> في أعلى الزاوية ليظهر التطبيق فوراً بجانب تطبيقاتك المستقلة! ✨</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSHint(false)}
                className={`mt-3 py-2.5 w-full rounded-2xl text-xs font-sans font-bold shadow-md cursor-pointer ${
                  isLight 
                    ? 'bg-[#1b3225] text-white hover:bg-emerald-950' 
                    : 'bg-[#d4af37] text-[#051a10] hover:bg-[#c39e2e]'
                }`}
              >
                فهمت، شكراً لك 🌱
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM PREMIUM INTERACTIVE TOAST BANNERS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`fixed bottom-6 left-6 z-50 p-4 rounded-xl shadow-lg border flex items-center gap-2.5 antialiased max-w-sm ${
              isLight 
                ? 'bg-[#1b3225] text-[#f4ebd0] border-[#b98e14]/35 shadow-xl' 
                : 'bg-[#0a2b1d] text-[#d4af37] border-[#d4af37]/45 shadow-2xl'
            }`}
          >
            <Sparkles className={`w-5 h-5 shrink-0 ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
            <span className="text-xs font-sans font-bold text-right leading-relaxed flex-1">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
