import React, { useState } from 'react';
import { 
  SensorNode, 
  SimulationScenario 
} from '../types';
import { PipelineMap } from './PipelineMap';
import { FullSystemPipelineMap } from './FullSystemPipelineMap';
import { VibrationWaveform } from './VibrationWaveform';
import { DashboardSidebar, DashboardSection } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { DashboardTrendCharts } from './DashboardTrendCharts';
import { InteractiveLeakLab } from './InteractiveLeakLab';
import { 
  Droplets, 
  Activity, 
  Wind, 
  Zap, 
  ShieldCheck, 
  Gauge,
  Crosshair
} from 'lucide-react';

interface DashboardViewProps {
  sensors: SensorNode[];
  selectedSensorId: string;
  onSelectSensor: (sensorId: string) => void;
  scenario: SimulationScenario;
  onSelectScenario: (scenario: SimulationScenario) => void;
  onBackToHome?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sensors,
  selectedSensorId,
  onSelectSensor,
  scenario,
  onSelectScenario,
  onBackToHome,
}) => {
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');
  const [demoMode, setDemoMode] = useState(true);

  // Dynamic calculated acoustic values
  const leakRiskScore = 
    scenario === 'large-leak' ? 88 : 
    scenario === 'small-leak' ? 45 : 
    scenario === 'disturbance' ? 32 : 14;

  const vibrationVal = 
    scenario === 'large-leak' ? 85.0 : 
    scenario === 'small-leak' ? 57.2 : 
    scenario === 'disturbance' ? 68.1 : 34.8;

  const freqShiftVal = 
    scenario === 'large-leak' ? 3.4 : 
    scenario === 'small-leak' ? 1.7 : 
    scenario === 'disturbance' ? 0.9 : 0.2;

  const flowVelocityVal = 
    scenario === 'large-leak' ? 38.2 : 
    scenario === 'small-leak' ? 59.8 : 
    scenario === 'disturbance' ? 71.4 : 74.5;

  const rmsEnergyVal = 
    scenario === 'large-leak' ? 4.85 : 
    scenario === 'small-leak' ? 2.45 : 
    scenario === 'disturbance' ? 3.10 : 0.61;

  const healthScoreVal = 
    scenario === 'large-leak' ? 22 : 
    scenario === 'small-leak' ? 65 : 
    scenario === 'disturbance' ? 78 : 92;

  const avgAnomalyVal = 
    scenario === 'large-leak' ? 86 : 
    scenario === 'small-leak' ? 44 : 
    scenario === 'disturbance' ? 38 : 12;

  // Status Badge Metadata (no stress words)
  const getStatusBadge = () => {
    switch (scenario) {
      case 'small-leak':
        return {
          label: 'MICRO-LEAK DETECTED',
          pillBg: 'bg-amber-100 text-amber-900 border-amber-300',
          dotBg: 'bg-amber-500',
        };
      case 'large-leak':
        return {
          label: 'CRITICAL LEAK EVENT',
          pillBg: 'bg-rose-100 text-rose-900 border-rose-300',
          dotBg: 'bg-rose-500',
        };
      case 'disturbance':
        return {
          label: 'TRANSIENT TAP FLOW',
          pillBg: 'bg-sky-100 text-sky-900 border-sky-300',
          dotBg: 'bg-sky-500',
        };
      default:
        return {
          label: 'OPTIMAL HYDRAULIC FLOW',
          pillBg: 'bg-blue-100 text-blue-900 border-blue-300',
          dotBg: 'bg-blue-600',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="w-full bg-[#F1F5F9] border-t border-slate-200 overflow-hidden flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] select-none text-slate-900">
      {/* 🧭 LEFT SIDEBAR */}
      <DashboardSidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        onBackToHome={onBackToHome}
      />

      {/* 🖥️ MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto">
        {/* Top Header with ONLY Demo Mode Toggle and Alert telemetry */}
        <DashboardHeader
          demoMode={demoMode}
          onToggleDemoMode={() => setDemoMode(!demoMode)}
          scenario={scenario}
        />

        {/* Dynamic Section Renderer */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 flex flex-col justify-between">
          {/* ========================================================================= */}
          {/* SECTION 1: OVERVIEW (CLEAN WATER BLUE & NO SECOND DEMO BAR) */}
          {/* ========================================================================= */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* 🌟 TOP STATUS HERO CARD */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono font-bold text-sky-700 uppercase tracking-wider">
                      ACOUSTIC TELEMETRY · {demoMode ? 'SIMULATED DEMO STREAM' : 'HARDWARE SENSOR STREAM'}
                    </div>
                    <div className="font-display font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight">
                      Pipe Leak Risk Index {leakRiskScore}/100
                    </div>
                    <p className="text-xs font-mono text-slate-500">
                      Updated 0 seconds ago · Kalman Adaptive Waveguide Model v0.1
                    </p>
                  </div>

                  {/* Status Pill on the right */}
                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold font-mono uppercase tracking-wide self-start sm:self-center shadow-2xs ${statusBadge.pillBg}`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${statusBadge.dotBg} animate-pulse`} />
                    <span>{statusBadge.label}</span>
                  </div>
                </div>
              </div>

              {/* 📊 6 METRIC CARDS (WATER-BLUE THEMED ICONS & LABELS, NO STRESS WORDS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. PIPE VIBRATION */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        PIPE VIBRATION
                      </div>
                      <div className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                        {vibrationVal} <span className="text-lg font-normal text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <Droplets className="w-5 h-5 text-sky-600" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-4">
                    Volumetric capacitive acoustic probe
                  </div>
                </div>

                {/* 2. ACOUSTIC FREQUENCY SHIFT */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        FREQUENCY SHIFT - BASELINE
                      </div>
                      <div className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                        {freqShiftVal} <span className="text-lg font-normal text-slate-500">kHz</span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-4">
                    Acoustic turbulence indicator
                  </div>
                </div>

                {/* 3. RELATIVE FLOW VELOCITY */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        RELATIVE FLOW VELOCITY
                      </div>
                      <div className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                        {flowVelocityVal} <span className="text-lg font-normal text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
                      <Wind className="w-5 h-5 text-cyan-600" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-4">
                    Laminar volumetric fluid rate
                  </div>
                </div>

                {/* 4. RMS ACOUSTIC ENERGY */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        RMS ENERGY AMPLITUDE
                      </div>
                      <div className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                        {rmsEnergyVal} <span className="text-base font-normal text-slate-500">m/s²</span>
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <Zap className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-4">
                    High-frequency bandpass sensor energy
                  </div>
                </div>

                {/* 5. PIPELINE HEALTH SCORE */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        PIPELINE HEALTH SCORE
                      </div>
                      <div className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                        {healthScoreVal}
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5 text-sky-600" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-4">
                    Higher is better · Structural health
                  </div>
                </div>

                {/* 6. AVERAGE ANOMALY (RECENT) */}
                <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-sky-300 transition-all flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        AVERAGE ANOMALY (RECENT)
                      </div>
                      <div className="font-display font-bold text-3xl text-slate-900 tracking-tight">
                        {avgAnomalyVal}
                      </div>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                      <Gauge className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-4">
                    Last 30 sensor cycles
                  </div>
                </div>
              </div>

              {/* 📈 TWO DYNAMIC TREND CHARTS IN WATER BLUE */}
              <DashboardTrendCharts scenario={scenario} />

              {/* 🧪 FEATURE BANNER: JUMP DIRECTLY TO INTERACTIVE LEAK LAB */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-cyan-500/30 p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400">
                      Physical Acoustic Waveguide Sandbox
                    </span>
                  </div>
                  <h4 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white">
                    Interactive Leak Lab &amp; TDOA Pinpointer
                  </h4>
                  <p className="text-xs font-mono text-slate-300 max-w-xl">
                    Test the 5.0m acoustic waveguide rig: drag leaks, adjust line pressure, test orifice geometries, and observe real-time TDOA cross-correlation pinpoint the breach.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveSection('leak-lab')}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-2 shrink-0 shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
                >
                  <Crosshair className="w-4 h-4 text-slate-950" />
                  <span>Launch Interactive Lab →</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: INTERACTIVE LEAK LAB (SANDBOX & TDOA PINPOINTER) */}
          {/* ========================================================================= */}
          {activeSection === 'leak-lab' && (
            <InteractiveLeakLab />
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: LIVE MONITOR (SCHEMATIC + OSCILLOSCOPE) */}
          {/* ========================================================================= */}
          {activeSection === 'live-monitor' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Live Pipeline Sensor Monitor
                  </h3>
                  <p className="text-xs font-mono text-slate-500">
                    Spatial pipeline schematic and synchronized multi-channel vibration oscilloscope.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-sky-100 text-sky-800 border border-sky-300">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    50 Hz ADC Real-Time
                  </span>
                </div>
              </div>

              <PipelineMap
                sensors={sensors}
                selectedSensorId={selectedSensorId}
                onSelectSensor={onSelectSensor}
                scenario={scenario}
                onTriggerScenario={onSelectScenario}
              />

              <VibrationWaveform
                sensors={sensors}
                selectedSensorId={selectedSensorId}
                scenario={scenario}
                onSelectSensor={onSelectSensor}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: PIPELINE NETWORK */}
          {/* ========================================================================= */}
          {activeSection === 'pipeline' && (
            <FullSystemPipelineMap
              sensors={sensors}
              selectedSensorId={selectedSensorId}
              onSelectSensor={onSelectSensor}
              scenario={scenario}
              onTriggerScenario={onSelectScenario}
            />
          )}

          {/* ========================================================================= */}
          {/* SECTION 4: VIBRATION SCAN */}
          {/* ========================================================================= */}
          {activeSection === 'vibration-scan' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Piezoelectric Waveform Oscilloscope
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  Real-time multi-channel acoustic vibration signatures and baseline thresholding.
                </p>
              </div>

              <VibrationWaveform
                sensors={sensors}
                selectedSensorId={selectedSensorId}
                scenario={scenario}
                onSelectSensor={onSelectSensor}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* SECTION 5: DEVICES & API */}
          {/* ========================================================================= */}
          {activeSection === 'devices-api' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="space-y-2">
                <h3 className="font-display font-bold text-2xl text-slate-900">
                  Sensor Hardware Telemetry &amp; REST API Endpoints
                </h3>
                <p className="text-xs font-mono text-slate-500">
                  Microcontroller serial baud rate, ADC resolution, and JSON API schema for IoT gateways.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-sky-300 font-mono text-xs overflow-x-auto border border-slate-800">
                <pre>{`// GET /api/v1/pipeguard/telemetry
{
  "system": "PIPEGUARD",
  "project": "INSPIRE-MANAK",
  "status": "${scenario === 'normal' ? 'NOMINAL' : 'ALERT'}",
  "scenario": "${scenario}",
  "nodes": [
    ${sensors.map((s) => `{"id": "${s.id}", "pos": ${s.positionMeters}, "vib": ${s.vibration}, "baseline": ${s.baseline}, "delta": ${s.difference}}`).join(',\n    ')}
  ],
  "samplingRateHz": 50,
  "adcResolution": "12-bit"
}`}</pre>
              </div>
            </div>
          )}

          {/* 📄 BOTTOM DISCLAIMER */}
          <div className="pt-4 border-t border-slate-200 text-xs font-mono text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>
              {demoMode 
                ? 'Demo Mode is active, displaying simulated sensor telemetry for experimental verification.'
                : 'Live hardware mode active, streaming real-time ADC readings.'}
            </span>
            <span className="text-[10px] text-sky-700 font-semibold">
              INSPIRE-MANAK · PipeGuard Research v1.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
