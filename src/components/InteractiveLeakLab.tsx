import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sliders, 
  Crosshair, 
  Volume2, 
  VolumeX, 
  Activity, 
  Droplet, 
  RotateCcw,
  Zap, 
  Radio, 
  Power,
  Play,
  Pause,
  Waves,
  Gauge,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  HelpCircle
} from 'lucide-react';

interface PipeMaterial {
  name: string;
  speedOfSound: number; // m/s
  description: string;
  badgeColor: string;
  borderGlow: string;
}

const PIPE_MATERIALS: PipeMaterial[] = [
  { 
    name: 'Schedule 40 PVC', 
    speedOfSound: 1400, 
    description: 'High acoustic damping • Common residential supply',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderGlow: 'hover:border-cyan-400'
  },
  { 
    name: 'Galvanized Mild Steel', 
    speedOfSound: 3200, 
    description: 'Rapid acoustic propagation • Industrial mains',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    borderGlow: 'hover:border-blue-400'
  },
  { 
    name: 'Cast Iron', 
    speedOfSound: 3850, 
    description: 'High rigidity transmission • Municipal trunk pipeline',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    borderGlow: 'hover:border-indigo-400'
  },
  { 
    name: 'Copper Tube', 
    speedOfSound: 3700, 
    description: 'High-frequency resonance • Commercial building riser',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    borderGlow: 'hover:border-amber-400'
  },
];

interface OrificeType {
  id: string;
  name: string;
  diameterMm: number;
  flowCoeff: number; // multiplier for L/min
  freqCenter: number; // Hz
  color: string;
  accentBg: string;
  borderColor: string;
  tag: string;
}

const ORIFICE_TYPES: OrificeType[] = [
  { 
    id: 'micro', 
    name: 'Micro-Fissure', 
    diameterMm: 0.5, 
    flowCoeff: 0.08, 
    freqCenter: 820, 
    color: 'text-indigo-400',
    accentBg: 'bg-indigo-500/10 hover:bg-indigo-500/20',
    borderColor: 'border-indigo-500/40',
    tag: 'Ultrasonic 820 Hz'
  },
  { 
    id: 'pinhole', 
    name: 'Pinhole Jet', 
    diameterMm: 1.5, 
    flowCoeff: 0.45, 
    freqCenter: 640, 
    color: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10 hover:bg-cyan-500/20',
    borderColor: 'border-cyan-500/40',
    tag: 'Cavitation 640 Hz'
  },
  { 
    id: 'crack', 
    name: 'Joint Fracture', 
    diameterMm: 3.2, 
    flowCoeff: 1.85, 
    freqCenter: 410, 
    color: 'text-amber-400',
    accentBg: 'bg-amber-500/10 hover:bg-amber-500/20',
    borderColor: 'border-amber-500/40',
    tag: 'Turbulent 410 Hz'
  },
  { 
    id: 'shear', 
    name: 'Flange Shear', 
    diameterMm: 5.0, 
    flowCoeff: 4.20, 
    freqCenter: 260, 
    color: 'text-rose-400',
    accentBg: 'bg-rose-500/10 hover:bg-rose-500/20',
    borderColor: 'border-rose-500/40',
    tag: 'Rupture 260 Hz'
  },
];

const PRESETS = [
  { label: 'Mid-Span Pinhole', pos: 2.35, press: 3.5, orifId: 'pinhole', matName: 'Schedule 40 PVC' },
  { label: 'High-Pressure Rupture', pos: 3.80, press: 5.2, orifId: 'shear', matName: 'Galvanized Mild Steel' },
  { label: 'Hairline Joint Micro-Leak', pos: 1.15, press: 2.4, orifId: 'micro', matName: 'Cast Iron' },
  { label: 'Inlet Fitting Stress', pos: 0.85, press: 4.0, orifId: 'crack', matName: 'Copper Tube' },
];

