"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Video,
  Mic,
  MicOff,
  Sparkles,
  RefreshCw,
  Layers,
  Upload,
  Crosshair,
  BatteryCharging,
  Wifi,
  Compass,
  AlertTriangle,
  CheckCircle,
  Eye,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface PresetSite {
  id: string;
  name: string;
  zone: string;
  location: string;
  description: string;
  imageUrl: string;
  defaultSeverity: "CRITICAL" | "MODERATE" | "LOW";
  initialCrack: string;
}

export const SITE_PRESETS: PresetSite[] = [
  {
    id: "preset_basement",
    name: "Basement Foundation Crack",
    zone: "Basement Foundation Wall - East Bay B-4",
    location: "Toronto Spadina Tower • P2 Sub-Grade",
    description: "Diagonal shear fracture with active hydrostatic seepage & calcite efflorescence.",
    imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
    defaultSeverity: "CRITICAL",
    initialCrack: '0.45" Gap (+800% widening)',
  },
  {
    id: "preset_hvac",
    name: "Commercial HVAC Corrosion",
    zone: "Commercial HVAC Chiller Bay #2",
    location: "Mechanical Penthouse • Roof Bay 12",
    description: "Severe galvanic oxidation & seismic vibration spring snubber degradation.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    defaultSeverity: "MODERATE",
    initialCrack: "Pitting Corrosion Manifold",
  },
  {
    id: "preset_electrical",
    name: "Electrical Panel Thermal Overload",
    zone: "Primary 600V Main Electrical Switchgear",
    location: "Level 1 High-Voltage Vault",
    description: "Phase B lug overheating at 89°C (overload delta +47°C). Arc flash danger.",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    defaultSeverity: "CRITICAL",
    initialCrack: "89°C Thermal Anomaly",
  },
  {
    id: "preset_roof",
    name: "Roof Membrane Leak",
    zone: "Roof Level 24 Membrane Drain Basin",
    location: "Tower East Parapet • Level 24",
    description: "SBS torch-down membrane delamination and ponding around storm hopper.",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    defaultSeverity: "MODERATE",
    initialCrack: "3.2m² Trapped Moisture",
  },
];

interface CameraHUDProps {
  onScan: (payload: {
    image: string;
    zoneName: string;
    voiceNotes: string;
    presetId: string;
  }) => void;
  isAnalyzing: boolean;
  activeZone: string;
}

