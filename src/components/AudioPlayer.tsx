/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Wind } from 'lucide-react';

interface AudioPlayerProps {
  theme?: 'dark' | 'light';
}

export default function AudioPlayer({ theme = 'dark' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.2); // Low default to keep it ambient
  const [soundMode, setSoundMode] = useState<'drone' | 'wind'>('drone');
  const isLight = theme === 'light';

  // Web Audio Context References
  const audioCtxRef = useRef<AudioContext | null>(null);
  const droneOscsRef = useRef<OscillatorNode[]>([]);
  const windNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize Audio Context on demand (due to browser autoplay policies)
  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      gainNodeRef.current = audioCtxRef.current.createGain();
      gainNodeRef.current.gain.setValueAtTime(volume, audioCtxRef.current.currentTime);
      gainNodeRef.current.connect(audioCtxRef.current.destination);
    }
  };

  const startDrone = () => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;
    
    // Stop prior sounds
    stopAllSounds();

    // Create a rich multi-vocal harmonic drone (D Pentatonic - Spiritually relaxing scale)
    // Frequencies: D2 (73.42Hz), A2 (110Hz), D3 (146.83Hz), F#3 (185Hz), A3 (220Hz)
    const baseFreqs = [73.42, 110.00, 146.83, 185.00, 220.00];
    
    baseFreqs.forEach((freq, idx) => {
      if (!audioCtxRef.current || !gainNodeRef.current) return;
      
      const osc = audioCtxRef.current.createOscillator();
      const oscGain = audioCtxRef.current.createGain();
      
      // Let base drone be soft triangles, high vocals sine
      osc.type = idx < 2 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);
      
      // Add slight detune for a rich lush chorus feel
      osc.detune.setValueAtTime(Math.sin(idx) * 4, audioCtxRef.current.currentTime);
      
      // Volume balancing according to pitch
      const pitchVol = idx < 2 ? 0.35 : 0.15;
      oscGain.gain.setValueAtTime(0, audioCtxRef.current.currentTime);
      oscGain.gain.linearRampToValueAtTime(pitchVol, audioCtxRef.current.currentTime + 2.0); // Slow fade-in
      
      // Hook up
      osc.connect(oscGain);
      oscGain.connect(gainNodeRef.current);
      osc.start();
      
      // Track reference to stop later
      droneOscsRef.current.push(osc);
    });
  };

  const startWind = () => {
    if (!audioCtxRef.current || !gainNodeRef.current) return;

    stopAllSounds();

    // Synthesis of soft pink noise breeze using ScriptProcessor Node
    try {
      const bufferSize = 4096;
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      
      const processor = audioCtxRef.current.createScriptProcessor(bufferSize, 1, 1);
      
      processor.onaudioprocess = (e) => {
        const output = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink noise filter coefficients
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          
          // Modulate with very slow sine wave to simulate wind waves
          const time = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
          const windWave = 0.4 + 0.3 * Math.sin(time * 0.3) + 0.1 * Math.sin(time * 0.95);
          
          output[i] = pink * 0.05 * windWave;
        }
      };

      // Filter to make wind warmer and less high-pitched
      const filter = audioCtxRef.current.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, audioCtxRef.current.currentTime);
      filter.Q.setValueAtTime(2.0, audioCtxRef.current.currentTime);

      processor.connect(filter);
      filter.connect(gainNodeRef.current);
      windNodeRef.current = processor;
    } catch (e) {
      console.error("Web Audio ScriptProcessor error:", e);
    }
  };

  const stopAllSounds = () => {
    // Stop drone oscillators
    droneOscsRef.current.forEach(osc => {
      try { osc.stop(); } catch (err) {}
    });
    droneOscsRef.current = [];

    // Disconnect wind processor
    if (windNodeRef.current) {
      try { windNodeRef.current.disconnect(); } catch (err) {}
      windNodeRef.current = null;
    }
  };

  // Turn on/off
  const handleTogglePlay = () => {
    initAudio();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (isPlaying) {
      stopAllSounds();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (soundMode === 'drone') {
        startDrone();
      } else {
        startWind();
      }
    }
  };

  // Adjust volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVolume = parseFloat(e.target.value);
    setVolume(nextVolume);
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(nextVolume, audioCtxRef.current.currentTime);
    }
  };

  // Change mode
  const handleSoundMode = (mode: 'drone' | 'wind') => {
    setSoundMode(mode);
    if (isPlaying) {
      initAudio();
      if (mode === 'drone') {
        startDrone();
      } else {
        startWind();
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <div className={`flex items-center gap-4 border py-2.5 px-4 rounded-2xl shadow-md backdrop-blur-md ${
      isLight 
        ? 'bg-[#fbfbf9]/95 border-[#b98e14]/25' 
        : 'bg-[#0a2b1d]/90 border-[#d4af37]/35'
    }`}>
      
      {/* Play/Pause Button */}
      <button
        onClick={handleTogglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          isPlaying 
            ? isLight 
              ? 'bg-[#b98e14] text-white hover:bg-[#b98e14]/90 shadow-md' 
              : 'bg-[#d4af37] text-[#051a10] hover:bg-[#d4af37]/90 shadow-md' 
            : isLight 
              ? 'bg-[#f4ebd0] text-[#b98e14] hover:bg-[#f4ebd0]/75 border border-[#b98e14]/20' 
              : 'bg-[#051a10] text-[#d4af37] hover:bg-[#051a10]/65 border border-[#d4af37]/25'
        }`}
        title={isPlaying ? "إيقاف الصوت الروحاني" : "تشغيل الخلفية الروحانية"}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-[1px]" />}
      </button>

      {/* Select Mode */}
      <div className={`flex gap-1.5 border rounded-lg p-0.5 ${
        isLight 
          ? 'border-[#b98e14]/20 bg-[#f4ebd0]/30' 
          : 'border-[#d4af37]/20 bg-[#051a10]/50'
      }`}>
        <button
          onClick={() => handleSoundMode('drone')}
          className={`px-2.5 py-1 text-xs font-sans rounded-md transition-all flex items-center gap-1 ${
            soundMode === 'drone'
              ? isLight 
                ? 'bg-[#b98e14] text-white font-bold shadow-sm' 
                : 'bg-[#d4af37] text-[#051a10] font-bold shadow-sm'
              : isLight 
                ? 'text-[#1b3225]/60 hover:text-[#b98e14]' 
                : 'text-[#f4e6d1]/60 hover:text-[#d4af37]'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>سكينة دافئة</span>
        </button>
        <button
          onClick={() => handleSoundMode('wind')}
          className={`px-2.5 py-1 text-xs font-sans rounded-md transition-all flex items-center gap-1 ${
            soundMode === 'wind'
              ? isLight 
                ? 'bg-[#b98e14] text-white font-bold shadow-sm' 
                : 'bg-[#d4af37] text-[#051a10] font-bold shadow-sm'
              : isLight 
                ? 'text-[#1b3225]/60 hover:text-[#b98e14]' 
                : 'text-[#f4e6d1]/60 hover:text-[#d4af37]'
          }`}
        >
          <Wind className="w-3.5 h-3.5" />
          <span>نسيم الصحراء</span>
        </button>
      </div>

      {/* Volume Bar */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => {
            const nextVol = volume > 0 ? 0 : 0.25;
            setVolume(nextVol);
            if (gainNodeRef.current && audioCtxRef.current) {
              gainNodeRef.current.gain.setValueAtTime(nextVol, audioCtxRef.current.currentTime);
            }
          }}
          className={isLight ? 'text-[#b98e14] hover:text-[#b98e14]/80' : 'text-[#d4af37] hover:text-[#d4af37]/80'}
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="0.5"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className={`w-16 md:w-24 h-1 rounded-lg cursor-pointer ${
            isLight 
              ? 'accent-[#b98e14] bg-[#f4ebd0]' 
              : 'accent-[#d4af37] bg-[#051a10]'
          }`}
        />
      </div>
      
    </div>
  );
}
