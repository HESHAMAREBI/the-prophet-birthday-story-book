/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Upload, Clock, ListMusic, 
  HelpCircle, ChevronDown, ChevronUp, Music, Sparkles, FileAudio, Youtube
} from 'lucide-react';

interface AudioChapter {
  id: string;
  title: string;
  start: number; // in seconds
  label: string;
}

const AUDIO_CHAPTERS: AudioChapter[] = [
  { id: "opening", title: "المقدمة وافتتاح المولد المبارك", start: 0, label: "00:00" },
  { id: "genealogy", title: "النسب الشريف والأصول المباركة", start: 7, label: "00:07" },
  { id: "birth", title: "فصل الولادة ورؤية الأنوار العالية", start: 23, label: "00:23" },
  { id: "qiyam", title: "مجلس القيام الشريف (يا مرحباً) ﷺ", start: 249, label: "04:09" },
  { id: "prophethood", title: "فصل البعثة النبوية ونور الهدى", start: 320, label: "05:20" },
  { id: "features", title: "الشمائل والصفات المحمدية", start: 360, label: "06:00" },
  { id: "supplication", title: "صلاة الأحباب ودعاء الختام", start: 390, label: "06:30" },
];

interface MawlidAudioPlayerProps {
  theme?: 'dark' | 'light';
  currentSectionId: string;
  onSectionSelect: (sectionIndex: number) => void;
  showToast: (msg: string) => void;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export default function MawlidAudioPlayer({ 
  theme = 'dark', 
  currentSectionId, 
  onSectionSelect,
  showToast,
  onPlayStateChange
}: MawlidAudioPlayerProps) {
  const isLight = theme === 'light';
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Notify parent of play state change
  useEffect(() => {
    if (onPlayStateChange) {
      onPlayStateChange(isPlaying);
    }
  }, [isPlaying, onPlayStateChange]);
  const [audioUrl, setAudioUrl] = useState<string | null>(() => {
    return localStorage.getItem('mawlid_linked_audio_url') || '/api/audio-proxy?id=1SNxmcM77tv-f3TkKL0C2OREtaBePye8o';
  });
  const [fileName, setFileName] = useState<string>(() => {
    return localStorage.getItem('mawlid_linked_audio_name') || 'تلاوة فصل الولادة والقيام الشريف - من الغوغل درايف ✵';
  });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playlistOpen, setPlaylistOpen] = useState<boolean>(false);
  const [autoSyncState, setAutoSyncState] = useState<boolean>(true);
  
