"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Video,
  Mic,
  MicOff,
  Sparkles,
  Layers,
  Upload,
  Crosshair,
  BatteryCharging,
  Wifi,
  Eye,
  Maximize2,
  Thermometer,
  Grid,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type VisualMode = "rgb" | "flir" | "lidar";

export interface PresetSite {
  id: string;
  name: string;
  zone: string;
  location: string;
  description: string;
  defaultSeverity: "CRITICAL" | "MODERATE" | "LOW";
  initialCrack: string;
  caliperMeasurement: string;
  temperatureReadout: string;
  thermalType: "cold_ingress" | "hotspot" | "friction" | "ponding";
  box: {
    top: string;
    left: string;
    width: string;
    height: string;
    label: string;
    sublabel: string;
  };
}

export const SITE_PRESETS: PresetSite[] = [
  {
    id: "preset_basement",
    name: "East Foundation Shear Crack",
    zone: "Basement Foundation Wall - East Bay B-4",
    location: "Toronto Spadina Tower • P2 Sub-Grade",
    description: "Diagonal structural shear fracture penetrating 250mm concrete wall with active water ingress.",
    defaultSeverity: "CRITICAL",
    initialCrack: '0.450" (11.43mm) Shear Gap',
    caliperMeasurement: '0.450" ±0.005mm',
    temperatureReadout: "8.4°C (Moisture Evaporation Coldspot)",
    thermalType: "cold_ingress",
    box: {
      top: "22%",
      left: "26%",
      width: "48%",
      height: "56%",
      label: "CRITICAL SHEAR FRACTURE [CSA-A23.3]",
      sublabel: 'Δt: +800% Widening • Efflorescence Ingress',
    },
  },
  {
    id: "preset_hvac",
    name: "Sub-Grade Commercial HVAC Chiller",
    zone: "Commercial HVAC Chiller Bay #2",
    location: "Mechanical Penthouse • Roof Bay 12",
    description: "Severe galvanic oxidation, vibration snubber failure & secondary loop corrosion.",
    defaultSeverity: "MODERATE",
    initialCrack: "3.4mm Manifold Pitting",
    caliperMeasurement: '0.135" Deflection',
    temperatureReadout: "58.6°C (Bearing Friction)",
    thermalType: "friction",
    box: {
      top: "26%",
      left: "30%",
      width: "44%",
      height: "48%",
      label: "GALVANIC VIBRATION CORROSION",
      sublabel: "Corrosion Index: 48% • CSA B52 Alert",
    },
  },
  {
    id: "preset_electrical",
    name: "Main 600V Switchgear Arc Risk",
    zone: "Primary 600V Main Electrical Switchgear",
    location: "Level 1 High-Voltage Vault",
    description: "Phase B 800A busbar loose connection causing severe resistive heating and arc flash danger.",
    defaultSeverity: "CRITICAL",
    initialCrack: "89.4°C Thermal Anomaly",
    caliperMeasurement: '0.082" Lug Gap',
    temperatureReadout: "89.4°C (Phase B Arc Hazard)",
    thermalType: "hotspot",
    box: {
      top: "20%",
      left: "34%",
      width: "36%",
      height: "58%",
      label: "THERMAL HOTSPOT: 89.4°C [OESC RULE 12-112]",
      sublabel: "ΔT: +47.4°C Above Ambient (CRITICAL)",
    },
  },
  {
    id: "preset_roof",
    name: "Roof Membrane Hydrostatic Breach",
    zone: "Roof Level 24 Membrane Drain Basin",
    location: "Tower East Parapet • Level 24",
    description: "SBS torch-down membrane delamination and saturation adjacent to commercial drain hopper.",
    defaultSeverity: "MODERATE",
    initialCrack: "3.2m² Saturated Core",
    caliperMeasurement: '0.850" Seam Gap',
    temperatureReadout: "9.1°C (Subsurface Ponding)",
    thermalType: "ponding",
    box: {
      top: "24%",
      left: "22%",
      width: "56%",
      height: "52%",
      label: "SBS MEMBRANE PONDING BREACH",
      sublabel: "Division B Part 5 • Capillary Infiltration",
    },
  },
];