export const InteractiveLeakLab: React.FC = () => {
  // Interactive Simulation State
  const [leakPosition, setLeakPosition] = useState<number>(2.35); // 0.10m to 4.90m
  const [selectedOrifice, setSelectedOrifice] = useState<OrificeType>(ORIFICE_TYPES[1]);
  const [pressureBar, setPressureBar] = useState<number>(3.5); // 1.0 to 6.0 bar
  const [selectedMaterial, setSelectedMaterial] = useState<PipeMaterial>(PIPE_MATERIALS[0]);
  const [solenoidOpen, setSolenoidOpen] = useState<boolean>(true);
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [autoIsolateEnabled, setAutoIsolateEnabled] = useState<boolean>(true);
  const [isAutoScanning, setIsAutoScanning] = useState<boolean>(false);
  const [hoverMeter, setHoverMeter] = useState<number | null>(null);

  // Sensor node fixed coordinates along the 5.0-meter pipe with vibrant unique identity
  const sensorNodes = [
    { 
      id: 'PG-01', 
      label: 'Sensor 01 (Inlet)', 
      x: 0.6, 
      color: '#06b6d4', 
      glowClass: 'shadow-[0_0_15px_rgba(6,182,212,0.6)]',
      textColor: 'text-cyan-400',
      bgTag: 'bg-cyan-500/10 border-cyan-500/30'
    },
    { 
      id: 'PG-02', 
      label: 'Sensor 02 (Mid Alpha)', 
      x: 1.6, 
      color: '#38bdf8', 
      glowClass: 'shadow-[0_0_15px_rgba(56,189,248,0.6)]',
      textColor: 'text-sky-400',
      bgTag: 'bg-sky-500/10 border-sky-500/30'
    },
    { 
      id: 'PG-03', 
      label: 'Sensor 03 (Mid Beta)', 
      x: 2.6, 
      color: '#818cf8', 
      glowClass: 'shadow-[0_0_15px_rgba(129,140,248,0.6)]',
      textColor: 'text-indigo-400',
      bgTag: 'bg-indigo-500/10 border-indigo-500/30'
    },
    { 
      id: 'PG-04', 
      label: 'Sensor 04 (Outlet)', 
      x: 3.6, 
      color: '#34d399', 
      glowClass: 'shadow-[0_0_15px_rgba(52,211,153,0.6)]',
      textColor: 'text-emerald-400',
      bgTag: 'bg-emerald-500/10 border-emerald-500/30'
    },
  ];

  // Web Audio Synthesizer ref for acoustic cavitation noise
  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Automated Scanning Loop
  useEffect(() => {
    if (!isAutoScanning) return;
    let direction = 1;
    const interval = setInterval(() => {
      setLeakPosition((prev) => {
        let next = prev + 0.04 * direction;
        if (next >= 4.4) {
          direction = -1;
          next = 4.4;
        } else if (next <= 0.6) {
          direction = 1;
          next = 0.6;
        }
        return +next.toFixed(2);
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isAutoScanning]);

  // Calculate actual physics metrics
  const effectivePressure = solenoidOpen ? pressureBar : 0;
  const leakRateLpm = solenoidOpen ? +(selectedOrifice.flowCoeff * Math.sqrt(effectivePressure) * 2.2).toFixed(2) : 0;
  const isLeaking = solenoidOpen && leakRateLpm > 0;
  const dailyLossLiters = +(leakRateLpm * 60 * 24).toFixed(0);
  const costEstimateRupees = Math.round((dailyLossLiters / 1000) * 45); // ~₹45 per kiloliter commercial tariff

  // Calculate sensor arrival times and amplitudes
  const sensorCalculations = useMemo(() => {
    return sensorNodes.map((sensor) => {
      const distance = Math.abs(leakPosition - sensor.x);
      // Arrival time in ms = (distance / speed) * 1000
      const arrivalTimeMs = isLeaking ? (distance / selectedMaterial.speedOfSound) * 1000 : 0;
      // Attenuation factor based on pipe material elasticity
      const attenuationFactor = selectedMaterial.name.includes('PVC') ? 0.62 : 0.32;
      const baseAmplitude = isLeaking ? Math.min(100, Math.max(12, (selectedOrifice.diameterMm * 14) + (effectivePressure * 8))) : 0;
      const receivedAmplitude = isLeaking ? Math.max(4, +(baseAmplitude * Math.exp(-attenuationFactor * distance)).toFixed(1)) : 2.5;

      return {
        ...sensor,
        distance: +distance.toFixed(2),
        arrivalTimeMs: +arrivalTimeMs.toFixed(3),
        amplitude: receivedAmplitude,
      };
    });
  }, [leakPosition, selectedOrifice, effectivePressure, selectedMaterial, isLeaking]);

  // Determine the primary sensor pair bracketing the leak
  const bracketPair = useMemo(() => {
    let sLeft = sensorNodes[0];
    let sRight = sensorNodes[1];

    if (leakPosition <= sensorNodes[1].x) {
      sLeft = sensorNodes[0];
      sRight = sensorNodes[1];
    } else if (leakPosition <= sensorNodes[2].x) {
      sLeft = sensorNodes[1];
      sRight = sensorNodes[2];
    } else {
      sLeft = sensorNodes[2];
      sRight = sensorNodes[3];
    }

    const calcLeft = sensorCalculations.find((s) => s.id === sLeft.id)!;
    const calcRight = sensorCalculations.find((s) => s.id === sRight.id)!;
    const deltaT_ms = +(calcRight.arrivalTimeMs - calcLeft.arrivalTimeMs).toFixed(3);
    
    // TDOA Spatial Pinpoint Calculation:
    // x = (xLeft + xRight - c * deltaT) / 2
    const c = selectedMaterial.speedOfSound;
    const calculatedLocation = isLeaking 
      ? +(((sLeft.x + sRight.x) / 2) - ((c * (deltaT_ms / 1000)) / 2)).toFixed(2)
      : 0;
    
    const localizationErrorCm = isLeaking ? +(Math.abs(calculatedLocation - leakPosition) * 100).toFixed(1) : 0;
    const confidencePercent = isLeaking ? Math.max(88, +(100 - (localizationErrorCm * 1.5)).toFixed(1)) : 99.9;

    return {
      sLeft: calcLeft,
      sRight: calcRight,
      deltaT_ms,
      calculatedLocation,
      localizationErrorCm,
      confidencePercent,
    };
  }, [leakPosition, sensorCalculations, selectedMaterial, isLeaking]);

  // Trigger auto-isolation if leak is critical (> 3.0 L/min)
  useEffect(() => {
    if (autoIsolateEnabled && solenoidOpen && leakRateLpm > 3.0) {
      const timer = setTimeout(() => {
        setSolenoidOpen(false);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [autoIsolateEnabled, solenoidOpen, leakRateLpm]);

  // Audio synthesizer lifecycle
  useEffect(() => {
    if (!isAudioPlaying) {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(selectedOrifice.freqCenter + (effectivePressure * 60), ctx.currentTime);
      filter.Q.setValueAtTime(3.5, ctx.currentTime);
      filterNodeRef.current = filter;

      const gain = ctx.createGain();
      const targetGain = isLeaking ? Math.min(0.25, (selectedOrifice.diameterMm * 0.04) + (effectivePressure * 0.02)) : 0;
      gain.gain.setValueAtTime(targetGain, ctx.currentTime);
      gainNodeRef.current = gain;

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();
      noiseNodeRef.current = whiteNoise;
    } catch {
      setIsAudioPlaying(false);
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    };
  }, [isAudioPlaying]);

  // Update audio filter dynamically when sliders move
  useEffect(() => {
    if (audioCtxRef.current && filterNodeRef.current && gainNodeRef.current) {
      const ctx = audioCtxRef.current;
      const targetFreq = selectedOrifice.freqCenter + (effectivePressure * 60);
      const targetGain = isLeaking ? Math.min(0.25, (selectedOrifice.diameterMm * 0.04) + (effectivePressure * 0.02)) : 0;
      filterNodeRef.current.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.05);
      gainNodeRef.current.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.05);
    }
  }, [selectedOrifice, effectivePressure, isLeaking]);

  // Handle pipe click to inject leak
  const handlePipeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pos = Math.max(0.1, Math.min(4.9, +((clickX / rect.width) * 5.0).toFixed(2)));
    setLeakPosition(pos);
    if (!solenoidOpen) setSolenoidOpen(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pos = Math.max(0.0, Math.min(5.0, +((clickX / rect.width) * 5.0).toFixed(2)));
    setHoverMeter(pos);
  };

  // Generate 24 dynamic FFT frequency spectrum bars
  const spectrumBars = useMemo(() => {
    return Array.from({ length: 24 }).map((_, idx) => {
      const centerBin = Math.floor((selectedOrifice.freqCenter / 1000) * 24);
      const distFromCenter = Math.abs(idx - centerBin);
      const bellCurve = Math.exp(-Math.pow(distFromCenter / 3.5, 2));
      const jitter = (Math.sin(idx * 4.3 + leakPosition * 5) + 1) * 0.15;
      const heightPercent = isLeaking 
        ? Math.min(100, Math.max(8, (bellCurve * 75 + jitter * 20) * (effectivePressure / 4))) 
        : 6 + Math.sin(idx) * 3;
      return Math.round(heightPercent);
    });
  }, [selectedOrifice, effectivePressure, leakPosition, isLeaking]);

  return (
    <div className="space-y-8 select-none">
      {/* 🏷️ SUPER LAB HEADER - CYBER-SCIENTIFIC BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 border border-cyan-500/30 p-6 sm:p-8 shadow-xl shadow-cyan-950/40">
        {/* Ambient background glow & grid */}
        <div className="absolute inset-0 bg-tech-grid opacity-25 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Acoustic Fluid Physics Laboratory
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-indigo-300 bg-indigo-500/20 border border-indigo-500/40">
                <Sparkles className="w-3 h-3 text-amber-400" />
                TDOA Spatial Engine v2.4
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight flex items-center gap-3">
              Interactive Leak Sandbox
              <span className="text-xs font-mono font-normal px-2.5 py-1 rounded-lg bg-slate-800/90 text-cyan-400 border border-cyan-500/30">
                5.0-Meter Test Rig
              </span>
            </h1>

            <p className="text-xs sm:text-sm font-mono text-slate-300 max-w-2xl leading-relaxed">
              Inject pressurized water leaks anywhere along the acoustic waveguide. Observe soundwave time-of-flight, multi-sensor cross-correlation, and microsecond TDOA spatial pinpointing in real time.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Automated Scanner Button */}
            <button
              type="button"
              onClick={() => setIsAutoScanning(!isAutoScanning)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-md active:scale-95 ${
                isAutoScanning
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-400 shadow-amber-500/30 ring-2 ring-amber-400/50'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-500/50'
              }`}
              title="Continuously glide the leak along the pipe to demonstrate real-time tracking"
            >
              {isAutoScanning ? (
                <>
                  <Pause className="w-4 h-4 animate-spin text-white" />
                  <span>Pause Auto-Scan</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 text-amber-400" />
                  <span>Auto-Scan Pipeline</span>
                </>
              )}
            </button>

            {/* Audio Preview Synthesizer Button */}
            <button
              id="leak-lab-audio-toggle"
              type="button"
              onClick={() => setIsAudioPlaying(!isAudioPlaying)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-md active:scale-95 ${
                isAudioPlaying
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-cyan-500/50'
              }`}
              title="Listen to synthesized acoustic cavitation noise"
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-200 animate-pulse" />
                  <span className="flex items-center gap-1">
                    <span>Acoustic Audio</span>
                    <span className="flex items-end gap-0.5 h-3 ml-1">
                      <span className="w-0.5 h-2 bg-cyan-300 animate-pulse" />
                      <span className="w-0.5 h-3 bg-cyan-200 animate-pulse delay-75" />
                      <span className="w-0.5 h-1.5 bg-cyan-400 animate-pulse delay-150" />
                    </span>
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span>Audio Preview</span>
                </>
              )}
            </button>

            {/* Reset Button */}
            <button
              id="leak-lab-reset-btn"
              type="button"
              onClick={() => {
                setLeakPosition(2.35);
                setPressureBar(3.5);
                setSelectedOrifice(ORIFICE_TYPES[1]);
                setSelectedMaterial(PIPE_MATERIALS[0]);
                setSolenoidOpen(true);
                setIsAutoScanning(false);
              }}
              className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer hover:border-slate-500"
              title="Reset Sandbox Parameters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Test Scenario Chips */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold mr-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preset Scenarios:</span>
          </span>
          {PRESETS.map((preset, idx) => {
            const isActive = Math.abs(leakPosition - preset.pos) < 0.1 && selectedOrifice.id === preset.orifId;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setLeakPosition(preset.pos);
                  setPressureBar(preset.press);
                  const foundOrif = ORIFICE_TYPES.find((o) => o.id === preset.orifId);
                  if (foundOrif) setSelectedOrifice(foundOrif);
                  const foundMat = PIPE_MATERIALS.find((m) => m.name === preset.matName);
                  if (foundMat) setSelectedMaterial(foundMat);
                  setSolenoidOpen(true);
                  setIsAutoScanning(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800/70 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:border-cyan-500/40'
                }`}
              >
                {preset.label} ({preset.pos.toFixed(2)}m)
              </button>
            );
          })}
        </div>
      </div>

      {/* 🧪 THE SUPER INTERACTIVE 5.0m PIPELINE RIG CANVAS */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Glow backdrop behind pipe */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-48 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 blur-2xl pointer-events-none" />

        {/* Rig Header: Status Bar & Crosshair Coordinate Readout */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-display font-bold text-white tracking-wide flex items-center gap-2">
                <span>HYDRAULIC WAVEGUIDE RIG</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {selectedMaterial.name}
                </span>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Click anywhere directly onto the pipe to reposition the leak source
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {hoverMeter !== null && (
              <span className="text-slate-400 hidden sm:inline">
                Cursor: <span className="text-slate-200">{hoverMeter.toFixed(2)}m</span>
              </span>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Injected Coordinate: x = {leakPosition.toFixed(2)} m</span>
            </div>
          </div>
        </div>

        {/* CLICKABLE PIPE CANVAS CONTAINER */}
        <div className="relative pt-6 pb-4">
          {/* Top Distance Ruler (0m to 5.0m) with high-contrast markings */}
          <div className="relative w-full h-6 mb-2 flex justify-between text-[11px] font-mono text-slate-400 select-none">
            {[0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0].map((m) => (
              <div key={m} className="flex flex-col items-center">
                <span className={`text-[10px] font-bold ${Math.abs(m - Math.round(m)) < 0.01 ? 'text-cyan-400' : 'text-slate-500 hidden sm:inline'}`}>
                  {m.toFixed(1)}m
                </span>
                <div className={`w-0.5 ${Math.abs(m - Math.round(m)) < 0.01 ? 'h-2.5 bg-cyan-400' : 'h-1.5 bg-slate-700'} mt-1`} />
              </div>
            ))}
          </div>

          {/* THE LUMINOUS INDUSTRIAL PIPE */}
          <div
            id="interactive-pipe-canvas"
            onClick={handlePipeClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverMeter(null)}
            className="relative w-full h-24 sm:h-28 rounded-2xl border-2 border-cyan-500/40 shadow-2xl cursor-crosshair overflow-hidden group transition-all duration-300"
            style={{
              background: 'linear-gradient(180deg, #09172e 0%, #030a17 50%, #071529 100%)',
              boxShadow: solenoidOpen 
                ? '0 0 30px rgba(6, 182, 212, 0.25), inset 0 0 20px rgba(6, 182, 212, 0.15)'
                : '0 0 20px rgba(225, 29, 72, 0.2), inset 0 0 20px rgba(225, 29, 72, 0.15)',
            }}
          >
            {/* Flanged Metallic End Caps */}
            <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 border-r border-slate-500 z-10 flex flex-col justify-around py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto" />
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-600 via-slate-400 to-slate-700 border-l border-slate-500 z-10 flex flex-col justify-around py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto" />
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mx-auto" />
            </div>

            {/* Glowing Internal Water Column & Animated Fluid Particles */}
            {solenoidOpen && (
              <>
                <div 
                  className="absolute inset-0 opacity-40 bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-500 animate-pulse"
                  style={{ animationDuration: `${Math.max(0.8, 3.5 - pressureBar * 0.4)}s` }}
                />
                {/* Horizontal Laminar Streamline */}
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-cyan-300/60 -translate-y-1/2 blur-[0.5px]" />
                <div className="absolute top-[35%] left-4 right-4 h-0.5 bg-blue-400/40 -translate-y-1/2" />
                <div className="absolute top-[65%] left-4 right-4 h-0.5 bg-blue-400/40 -translate-y-1/2" />
              </>
            )}

            {/* Solenoid Shutoff Overlay */}
            {!solenoidOpen && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center text-rose-300 font-mono text-xs font-bold gap-3 z-30">
                <Power className="w-5 h-5 text-rose-400 animate-pulse" />
                <span>MAIN SOLENOID VALVE ISOLATED • 0.0 BAR (NO WATER EGRESS)</span>
              </div>
            )}

            {/* TDOA Laser Propagation Vectors (from leak to bracket sensors) */}
            {isLeaking && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-15">
                {/* Propagation beam towards left sensor */}
                <line
                  x1={`${(leakPosition / 5.0) * 100}%`}
                  y1="50%"
                  x2={`${(bracketPair.sLeft.x / 5.0) * 100}%`}
                  y2="50%"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-water-flow-fast"
                />
                {/* Propagation beam towards right sensor */}
                <line
                  x1={`${(leakPosition / 5.0) * 100}%`}
                  y1="50%"
                  x2={`${(bracketPair.sRight.x / 5.0) * 100}%`}
                  y2="50%"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                  strokeDasharray="6 4"
                  className="animate-water-flow-fast"
                />
              </svg>
            )}

            {/* 4 External Clamped Piezo Transducers */}
            {sensorNodes.map((node) => {
              const leftPercent = (node.x / 5.0) * 100;
              const sensorData = sensorCalculations.find((s) => s.id === node.id);
              const isHighSignal = (sensorData?.amplitude || 0) > 30;

              return (
                <div
                  key={node.id}
                  style={{ left: `${leftPercent}%` }}
                  className="absolute top-0 bottom-0 -translate-x-1/2 flex flex-col items-center justify-between py-1 z-20 pointer-events-none"
                >
                  {/* Top Clamp Housing */}
                  <div
                    className="px-1.5 py-0.5 rounded-t-md text-[8px] font-mono font-bold text-white transition-all duration-300 flex items-center gap-0.5 border"
                    style={{
                      backgroundColor: node.color,
                      borderColor: 'rgba(255,255,255,0.4)',
                      boxShadow: isHighSignal ? `0 0 14px ${node.color}` : 'none',
                    }}
                  >
                    <span>{node.id}</span>
                  </div>

                  {/* Vertical Steel Clamp Band */}
                  <div 
                    className="w-1 flex-1 transition-colors duration-300"
                    style={{
                      backgroundColor: isHighSignal ? node.color : '#475569',
                      boxShadow: isHighSignal ? `0 0 10px ${node.color}` : 'none',
                    }}
                  />

                  {/* Bottom Piezo Sensor Node Disc */}
                  <div
                    className="w-5 h-2.5 rounded-b-md border transition-all duration-300"
                    style={{
                      backgroundColor: isHighSignal ? node.color : '#334155',
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  />
                </div>
              );
            })}

            {/* 📍 THE LEAK EPICENTER TARGET & MULTI-RING SHOCKWAVE PULSES */}
            {isLeaking && (
              <div
                style={{ left: `${(leakPosition / 5.0) * 100}%` }}
                className="absolute top-0 bottom-0 -translate-x-1/2 flex items-center justify-center z-30 pointer-events-none"
              >
                {/* Acoustic Shockwave Waves propagating outwards */}
                <span className="absolute w-14 h-14 rounded-full border-2 border-rose-500/80 animate-ping" />
                <span className="absolute w-24 h-24 rounded-full border border-cyan-400/50 animate-ping delay-100" />
                <span className="absolute w-32 h-32 rounded-full border border-indigo-400/30 animate-ping delay-200" />

                {/* Leak Jet Core Button */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-400 border-2 border-white shadow-xl shadow-rose-500/80 flex items-center justify-center text-white z-20">
                  <Droplet className="w-3.5 h-3.5 fill-white" />
                </div>

                {/* Water Jet Spray Badge */}
                <div className="absolute -top-10 px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-600 to-amber-500 text-white font-mono text-[10px] font-extrabold shadow-lg shadow-rose-600/40 flex items-center gap-1.5 whitespace-nowrap animate-bounce">
                  <Droplet className="w-3 h-3 fill-white" />
                  <span>{leakRateLpm} L/min</span>
                  <span className="text-[8px] opacity-80">({selectedOrifice.name})</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Sensor Labels with Coordinated Neon Badges */}
          <div className="relative w-full h-8 mt-3">
            {sensorNodes.map((node) => (
              <div
                key={node.id}
                style={{ left: `${(node.x / 5.0) * 100}%` }}
                className="absolute -translate-x-1/2 text-center"
              >
                <div 
                  className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md inline-block border"
                  style={{
                    color: node.color,
                    backgroundColor: `${node.color}15`,
                    borderColor: `${node.color}40`,
                  }}
                >
                  {node.id}
                </div>
                <div className="text-[9px] font-mono text-slate-400 mt-0.5">{node.x.toFixed(1)}m</div>
              </div>
            ))}
          </div>
        </div>

        {/* FINE-TUNE PRECISION COORDINATE SLIDER */}
        <div className="bg-slate-950/80 rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="leak-position-slider" className="text-xs font-mono font-bold text-white uppercase tracking-wider block">
                Precision Spatial Injection Coordinate ($x$)
              </label>
              <span className="text-[11px] font-mono text-slate-400">
                Drag slider or click along the pipe to adjust position across 5.00 meters
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-80">
            <input
              id="leak-position-slider"
              type="range"
              min="0.10"
              max="4.90"
              step="0.05"
              value={leakPosition}
              onChange={(e) => {
                setLeakPosition(parseFloat(e.target.value));
                if (!solenoidOpen) setSolenoidOpen(true);
              }}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <span className="w-20 text-right font-mono font-extrabold text-sm text-cyan-400 tabular-nums px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/30">
              {leakPosition.toFixed(2)} m
            </span>
          </div>
        </div>

        {/* 📊 REAL-TIME ACOUSTIC FFT SPECTRUM VISUALIZER */}
        <div className="bg-slate-950/90 rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Real-Time Cavitation Frequency Spectrum (100 Hz – 20 kHz)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">
                Peak Resonance: <span className="text-cyan-400 font-bold">{isLeaking ? `${selectedOrifice.freqCenter + Math.round(effectivePressure * 60)} Hz` : 'Noise Floor'}</span>
              </span>
              <span className="text-slate-400 hidden sm:inline">
                Acoustic Velocity ($c$): <span className="text-indigo-400 font-bold">{selectedMaterial.speedOfSound} m/s</span>
              </span>
            </div>
          </div>

          {/* Equalizer Spectrum Bars */}
          <div className="h-16 flex items-end justify-between gap-1 sm:gap-1.5 pt-2 px-1">
            {spectrumBars.map((height, idx) => {
              // Color gradient across frequencies: Cyan -> Sky -> Purple -> Amber
              const barColor = 
                idx < 6 ? '#06b6d4' : 
                idx < 12 ? '#38bdf8' : 
                idx < 18 ? '#818cf8' : '#f59e0b';

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t transition-all duration-150 ease-out"
                    style={{
                      height: `${height}%`,
                      backgroundColor: barColor,
                      boxShadow: isLeaking && height > 40 ? `0 0 10px ${barColor}` : 'none',
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-800/80">
            <span>100 Hz (Sub-audio)</span>
            <span>500 Hz (Cavitation Core)</span>
            <span>2.5 kHz (PZT Resonance)</span>
            <span>15 kHz (High Harmonic)</span>
          </div>
        </div>
      </div>

      {/* 🎛️ 3-PANEL SUPERCHARGED SCIENTIFIC CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================================================= */}
        {/* PANEL 1: ACOUSTIC JET & HYDRAULIC PARAMETERS */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Jet &amp; Hydraulics
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                PZT Driver
              </span>
            </div>

            {/* Orifice Selector Chips */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Orifice Geometry &amp; Diameter
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {ORIFICE_TYPES.map((type) => {
                  const isSelected = selectedOrifice.id === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedOrifice(type)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? `bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400`
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {type.name}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${type.color}`}>
                          Ø {type.diameterMm} mm
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        {type.tag}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Line Pressure Slider with Color-coded Gradient */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-baseline text-xs font-mono">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
                  Internal Line Pressure
                </span>
                <span className="font-bold text-cyan-400 tabular-nums">
                  {pressureBar.toFixed(1)} Bar <span className="text-slate-400 font-normal">({(pressureBar * 14.5).toFixed(0)} PSI)</span>
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="6.0"
                step="0.1"
                value={pressureBar}
                onChange={(e) => setPressureBar(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>1.0 Bar (Low)</span>
                <span>3.5 Bar (Nominal)</span>
                <span>6.0 Bar (High)</span>
              </div>
            </div>

            {/* Pipe Material Acoustic Waveguide Selector */}
            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Pipe Material Wave Velocity ($c$)
              </label>
              <select
                value={selectedMaterial.name}
                onChange={(e) => {
                  const mat = PIPE_MATERIALS.find((m) => m.name === e.target.value);
                  if (mat) setSelectedMaterial(mat);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-500 cursor-pointer"
              >
                {PIPE_MATERIALS.map((m) => (
                  <option key={m.name} value={m.name} className="bg-slate-900 text-white">
                    {m.name} — {m.speedOfSound} m/s
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-slate-400">
                {selectedMaterial.description}
              </p>
            </div>
          </div>

          {/* Solenoid Valve Isolation Switch */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Power className={`w-4 h-4 ${solenoidOpen ? 'text-emerald-400' : 'text-rose-400'}`} />
              <span className="text-xs font-mono font-bold text-slate-200">Main Solenoid Isolation</span>
            </div>
            <button
              type="button"
              onClick={() => setSolenoidOpen(!solenoidOpen)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-extrabold transition-all cursor-pointer shadow-md ${
                solenoidOpen
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-emerald-500/20'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              {solenoidOpen ? 'VALVE OPEN' : 'ISOLATED'}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 2: TDOA SPATIAL PINPOINT CENTER (HIGH-TECH RADAR HUD) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  TDOA Spatial Pinpoint
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                Cross-Correlation
              </span>
            </div>

            {/* Calculated Pinpoint Outcome Glowing Matrix Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-500/30 space-y-3 relative overflow-hidden shadow-lg shadow-indigo-950/30">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">
                    Computed Leak Coordinate
                  </div>
                  <div className="font-display font-extrabold text-3xl text-white tracking-tight mt-0.5">
                    {isLeaking ? `${bracketPair.calculatedLocation.toFixed(2)} m` : 'No Active Leak'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-400">Spatial Tolerance</div>
                  <div className="font-mono font-bold text-xs text-indigo-300 mt-0.5">
                    ±{bracketPair.localizationErrorCm} cm
                  </div>
                </div>
              </div>

              {/* Confidence Meter Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Cross-Correlation Confidence:</span>
                  <span className="font-bold text-emerald-400">{bracketPair.confidencePercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    style={{ width: `${bracketPair.confidencePercent}%` }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-300 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Microsecond Delay Breakdown Equations */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Bracketing Pair:</span>
                <span className="font-bold text-cyan-300">
                  {bracketPair.sLeft.id} &amp; {bracketPair.sRight.id} ({bracketPair.sLeft.x}m – {bracketPair.sRight.x}m)
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">Time Delta (Δt):</span>
                <span className="font-bold text-amber-400 tabular-nums">
                  {bracketPair.deltaT_ms > 0 ? `+${bracketPair.deltaT_ms}` : bracketPair.deltaT_ms} ms
                </span>
              </div>

              <div className="flex justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <span className="text-slate-400">TDOA Formula:</span>
                <span className="font-semibold text-cyan-300 text-[11px]">
                  {'x = (x₁ + x₂ - c · Δt) / 2'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Explanatory Guidance */}
          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>High-frequency PZT discs detect arrival deltas in microsecond resolution.</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 3: 4-NODE ACOUSTIC SENSOR SPECTRUM & CONSERVATION METRICS */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  Sensor Clamps Array
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                12-bit ADC
              </span>
            </div>

            {/* 4 Sensor Dynamic Bar Meters */}
            <div className="space-y-2.5">
              {sensorCalculations.map((sensor) => {
                return (
                  <div key={sensor.id} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-bold flex items-center gap-1.5" style={{ color: sensor.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sensor.color }} />
                        <span>{sensor.id}</span>
                        <span className="text-slate-500 font-normal">({sensor.x.toFixed(1)}m)</span>
                      </span>
                      <span className="text-slate-300 font-bold tabular-nums">
                        {sensor.amplitude}% amp <span className="text-slate-500 font-normal">· {sensor.arrivalTimeMs}ms</span>
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        style={{
                          width: `${sensor.amplitude}%`,
                          backgroundColor: sensor.color,
                          boxShadow: sensor.amplitude > 30 ? `0 0 10px ${sensor.color}` : 'none',
                        }}
                        className="h-full rounded-full transition-all duration-200"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Environmental & Financial Impact Analysis */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-cyan-950/50 to-slate-950 border border-cyan-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                  <span>24h Water Conservation Impact</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  ~₹{costEstimateRupees}/day tariff
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <div className="font-display font-extrabold text-2xl text-white tabular-nums">
                  {dailyLossLiters.toLocaleString()}
                </div>
                <div className="text-xs font-mono text-slate-400">Liters / 24h Projected Loss</div>
              </div>

              <p className="text-[10px] font-mono text-slate-400 leading-tight">
                {isLeaking 
                  ? 'Continuous pipe cavitation detected. TDOA localization enables immediate spot excavation without digging up entire roadbeds.'
                  : 'Zero uncontrolled water egress detected. All municipal pipeline acoustic thresholds nominal.'}
              </p>
            </div>
          </div>

          {/* Auto-Isolation Safety Protocol Switch */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Auto-Isolation Safety:</span>
            </span>
            <button
              type="button"
              onClick={() => setAutoIsolateEnabled(!autoIsolateEnabled)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer border ${
                autoIsolateEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {autoIsolateEnabled ? 'ENABLED' : 'MANUAL'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