export const CameraHUD: React.FC<CameraHUDProps> = ({
  onScan,
  isAnalyzing,
  activeZone,
}) => {
  const [mode, setMode] = useState<"preset" | "webcam" | "upload">("preset");
  const [selectedPreset, setSelectedPreset] = useState<PresetSite>(SITE_PRESETS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [showLidarGrid, setShowLidarGrid] = useState<boolean>(true);
  const [showCrosshairs, setShowCrosshairs] = useState<boolean>(true);

  // Audio / Speech State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceNotes, setVoiceNotes] = useState<string>(
    "Observed 0.45-inch lateral shear crack near base of cast concrete footing. Hydrostatic water seep visible."
  );
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const recognitionRef = useRef<any>(null);

  // Webcam State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Quick Tags
  const quickTags = [
    "Basement Foundation Wall",
    "Commercial HVAC Chiller",
    "Main 600V Switchgear",
    "Roof Drainage Membrane",
    "Hydrostatic Water Seepage",
    "CSA A23.3 Shear Crack",
  ];

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-CA";

        recognition.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          setVoiceNotes(currentTranscript.trim());
        };

        recognition.onerror = (err: any) => {
          console.warn("Speech recognition error:", err);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert("Speech recognition is not natively supported in this browser. You can type notes directly.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.error("Failed to start speech recognition", e);
      }
    }
  };

  // Webcam handling
  const startWebcam = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setMode("webcam");
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("Camera permission denied or camera device unavailable. Switched to high-res Canadian preset simulator.");
      setMode("preset");
    }
  };

  const stopWebcam = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  // Capture Frame
  const triggerScan = () => {
    let imageToAnalyze = selectedPreset.imageUrl;

    if (mode === "webcam" && videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        imageToAnalyze = canvas.toDataURL("image/jpeg", 0.9);
      }
    } else if (mode === "upload" && uploadedImage) {
      imageToAnalyze = uploadedImage;
    }

    onScan({
      image: imageToAnalyze,
      zoneName: selectedPreset.zone,
      voiceNotes,
      presetId: selectedPreset.id,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setMode("upload");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Top HUD Controls Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800/80">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>AR SPATIAL HUD v2.6</span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            ZONE: <span className="text-slate-200">{selectedPreset.zone}</span>
          </span>
        </div>

        {/* Mode Switchers */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-medium">
          <button
            onClick={() => {
              stopWebcam();
              setMode("preset");
            }}
            className={`px-3 py-1 rounded transition-colors ${
              mode === "preset"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Presets
          </button>
          <button
            onClick={startWebcam}
            className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
              mode === "webcam"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Webcam</span>
          </button>
          <label
            className={`flex items-center space-x-1 px-3 py-1 rounded cursor-pointer transition-colors ${
              mode === "upload"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative flex-1 min-h-[360px] lg:min-h-[420px] bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Visual Content: Preset or Webcam or Upload */}
        {mode === "webcam" ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={mode === "upload" && uploadedImage ? uploadedImage : selectedPreset.imageUrl}
              alt="Site Inspection Visual"
              className="w-full h-full object-cover select-none filter contrast-105 brightness-95"
            />
          </div>
        )}

        {/* Futuristic HUD Overlay Graphics */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle Cyber Grid */}
          {showLidarGrid && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.25) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(6, 182, 212, 0.25) 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            />
          )}

          {/* Animated Laser Scanline */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-scan-line" />

          {/* Precision Targeting Corner Brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

          {/* Crosshairs */}
          {showCrosshairs && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-28 h-28 border border-cyan-500/40 rounded-full animate-pulse-glow flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]" />
                <div className="absolute top-0 w-full h-[1px] bg-cyan-400/30" />
                <div className="absolute left-0 h-full w-[1px] bg-cyan-400/30" />
              </div>
            </div>
          )}

          {/* AI Bounding Box Defect Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute top-1/4 left-1/4 w-1/2 h-1/2 border-2 border-dashed border-red-500/80 bg-red-500/10 rounded-lg p-2 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="bg-red-500 text-white font-mono text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow">
                DEFECT DETECTED [CSA-A23.3]
              </span>
              <span className="bg-slate-900/90 text-cyan-300 font-mono text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/50">
                EON-VERIFIED: 99.4%
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-200 bg-slate-950/80 px-2 py-1 rounded backdrop-blur">
              <span className="text-red-400 font-semibold">{selectedPreset.initialCrack}</span>
              <span className="text-slate-400">Δt: +800% vs Oct 10</span>
            </div>
          </motion.div>

          {/* Real-time Telemetry Readout Box (Top Left) */}
          <div className="absolute top-6 left-6 font-mono text-[11px] text-cyan-300 space-y-1 bg-slate-950/70 p-2.5 rounded-lg border border-cyan-500/30 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "8s" }} />
              <span>SPATIAL TELEMETRY</span>
            </div>
            <div>GPS: 43.6532° N, 79.3832° W (Toronto)</div>
            <div>ELEV: -6.4m P2 Sub-Grade</div>
            <div>SENSORS: LiDAR Mesh + FLIR Matrix</div>
            <div className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>FPS: 60 • LATENCY: &lt;18ms</span>
            </div>
          </div>

          {/* Battery & Status Box (Top Right) */}
          <div className="absolute top-6 right-6 font-mono text-[11px] text-slate-300 space-y-1 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-emerald-400">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>BATTERY: 94% (SURGE SAFE)</span>
            </div>
            <div className="flex items-center space-x-2 text-cyan-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>EAS MOBILE SYNC: ACTIVE</span>
            </div>
            <div className="text-slate-400 text-[10px]">
              ENGINE: Nebius Qwen2-VL-72B
            </div>
          </div>
        </div>

        {/* Analyzing Pulse Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-30"
            >
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-3 border-4 border-blue-500/40 border-b-transparent rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
                <Sparkles className="absolute inset-0 m-auto w-7 h-7 text-cyan-300 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold text-white tracking-wide font-mono">
                DUAL-ENGINE FORENSIC ANALYSIS
              </h4>
              <p className="text-xs text-cyan-300 font-mono mt-1 text-center max-w-sm">
                Querying Nebius Vision Studio → Injecting SurrealDB Temporal Graph → Evaluating Ontario Building Code...
              </p>
              <div className="mt-4 flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Eon Model Guardrails Verified</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preset Selector Carousel (If in Preset Mode) */}
      {mode === "preset" && (
        <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Inspection Presets (Click to Load)</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-400">
              {SITE_PRESETS.findIndex((p) => p.id === selectedPreset.id) + 1} of {SITE_PRESETS.length}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {SITE_PRESETS.map((preset) => {
              const isSelected = selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset)}
                  className={`text-left p-2 rounded-lg border transition-all text-xs font-mono relative overflow-hidden ${
                    isSelected
                      ? "bg-cyan-950/50 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                      : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-100 truncate">{preset.name}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                        preset.defaultSeverity === "CRITICAL"
                          ? "bg-red-500/20 text-red-400 border border-red-500/40"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      }`}
                    >
                      {preset.defaultSeverity}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{preset.location}</div>
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Voice Dictation & Quick-Tags Strip */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-3">
        {/* Voice Dictation Bar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVoiceRecording}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono transition-all shadow-md ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {isRecording ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            <span>{isRecording ? "Listening Live..." : "Voice Dictation"}</span>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={voiceNotes}
              onChange={(e) => setVoiceNotes(e.target.value)}
              placeholder="Speak hands-free or type inspector observation notes..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 pr-10 focus:outline-none focus:border-cyan-500 font-mono"
            />
            {isRecording && (
              <span className="absolute right-3 top-2.5 flex space-x-0.5">
                <span className="w-1 h-3 bg-red-400 animate-pulse" />
                <span className="w-1 h-4 bg-red-400 animate-pulse" style={{ animationDelay: "0.2s" }} />
                <span className="w-1 h-2 bg-red-400 animate-pulse" style={{ animationDelay: "0.4s" }} />
              </span>
            )}
          </div>
        </div>

        {/* Quick Tag Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-slate-400 text-[11px] font-mono scrollbar-none">
          <span className="text-slate-500 text-xs shrink-0 font-medium">Quick Tags:</span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setVoiceNotes((prev) => (prev ? `${prev}; ${tag}` : tag));
              }}
              className="px-2 py-0.5 rounded-full bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-600/50 text-slate-300 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              + {tag}
            </button>
          ))}
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={triggerScan}
            disabled={isAnalyzing}
            className="flex-1 flex items-center justify-center space-x-2.5 py-3 px-6 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide font-mono"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-spin" style={{ animationDuration: "6s" }} />
            <span>{isAnalyzing ? "Processing Spatial Neural Model..." : "Execute Autonomous Inspection Scan"}</span>
          </button>

          <button
            onClick={() => setShowLidarGrid(!showLidarGrid)}
            title="Toggle LiDAR Grid Overlay"
            className={`p-3 rounded-xl border transition-colors ${
              showLidarGrid
                ? "bg-cyan-950/60 border-cyan-500 text-cyan-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCrosshairs(!showCrosshairs)}
            title="Toggle Targeting Reticle"
            className={`p-3 rounded-xl border transition-colors ${
              showCrosshairs
                ? "bg-cyan-950/60 border-cyan-500 text-cyan-400"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