  // URL Input States
  const [remoteUrlInput, setRemoteUrlInput] = useState<string>(() => {
    return localStorage.getItem('mawlid_original_input_url') || 'https://drive.google.com/file/d/1SNxmcM77tv-f3TkKL0C2OREtaBePye8o/view?usp=sharing';
  });
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);

  // Reference for storing file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Parse and automatically resolve Google Drive shared links to direct streams
  const cleanAndResolveUrl = (urlStr: string): string => {
    const cleanUrl = urlStr.trim();
    
    // Check for Google Drive share url
    if (cleanUrl.includes('drive.google.com')) {
      let fileId = '';
      // Pattern 1: /file/d/FILE_ID/view...
      const matchFileD = cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (matchFileD && matchFileD[1]) {
        fileId = matchFileD[1];
      } else {
        // Pattern 2: ?id=FILE_ID
        const matchOpenId = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (matchOpenId && matchOpenId[1]) {
          fileId = matchOpenId[1];
        }
      }
      
      if (fileId) {
        // Return same-origin proxy URL to prevent CORS/Sandbox blocking
        return `/api/audio-proxy?id=${fileId}`;
      }
    }
    
    return cleanUrl;
  };

  const handleLinkRemoteUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!remoteUrlInput.trim()) return;

    const resolved = cleanAndResolveUrl(remoteUrlInput.trim());
    setAudioUrl(resolved);
    
    let displayName = 'ملف صوتي خارجي من الرابط';
    if (remoteUrlInput.includes('drive.google.com')) {
      displayName = 'تلاوة المولد من Google Drive ✵';
    } else if (remoteUrlInput.includes('archive.org')) {
      displayName = 'تلاوة المولد من Internet Archive ✵';
    } else {
      try {
        const parsed = new URL(remoteUrlInput);
        displayName = `ملف صوتي من ${parsed.hostname}`;
      } catch (err) {
        // Fallback unchanged
      }
    }

    setFileName(displayName);
    localStorage.setItem('mawlid_linked_audio_url', resolved);
    localStorage.setItem('mawlid_linked_audio_name', displayName);
    localStorage.setItem('mawlid_original_input_url', remoteUrlInput.trim());

    // Reset player state
    setIsPlaying(false);
    setCurrentTime(0);

    showToast('تم ربط رابط الصوت بنجاح! جاري تحضير البث 🎧✨');
    setShowUrlInput(false);
  };

  const handleClearAudio = () => {
    if (audioUrl && audioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setFileName('لم يتم ربط ملف صوتي بعد');
    setRemoteUrlInput('');
    localStorage.removeItem('mawlid_linked_audio_url');
    localStorage.removeItem('mawlid_linked_audio_name');
    localStorage.removeItem('mawlid_original_input_url');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    showToast('تم إلغاء ربط الملف الصوتي ✵');
  };

  // Find active chapter from current playback time
  const [activeChapterId, setActiveChapterId] = useState<string>('opening');

  useEffect(() => {
    // Determine which chapter corresponds to current playing time
    let active = AUDIO_CHAPTERS[0].id;
    for (let i = AUDIO_CHAPTERS.length - 1; i >= 0; i--) {
      if (currentTime >= AUDIO_CHAPTERS[i].start) {
        active = AUDIO_CHAPTERS[i].id;
        break;
      }
    }
    setActiveChapterId(active);

    // If autoSync is enabled and the audio changes chapter, change the book section!
    if (autoSyncState) {
      const idx = getSectionIndexById(active);
      if (idx !== -1 && active !== currentSectionId) {
        // Sync book display with audio
        onSectionSelect(idx);
      }
    }
  }, [currentTime]);

  // Sync audio to book section when user navigates manually and clicks "Play Section"
  const getSectionIndexById = (id: string): number => {
    if (id === 'qiyam') {
      // Find birth section which contains qiyam
      return 3; 
    }
    const sectionIds = ["opening", "genealogy", "pregnancy", "birth", "prophethood", "features", "supplication"];
    return sectionIds.indexOf(id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (audioUrl && audioUrl.startsWith('blob:')) {
        URL.revokeObjectURL(audioUrl);
      }
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setFileName(file.name);
      localStorage.setItem('mawlid_linked_audio_name', file.name);
      
      // Reset play state
      setIsPlaying(false);
      setCurrentTime(0);
      
      showToast('تم ربط الملف الصوتي بنجاح! جاهز للتلاوة والمزامنة 📖🎧');
    }
  };

  const handleTogglePlay = () => {
    if (!audioUrl) {
      // Prompt user to select file
      fileInputRef.current?.click();
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Audio playback error:", err);
          showToast("تعذر تشغيل الصوت. يرجى إعادة اختيار الملف.");
        });
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const jumpToChapter = (chapter: AudioChapter) => {
    handleSeek(chapter.start);
    const idx = getSectionIndexById(chapter.id);
    if (idx !== -1) {
      onSectionSelect(idx);
    }
    // If paused, trigger play
    if (!isPlaying && audioRef.current) {
      audioRef.current.play().then(() => setIsPlaying(true));
    }
    showToast(`انتقل السماع إلى: ${chapter.title} ✵`);
  };

  // Format time (mm:ss)
  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return "00:00";
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sync volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    setIsMuted(v === 0);
    if (audioRef.current) {
      audioRef.current.volume = v;
      audioRef.current.muted = v === 0;
    }
  };

  const handleToggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      audioRef.current.muted = nextMuted;
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
    showToast(`سرعة القراءة: ${rate}x`);
  };

  // Listen to external chapter changes to seek naturally if autoSync is on
  useEffect(() => {
    if (!audioRef.current || !autoSyncState) return;
    
    // Find chapter matching newly selected book section
    let targetId = currentSectionId;
    // Map birth page to either normal birth reading or qiyam if requested
    const targetChapter = AUDIO_CHAPTERS.find(c => c.id === targetId);
    if (targetChapter) {
      // If audio is far away from the chapter's start, jump to it
      const diff = Math.abs(currentTime - targetChapter.start);
      if (diff > 5) {
        audioRef.current.currentTime = targetChapter.start;
        setCurrentTime(targetChapter.start);
      }
    }
  }, [currentSectionId]);

  return (
    <div className={`border rounded-3xl p-5 shadow-lg transition-all duration-300 ${
      isLight 
        ? 'bg-[#fcfaf2] border-[#b98e14]/25 text-[#1b3225]' 
        : 'bg-[#092215] border-[#d4af37]/35 text-[#f4e6d1]'
    }`}>
      {/* Hidden inputs & audio engine */}
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="audio/*,video/*"
        className="hidden" 
      />
      {audioUrl && (
        <audio 
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-dashed border-emerald-800/20">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl shrink-0 ${isLight ? 'bg-[#b98e14]/10 text-[#b98e14]' : 'bg-[#d4af37]/15 text-[#d4af37]'}`}>
            <FileAudio className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-right">
            <h4 className="font-serif font-black text-sm">مزامنة التلاوة الصوتية الحية</h4>
            <div className="flex items-center gap-2">
              <p className={`text-[11px] font-sans truncate max-w-[200px] ${isLight ? 'text-[#1b3225]/70' : 'text-[#f4e6d1]/65'}`}>
                {fileName}
              </p>
              {audioUrl && (
                <button
                  onClick={handleClearAudio}
                  className="text-[10px] underline hover:no-underline font-sans cursor-pointer text-red-500 font-bold"
                  title="إلغاء الملف الصوتي المربوط حالياً"
                >
                  (قطع الربط ✕)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sync Controls / Upload / Link btn */}
        <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
          <button
            onClick={() => {
              setAutoSyncState(!autoSyncState);
              showToast(autoSyncState ? "تم تعطيل المحاذاة التلقائية" : "تم تفعيل محاذاة صفحات الكتاب مع الصوت");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold cursor-pointer transition ${
              autoSyncState 
                ? isLight ? 'bg-[#b98e14]/15 text-[#b98e14]' : 'bg-[#d4af37]/15 text-[#d4af37]'
                : 'opacity-40 hover:opacity-100'
            }`}
            title="مزامنة تصفّح الكتاب مع توقيت الصوت تلقائياً"
          >
            {autoSyncState ? '✦ مزامنة الصفحات' : 'مزامنة معطلة'}
          </button>
          
          <button
            onClick={() => {
              setShowUrlInput(false);
              fileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm transition border cursor-pointer ${
              isLight 
                ? 'bg-white border-[#b98e14]/30 hover:bg-[#b98e14]/5 text-[#b98e14]' 
                : 'bg-[#051a10] border-[#d4af37]/35 hover:bg-[#d4af37]/15 text-[#d4af37]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ملف محلي</span>
          </button>

          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-sm transition border cursor-pointer ${
              showUrlInput
                ? 'bg-[#b98e14] text-white border-transparent'
                : isLight 
                  ? 'bg-white border-[#b98e14]/30 hover:bg-[#b98e14]/5 text-[#b98e14]' 
                  : 'bg-[#051a10] border-[#d4af37]/35 hover:bg-[#d4af37]/15 text-[#d4af37]'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>رابط أو Google Drive</span>
          </button>
        </div>
      </div>

      {/* Collapsible Remote URL input form */}
      {showUrlInput && (
        <form onSubmit={handleLinkRemoteUrl} className="mt-3 p-3.5 rounded-2xl border border-dashed border-emerald-800/30 flex flex-col gap-2 animate-fadeIn">
          <label className="text-xs font-serif font-black text-right block mb-1">
            أدخل رابط الملف الصوتي المباشر أو رابط مشاركة Google Drive للملف:
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              required
              placeholder="https://drive.google.com/file/d/... أو رابط مستقل"
              value={remoteUrlInput}
              onChange={(e) => setRemoteUrlInput(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-mono direction-ltr focus:outline-none border ${
                isLight 
                  ? 'bg-white border-[#b98e14]/30 text-[#1b3225] focus:border-[#b98e14]' 
                  : 'bg-[#051a10] border-[#d4af37]/30 text-white focus:border-[#d4af37]'
              }`}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-xl text-xs font-sans font-bold shadow transition cursor-pointer shrink-0 ${
                isLight 
                  ? 'bg-[#b98e14] text-white hover:bg-[#b98e14]/95 shadow-md' 
                  : 'bg-[#d4af37] text-[#051a10] hover:bg-[#d4af37]/90 hover:shadow shadow-sm'
              }`}
            >
              ربط الرابط
            </button>
          </div>
          <span className={`text-[10px] font-sans mt-1 text-right leading-relaxed ${isLight ? 'text-[#1b3225]/75' : 'text-[#f4e6d1]/75'}`}>
            ✵ <strong>ملاحظة في غوغل درايف:</strong> تأكد من جعل مشاركة الملف متوفرة "لأي شخص لديه الرابط" (Anyone with the link can view) ثم الصق الرابط هنا وسنقوم بتحويله للبث المباشر تلقائياً!
          </span>
        </form>
      )}

      {/* Quick notice if no file selected */}
      {!audioUrl && !showUrlInput && (
        <div className={`mt-3 p-3.5 rounded-2xl text-xs font-sans text-right leading-relaxed border ${
          isLight ? 'bg-[#b98e14]/5 border-[#b98e14]/15 text-[#1b3225]/85' : 'bg-emerald-950/20 border-[#d4af37]/15 text-[#f4e6d1]/80'
        }`}>
          <div className="flex items-start gap-2">
            <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'}`} />
            <p>
              <strong>لسماع المولد بصوت القارئ ومتابعة قراءته:</strong> يرجى اختيار <span className="font-bold underline text-pulse-gold-green">ملف محلي</span> من جهازك، أو الضغط على زر <span className="font-bold underline text-pulse-gold-green">رابط أو Google Drive</span> لتضمين رابط مشاركة تلاوة المولد (مثل الملف المرفق)! وسوف ينقسم الصوت على فصول المولد تلقائياً لمتابعة القراءة.
            </p>
          </div>
        </div>
      )}

      {/* Main Play Controls */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-mono font-bold">{formatTime(currentTime)}</span>
          
          {/* Progress Slider */}
          <div className="flex-1 relative group py-1">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              disabled={!audioUrl}
              className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer outline-none transition-all ${
                isLight ? 'accent-[#b98e14] bg-[#f4ebd0]' : 'accent-[#d4af37] bg-[#051a10]'
              }`}
            />
          </div>

          <span className="text-xs font-mono font-bold">{formatTime(duration)}</span>
        </div>

        {/* control buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          
          {/* Speed presets */}
          <div className="flex items-center gap-1 border border-dashed border-emerald-800/20 rounded-lg p-0.5">
            {[0.8, 1.0, 1.2, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => handleSpeedChange(rate)}
                disabled={!audioUrl}
                className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold cursor-pointer transition ${
                  playbackRate === rate
                    ? isLight ? 'bg-[#b98e14] text-white' : 'bg-[#d4af37] text-[#051a10]'
                    : 'opacity-60 hover:opacity-100'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Core play/pause node */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-md transform hover:scale-105 active:scale-95 cursor-pointer ${
                isPlaying 
                  ? isLight ? 'bg-[#b98e14] text-white hover:bg-[#b98e14]/90' : 'bg-[#d4af37] text-[#051a10] hover:bg-[#d4af37]/90'
                  : isLight ? 'bg-[#1b3225] text-white hover:bg-[#1b3225]/90' : 'bg-[#d4af37] text-[#051a10] hover:bg-[#d4af37]/90'
              }`}
              title={isPlaying ? "إيقاف مؤقت للتلاوة" : "تشغيل التلاوة الصوتية"}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 translate-x-[1px]" />}
            </button>
          </div>

          {/* Volume node */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              disabled={!audioUrl}
              className={`p-1.5 rounded-lg transition-colors ${
                isLight ? 'text-[#b98e14] hover:bg-[#b98e14]/5' : 'text-[#d4af37] hover:bg-[#d4af37]/5'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!audioUrl}
              className={`w-14 md:w-20 h-1 rounded-lg cursor-pointer ${
                isLight ? 'accent-[#b98e14] bg-[#f4ebd0]' : 'accent-[#d4af37] bg-[#051a10]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Chapters Playlist (Collapsible) */}
      <div className="mt-4 border-t border-emerald-800/15 pt-2">
        <button
          onClick={() => setPlaylistOpen(!playlistOpen)}
          className={`w-full py-1.5 flex items-center justify-between text-xs font-sans font-bold opacity-80 hover:opacity-100 cursor-pointer ${
            isLight ? 'text-[#b98e14]' : 'text-[#d4af37]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ListMusic className="w-4 h-4" />
            <span>فهرس أوقات التلاوة الموزعة ({AUDIO_CHAPTERS.length})</span>
          </div>
          {playlistOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {playlistOpen && (
          <div className="mt-2 flex flex-col gap-1.5 max-h-[180px] overflow-y-auto pr-1">
            {AUDIO_CHAPTERS.map((chapter) => {
              const isActive = activeChapterId === chapter.id;
              return (
                <button
                  key={chapter.id}
                  onClick={() => jumpToChapter(chapter)}
                  disabled={!audioUrl}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs font-serif font-black text-right transition cursor-pointer ${
                    isActive
                      ? isLight ? 'bg-[#b98e14]/15 border-r-4 border-[#b98e14] text-[#1b3225]' : 'bg-[#d4af37]/15 border-r-4 border-[#d4af37] text-white'
                      : isLight ? 'hover:bg-[#1b3225]/5 text-[#1b3225]/80' : 'hover:bg-[#f4e6d1]/5 text-[#f4e6d1]/85'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {isActive && <Sparkles className="w-3.5 h-3.5 text-bounce-glow shrink-0 animate-spin" style={{ animationDuration: '6s' }} />}
                    <span>{chapter.title}</span>
                  </div>
                  <div className="flex items-center gap-1 font-sans text-[10px] opacity-65 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{chapter.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