interface CameraHUDProps {
  onScan: (payload: {
    image: string;
    zoneName: string;
    voiceNotes: string;
    presetId: string;
  }) => void;
  onPresetChange?: (preset: PresetSite) => void;
  isAnalyzing: boolean;
  activeZone: string;
}

export const CameraHUD: React.FC<CameraHUDProps> = ({
  onScan,
  onPresetChange,
  isAnalyzing,
  activeZone,
}) => {
  const [visualMode, setVisualMode] = useState<VisualMode>("rgb");
  const [feedMode, setFeedMode] = useState<"preset" | "webcam" | "upload">("preset");
  const [selectedPreset, setSelectedPreset] = useState<PresetSite>(SITE_PRESETS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showCalipers, setShowCalipers] = useState<boolean>(true);

  // Audio / Speech State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [voiceNotes, setVoiceNotes] = useState<string>(
    "Observed 0.450-inch diagonal shear fracture near footing. Calcite efflorescence and active hydrostatic ingress visible."
  );
  const recognitionRef = useRef<any>(null);

  // Webcam State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // LiDAR Canvas Ref
  const lidarCanvasRef = useRef<HTMLCanvasElement>(null);

  // Quick Tags
  const quickTags = [
    "Basement Shear Wall",
    "Commercial Chiller Bay",
    "600V Switchgear Phase B",
    "Roof Drain Membrane",
    "Efflorescence Infiltration",
    "CSA A23.3 Compliance",
  ];

  // Sync preset if activeZone changes from external component
  useEffect(() => {
    const match = SITE_PRESETS.find((p) => p.zone.toLowerCase() === activeZone.toLowerCase());
    if (match && match.id !== selectedPreset.id) {
      setSelectedPreset(match);
    }
  }, [activeZone]);

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

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (e) {
        console.warn("Speech recognition start failed", e);
      }
    }
  };

  // Webcam Handlers
  const startWebcam = async () => {
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
      setFeedMode("webcam");
    } catch (err) {
      console.warn("Camera access denied or unavailable. Fallback to photorealistic scene.", err);
      setFeedMode("preset");
    }
  };

  const stopWebcam = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  // Handle preset switch
  const handleSelectPreset = (preset: PresetSite) => {
    setSelectedPreset(preset);
    if (feedMode === "webcam") stopWebcam();
    setFeedMode("preset");
    onPresetChange?.(preset);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedImage(base64);
        setFeedMode("upload");
        onScan({
          image: base64,
          zoneName: selectedPreset.zone,
          voiceNotes,
          presetId: selectedPreset.id,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedImage(base64);
        setFeedMode("upload");
      };
      reader.readAsDataURL(file);
    }
  };

  // Render animated LiDAR Point Cloud on Canvas
  useEffect(() => {
    if (visualMode !== "lidar") return;

    const canvas = lidarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let scanY = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const rows = 28;
      const cols = 42;
      const stepX = canvas.width / cols;
      const stepY = canvas.height / rows;

      scanY = (scanY + 1.5) % canvas.height;

      // Draw Depth Point Matrix
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * stepX + stepX / 2;
          const y = r * stepY + stepY / 2;

          // Compute distance to center crack vector
          const distToCrack = Math.abs(x - (y * 0.7 + 100));
          const isFractureZone = distToCrack < 45;

          const distToScanline = Math.abs(y - scanY);
          const isHighlighted = distToScanline < 25;

          ctx.beginPath();
          if (isFractureZone) {
            // Depth elevation anomaly in crack
            ctx.fillStyle = isHighlighted ? "#f59e0b" : "#ef4444";
            ctx.arc(x, y, isHighlighted ? 2.8 : 2.0, 0, Math.PI * 2);
          } else {
            // Nominal flat concrete depth plane
            ctx.fillStyle = isHighlighted ? "#38bdf8" : "rgba(6, 182, 212, 0.4)";
            ctx.arc(x, y, isHighlighted ? 1.8 : 1.2, 0, Math.PI * 2);
          }
          ctx.fill();
        }
      }

      // Draw LiDAR Scan Line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(56, 189, 248, 0.85)";
      ctx.lineWidth = 1.5;
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [visualMode]);

  // Execute scan trigger
  const triggerScan = () => {
    const activeImagePayload =
      feedMode === "upload" && uploadedImage
        ? uploadedImage
        : `data:image/svg+xml;utf8,${encodeURIComponent(selectedPreset.name)}`;

    onScan({
      image: activeImagePayload,
      zoneName: selectedPreset.zone,
      voiceNotes,
      presetId: selectedPreset.id,
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/70 backdrop-blur-xl border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl relative font-mono">
      {/* Top HUD Controls & Mode Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-950/90 border-b border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold">SPATIAL AR HUD v3.0</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            SITE: <span className="text-white font-bold">{selectedPreset.name}</span>
          </span>
        </div>

        {/* Visual Layer Selector (RGB vs FLIR vs LiDAR) */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setVisualMode("rgb")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
              visualMode === "rgb"
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>RGB Forensic</span>
          </button>

          <button
            onClick={() => setVisualMode("flir")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
              visualMode === "flir"
                ? "bg-amber-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Thermal FLIR</span>
          </button>

          <button
            onClick={() => setVisualMode("lidar")}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-all ${
              visualMode === "lidar"
                ? "bg-purple-500 text-white font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>LiDAR Point Cloud</span>
          </button>
        </div>

        {/* Feed Source Selector */}
        <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => {
              stopWebcam();
              setFeedMode("preset");
            }}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              feedMode === "preset"
                ? "bg-slate-800 text-cyan-300 font-bold border border-cyan-500/40"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Preset
          </button>
          <button
            onClick={startWebcam}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
              feedMode === "webcam"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Video className="w-3 h-3" />
            <span>Webcam</span>
          </button>
          <label
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
              feedMode === "upload"
                ? "bg-cyan-500 text-slate-950 font-bold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Drop/Upload</span>
            <input type="file" accept="image/*" onChange={handleFileInput} className="hidden" />
          </label>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex-1 min-h-[380px] lg:min-h-[460px] bg-slate-950 flex items-center justify-center overflow-hidden transition-all ${
          isDragOver ? "ring-4 ring-cyan-400 ring-inset bg-cyan-950/40" : ""
        }`}
      >
        {/* VIEWPORT BACKDROP: Embedded Photorealistic SVG / Canvas Scene */}
        {feedMode === "webcam" ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : feedMode === "upload" && uploadedImage ? (
          <img
            src={uploadedImage}
            alt="Uploaded Site Inspection"
            className="w-full h-full object-cover"
          />
        ) : (
          /* HIGH-RESOLUTION PHOTOREALISTIC PROCEDURAL CONSTRUCTION SCENE */
          <div className="absolute inset-0 w-full h-full select-none overflow-hidden">
            {/* 1. Basement Foundation Shear Crack Scene */}
            {selectedPreset.id === "preset_basement" && (
              <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                <defs>
                  {/* Concrete Aggregate Texture Filter */}
                  <filter id="concrete-texture">
                    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
                    <feColorMatrix
                      type="matrix"
                      values="0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0.33 0.33 0.33 0 0
                              0    0    0    1 0"
                    />
                    <feComponentTransfer>
                      <feFuncR type="linear" slope="0.7" intercept="0.25" />
                      <feFuncG type="linear" slope="0.7" intercept="0.25" />
                      <feFuncB type="linear" slope="0.7" intercept="0.27" />
                    </feComponentTransfer>
                    <feBlend in="SourceGraphic" in2="noise" mode="multiply" />
                  </filter>

                  {/* Efflorescence Crystalline Gradient */}
                  <linearGradient id="efflorescence" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                    <stop offset="40%" stopColor="#e2e8f0" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#cbd5e1" stopOpacity="0.1" />
                  </linearGradient>

                  {/* Water Seepage Stain Gradient */}
                  <radialGradient id="water-stain" cx="45%" cy="55%" r="60%">
                    <stop offset="0%" stopColor="#0f172a" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#1e293b" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Base Cast Concrete Wall with Form-Tie Marks */}
                <rect width="1000" height="600" fill="#334155" filter="url(#concrete-texture)" />

                {/* Concrete Pour Seam & Formwork Lines */}
                <line x1="0" y1="200" x2="1000" y2="200" stroke="#1e293b" strokeWidth="3" opacity="0.6" />
                <line x1="0" y1="400" x2="1000" y2="400" stroke="#1e293b" strokeWidth="3" opacity="0.6" />
                <circle cx="180" cy="200" r="14" fill="#0f172a" opacity="0.7" />
                <circle cx="820" cy="200" r="14" fill="#0f172a" opacity="0.7" />
                <circle cx="180" cy="400" r="14" fill="#0f172a" opacity="0.7" />
                <circle cx="820" cy="400" r="14" fill="#0f172a" opacity="0.7" />

                {/* Dark Capillary Moisture Seepage Halo */}
                <path
                  d="M 280,120 Q 420,240 520,380 T 640,580 L 740,600 L 260,600 Z"
                  fill="url(#water-stain)"
                />

                {/* Calcite Efflorescence Mineral Deposits */}
                <path
                  d="M 340,160 Q 440,250 510,360 Q 490,440 540,540"
                  stroke="url(#efflorescence)"
                  strokeWidth="32"
                  fill="none"
                  strokeLinecap="round"
                  filter="blur(4px)"
                />
                <path
                  d="M 370,180 Q 460,280 500,380"
                  stroke="#ffffff"
                  strokeWidth="14"
                  fill="none"
                  opacity="0.75"
                />

                {/* Primary Deep Structural Shear Fracture Path */}
                <path
                  d="M 310,130 L 335,170 L 360,195 L 385,245 L 420,280 L 450,320 L 490,370 L 530,430 L 555,480 L 590,560"
                  stroke="#050811"
                  strokeWidth="9"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Secondary Micro-Fissures Spreading Out */}
                <path
                  d="M 420,280 L 470,270 L 510,290"
                  stroke="#090d16"
                  strokeWidth="3"
                  fill="none"
                />
                <path
                  d="M 490,370 L 540,385 L 565,375"
                  stroke="#090d16"
                  strokeWidth="3.5"
                  fill="none"
                />

                {/* Exposed Corroded Steel Rebar Anchor */}
                <rect x="444" y="312" width="12" height="18" fill="#b45309" rx="2" />
                <rect x="446" y="314" width="8" height="14" fill="#78350f" rx="1" />
              </svg>
            )}

            {/* 2. Sub-Grade Commercial HVAC Chiller Scene */}
            {selectedPreset.id === "preset_hvac" && (
              <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                <rect width="1000" height="600" fill="#0f172a" />
                {/* Heavy Industrial Pipe System */}
                <rect x="120" y="240" width="760" height="120" fill="#334155" rx="8" />
                <rect x="120" y="260" width="760" height="80" fill="#475569" />
                {/* Flange Coupling & Bolted Rings */}
                <rect x="420" y="210" width="60" height="180" fill="#1e293b" rx="4" />
                <rect x="490" y="210" width="60" height="180" fill="#1e293b" rx="4" />
                {/* Flange Bolts */}
                <circle cx="450" cy="235" r="8" fill="#64748b" />
                <circle cx="450" cy="285" r="8" fill="#64748b" />
                <circle cx="450" cy="335" r="8" fill="#64748b" />
                <circle cx="450" cy="365" r="8" fill="#64748b" />
                <circle cx="520" cy="235" r="8" fill="#64748b" />
                <circle cx="520" cy="285" r="8" fill="#64748b" />
                <circle cx="520" cy="335" r="8" fill="#64748b" />
                <circle cx="520" cy="365" r="8" fill="#64748b" />
                {/* Vibration Seismic Snubber Springs */}
                <path
                  d="M 450,420 L 470,440 L 440,460 L 470,480 L 440,500 L 460,520"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                />
                <path
                  d="M 520,420 L 540,440 L 510,460 L 540,480 L 510,500 L 530,520"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Green Patina & Rust Scale on Manifold */}
                <ellipse cx="485" cy="300" rx="35" ry="45" fill="#047857" opacity="0.7" filter="blur(6px)" />
                <ellipse cx="485" cy="310" rx="25" ry="30" fill="#b45309" opacity="0.8" filter="blur(4px)" />
                <path d="M 470,290 L 500,320 L 480,340" stroke="#78350f" strokeWidth="4" fill="none" />
              </svg>
            )}

            {/* 3. Main 600V Switchgear Arc Risk Scene */}
            {selectedPreset.id === "preset_electrical" && (
              <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                <rect width="1000" height="600" fill="#090d16" />
                {/* Steel Switchgear Cabinet Chassis */}
                <rect x="150" y="80" width="700" height="460" fill="#1e293b" stroke="#334155" strokeWidth="4" rx="12" />
                {/* Phase A, Phase B, Phase C Solid Copper Busbars */}
                {/* Phase A */}
                <rect x="280" y="140" width="60" height="340" fill="#b45309" rx="4" />
                <rect x="285" y="150" width="50" height="320" fill="#d97706" />
                {/* Phase B (Overheating / Scorched) */}
                <rect x="470" y="140" width="60" height="340" fill="#78350f" rx="4" />
                <rect x="475" y="150" width="50" height="320" fill="#92400e" />
                {/* Thermal Oxidation / Scorched Lug on Phase B */}
                <circle cx="500" cy="270" r="48" fill="#451a03" opacity="0.9" filter="blur(8px)" />
                <circle cx="500" cy="270" r="30" fill="#b91c1c" opacity="0.8" filter="blur(6px)" />
                <circle cx="500" cy="270" r="14" fill="#fbbf24" opacity="0.9" filter="blur(3px)" />
                <rect x="480" y="250" width="40" height="40" fill="#18181b" stroke="#fbbf24" strokeWidth="2" rx="4" />
                {/* Phase C */}
                <rect x="660" y="140" width="60" height="340" fill="#b45309" rx="4" />
                <rect x="665" y="150" width="50" height="320" fill="#d97706" />
                {/* Warning Labels */}
                <rect x="430" y="95" width="140" height="28" fill="#dc2626" rx="4" />
                <text x="500" y="114" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  DANGER 600V
                </text>
              </svg>
            )}

            {/* 4. Roof Membrane Hydrostatic Breach Scene */}
            {selectedPreset.id === "preset_roof" && (
              <svg className="w-full h-full" viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice">
                {/* SBS Torch-Down Bitumen Granular Base */}
                <rect width="1000" height="600" fill="#1e293b" />
                <line x1="0" y1="280" x2="1000" y2="280" stroke="#0f172a" strokeWidth="8" opacity="0.8" />
                {/* Commercial Roof Storm Drain Hopper Basin */}
                <circle cx="500" cy="320" r="90" fill="#0f172a" />
                <circle cx="500" cy="320" r="70" fill="#18181b" />
                <circle cx="500" cy="320" r="40" fill="#000000" />
                {/* Drain Strainer Clamping Ring Bolts */}
                <circle cx="500" cy="250" r="6" fill="#94a3b8" />
                <circle cx="500" cy="390" r="6" fill="#94a3b8" />
                <circle cx="430" cy="320" r="6" fill="#94a3b8" />
                <circle cx="570" cy="320" r="6" fill="#94a3b8" />
                {/* Dark Standing Ponding Water Pool */}
                <ellipse cx="490" cy="330" rx="220" ry="140" fill="#0369a1" opacity="0.35" filter="blur(10px)" />
                <ellipse cx="480" cy="320" rx="160" ry="90" fill="#0284c7" opacity="0.25" filter="blur(8px)" />
                {/* Seam Delamination & Blistering Ridge */}
                <path
                  d="M 320,270 Q 420,290 510,275 T 700,285"
                  stroke="#000000"
                  strokeWidth="6"
                  fill="none"
                />
              </svg>
            )}
          </div>
        )}

        {/* -------------------------------------------------------------
            INTERACTIVE VISUAL MODE 1: THERMAL FLIR OVERLAY
           ------------------------------------------------------------- */}
        {visualMode === "flir" && (
          <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-90">
            {/* FLIR Ironbow Thermal Spectrum Filter */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  selectedPreset.thermalType === "hotspot"
                    ? "radial-gradient(circle at 50% 45%, rgba(254, 240, 138, 0.95) 0%, rgba(249, 115, 22, 0.85) 25%, rgba(168, 85, 247, 0.7) 50%, rgba(30, 27, 75, 0.85) 85%)"
                    : selectedPreset.thermalType === "cold_ingress" || selectedPreset.thermalType === "ponding"
                    ? "radial-gradient(circle at 48% 52%, rgba(14, 165, 233, 0.9) 0%, rgba(79, 70, 229, 0.75) 30%, rgba(217, 70, 239, 0.6) 60%, rgba(24, 24, 27, 0.8) 85%)"
                    : "radial-gradient(circle at 52% 48%, rgba(234, 179, 8, 0.9) 0%, rgba(239, 68, 68, 0.75) 35%, rgba(126, 34, 206, 0.6) 65%, rgba(15, 23, 42, 0.8) 85%)",
              }}
            />

            {/* FLIR Vertical Temperature Scale Bar on Right Side */}
            <div className="absolute top-12 right-6 bottom-12 w-6 rounded-lg overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col justify-between p-1 bg-slate-950/70 text-[9px] font-bold text-white z-20">
              <div
                className="absolute inset-0 -z-10"
                style={{
                  background:
                    "linear-gradient(to bottom, #fef08a, #f97316, #ef4444, #a855f7, #3b82f6, #0f172a)",
                }}
              />
              <span className="text-slate-950 font-black">90°C</span>
              <span className="text-white drop-shadow">50°C</span>
              <span className="text-white drop-shadow">30°C</span>
              <span className="text-cyan-200 drop-shadow">10°C</span>
            </div>

            {/* Thermal Crosshair Readout Badge at Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/90 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500 shadow-xl flex items-center space-x-2 text-xs font-bold">
              <Thermometer className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{selectedPreset.temperatureReadout}</span>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------
            INTERACTIVE VISUAL MODE 2: LIDAR POINT CLOUD CANVAS
           ------------------------------------------------------------- */}
        {visualMode === "lidar" && (
          <canvas
            ref={lidarCanvasRef}
            width={800}
            height={500}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />
        )}

        {/* -------------------------------------------------------------
            FUTURISTIC HUD OVERLAY: RETICLES, RETICALS & BOUNDING BOX
           ------------------------------------------------------------- */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Subtle Cyber Grid */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.25) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(6, 182, 212, 0.25) 1px, transparent 1px)`,
              backgroundSize: "36px 36px",
            }}
          />

          {/* Animated Laser Scanline */}
          <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#06b6d4] animate-scan-line" />

          {/* Precision Targeting Corner Brackets */}
          <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-cyan-400" />
          <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-cyan-400" />
          <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-cyan-400" />

          {/* Center Targeting Reticle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24 border border-cyan-500/30 rounded-full flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]" />
              <div className="absolute top-0 w-full h-[1px] bg-cyan-400/25" />
              <div className="absolute left-0 h-full w-[1px] bg-cyan-400/25" />
            </div>
          </div>

          {/* AI DEFECT BOUNDING BOX OVERLAY */}
          <motion.div
            key={selectedPreset.id}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{
              top: selectedPreset.box.top,
              left: selectedPreset.box.left,
              width: selectedPreset.box.width,
              height: selectedPreset.box.height,
            }}
            className="absolute border-2 border-dashed border-red-500/90 bg-red-500/10 rounded-xl p-2.5 flex flex-col justify-between shadow-[0_0_20px_rgba(239,68,68,0.25)]"
          >
            <div className="flex items-center justify-between">
              <span className="bg-red-600 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                {selectedPreset.box.label}
              </span>
              <span className="bg-slate-950/90 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded border border-cyan-500/50">
                EON: 99.4%
              </span>
            </div>

            {/* Vernier Calipers Micro-Scale Display */}
            {showCalipers && visualMode === "rgb" && (
              <div className="my-auto py-1 px-2 bg-slate-950/90 rounded border border-cyan-500/40 backdrop-blur self-center text-center">
                <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-wider">
                  SUB-MILLIMETER CALIPER
                </div>
                <div className="text-xs font-black text-white font-mono">
                  {selectedPreset.caliperMeasurement}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] font-mono text-slate-200 bg-slate-950/90 px-2 py-1 rounded backdrop-blur">
              <span className="text-red-400 font-bold">{selectedPreset.initialCrack}</span>
              <span className="text-slate-400 text-[10px]">{selectedPreset.box.sublabel}</span>
            </div>
          </motion.div>

          {/* Telemetry Readout Box (Top Left) */}
          <div className="absolute top-4 left-4 font-mono text-[10px] text-cyan-300 space-y-1 bg-slate-950/80 p-2.5 rounded-xl border border-cyan-500/30 backdrop-blur-md">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
              <Crosshair className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: "10s" }} />
              <span>SPATIAL TELEMETRY</span>
            </div>
            <div>GPS: 43.6532° N, 79.3832° W (Toronto)</div>
            <div>ELEV: -6.4m P2 Sub-Grade</div>
            <div>MODE: {visualMode.toUpperCase()} FORENSIC</div>
            <div className="text-emerald-400 flex items-center space-x-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>FPS: 60 • LATENCY: &lt;14ms</span>
            </div>
          </div>

          {/* Sensor Readout Box (Top Right) */}
          <div className="absolute top-4 right-4 font-mono text-[10px] text-slate-300 space-y-1 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 backdrop-blur-md">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>BATTERY: 96%</span>
            </div>
            <div className="flex items-center space-x-1.5 text-cyan-400">
              <Wifi className="w-3.5 h-3.5" />
              <span>EXPO SYNC: READY</span>
            </div>
            <div className="text-slate-400 text-[9px]">
              ENGINE: Nebius Qwen2-VL-72B
            </div>
          </div>
        </div>

        {/* Drag and drop prompt overlay */}
        {isDragOver && (
          <div className="absolute inset-0 bg-cyan-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-300 z-30">
            <Upload className="w-12 h-12 animate-bounce mb-2" />
            <h4 className="text-base font-bold font-mono">Drop Job-Site Photo Here</h4>
            <p className="text-xs text-slate-300 font-mono mt-1">
              Immediately triggers Nebius / Hugging Face AI inspection pipeline
            </p>
          </div>
        )}

        {/* Analyzing Pulse Overlay */}
        <AnimatePresence>
          {isAnalyzing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center z-40"
            >
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full" />
                <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <Sparkles className="absolute inset-0 m-auto w-7 h-7 text-cyan-300 animate-pulse" />
              </div>
              <h4 className="text-base font-bold text-white tracking-wide font-mono">
                DUAL-ENGINE FORENSIC ANALYSIS
              </h4>
              <p className="text-xs text-cyan-300 font-mono mt-1 text-center max-w-sm">
                Evaluating physical failure mode → Calculating SurrealDB temporal delta → Verifying Ontario Building Code...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preset Scenario Selector Strip */}
      <div className="px-4 py-2.5 bg-slate-950/90 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Select Inspection Mission Scenario:</span>
          </span>
          <span className="text-[11px] text-cyan-400">
            Instant Bounding Box &amp; RSMeans Sync
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {SITE_PRESETS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-2.5 rounded-xl border transition-all text-xs relative overflow-hidden ${
                  isSelected
                    ? "bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                    : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-100 truncate pr-1">{preset.name}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                      preset.defaultSeverity === "CRITICAL"
                        ? "bg-red-500/20 text-red-400 border border-red-500/40"
                        : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                    }`}
                  >
                    {preset.defaultSeverity}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{preset.initialCrack}</div>
                {isSelected && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Dictation & Action Controls */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80 space-y-3">
        {/* Voice Dictation Bar */}
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVoiceRecording}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
              isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            }`}
          >
            {isRecording ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 text-slate-400" />}
            <span>{isRecording ? "Listening Live..." : "Voice Dictation"}</span>
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={voiceNotes}
              onChange={(e) => setVoiceNotes(e.target.value)}
              placeholder="Hands-free inspector observation notes..."
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500"
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
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <span className="text-slate-500 shrink-0 font-medium">Quick Tags:</span>
          {quickTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setVoiceNotes((prev) => (prev ? `${prev}; ${tag}` : tag))}
              className="px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-600/50 text-slate-300 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
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
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: "6s" }} />
            <span>{isAnalyzing ? "Processing Spatial Neural Model..." : "Execute Autonomous Inspection Scan"}</span>
          </button>

          <button
            onClick={() => setShowCalipers(!showCalipers)}
            title="Toggle Calipers"
            className={`p-3 rounded-xl border transition-colors ${
              showCalipers
                ? "bg-cyan-950/60 border-cyan-500 text-cyan-400"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
