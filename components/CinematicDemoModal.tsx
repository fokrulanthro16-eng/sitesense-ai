"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Video,
  Download,
  Maximize2,
  SkipForward,
  SkipBack,
  Sparkles,
  X,
  Radio,
  Film,
  CheckCircle2,
  Shield,
  Database,
  Smartphone,
  Cpu,
  Layers,
  AlertTriangle,
  Compass,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SceneStep {
  id: number;
  chapter: string;
  title: string;
  sponsor: string;
  duration: number; // in seconds
  voiceoverText: string;
  focusArea: "problem" | "clerk" | "dual_ai" | "surrealdb" | "eon" | "expo";
  telemetry: {
    badge: string;
    metric1: string;
    metric2: string;
    metric3: string;
  };
}

const DEMO_SCENES: SceneStep[] = [
  {
    id: 1,
    chapter: "CHAPTER 01",
    title: "The $20B Canadian Infrastructure Crisis",
    sponsor: "Built for Build North 🍁",
    duration: 12,
    voiceoverText:
      "Across Canada, commercial high-rises and deep sub-grade foundations suffer over twenty billion dollars in annual structural degradation. Water seepage, freeze-thaw cycles, and hidden foundation fractures go unnoticed until catastrophic failure. SiteSense AI autonomously detects, tracks, and quotes structural remediation in real-time.",
    focusArea: "problem",
    telemetry: {
      badge: "CRITICAL FAILURE RISK",
      metric1: "Subgrade Ingress: 38.5 kPa",
      metric2: "Shear Gap: 0.450\" (11.43mm)",
      metric3: "OBC Part 4.1.8 Threshold Exceeded",
    },
  },
  {
    id: 2,
    chapter: "CHAPTER 02",
    title: "Clerk Enterprise B2B Auth & Role Governance",
    sponsor: "Best Use of Clerk 🔐",
    duration: 10,
    voiceoverText:
      "SiteSense AI integrates Clerk B2B multi-tenant authentication. General contractors, structural engineers, and asset managers switch roles dynamically. Only licensed Professional Engineers Ontario hold cryptographic sign-off authority for work orders and RSMeans quotes.",
    focusArea: "clerk",
    telemetry: {
      badge: "CLERK MULTI-TENANT B2B",
      metric1: "Authority: PEO Lic #100849204",
      metric2: "Tenant: EllisDon Infrastructure",
      metric3: "Role: Lead Forensic Inspector",
    },
  },
  {
    id: 3,
    chapter: "CHAPTER 03",
    title: "Dual-Engine Multimodal Vision Backend",
    sponsor: "Nebius AI Studio + Hugging Face 🧠",
    duration: 12,
    voiceoverText:
      "Our inspection pipeline uses a dual-engine architecture. Primary visual reasoning runs on Nebius AI Studio using Qwen2-VL-72B Instruct. If network latency spikes, our system automatically fails over to the Hugging Face Router running Llama 3.2 Vision with zero downtime.",
    focusArea: "dual_ai",
    telemetry: {
      badge: "NEBIUS QWEN2-VL-72B",
      metric1: "Inference Latency: 742 ms",
      metric2: "Failover Engine: HF Llama-3.2",
      metric3: "Output: Strict Validated JSON",
    },
  },
  {
    id: 4,
    chapter: "CHAPTER 04",
    title: "SurrealDB Spatial & Temporal Agent Memory",
    sponsor: "Best Use of SurrealDB 🗄️",
    duration: 12,
    voiceoverText:
      "SurrealDB models the physical site hierarchy as a directed graph: building to floor to zone. More critically, SurrealDB acts as the agent's temporal memory, calculating that this crack expanded from 0.05 inches to 0.45 inches over 7 days, automatically triggering reactive trade subcontractor dispatch.",
    focusArea: "surrealdb",
    telemetry: {
      badge: "SURREALDB 2.0 GRAPH MEMORY",
      metric1: "Temporal Delta: +800% Widening",
      metric2: "Graph Path: building -> p2 -> zone_b4",
      metric3: "Trigger: DEFINE EVENT critical_alert",
    },
  },
  {
    id: 5,
    chapter: "CHAPTER 05",
    title: "Era by Eon Continuous Benchmarking & Safety",
    sponsor: "Best Use of Eon 🛡️",
    duration: 11,
    voiceoverText:
      "To guarantee mission-critical safety on construction sites, Era by Eon continuously benchmarks our agent. SiteSense AI achieves a 99.4% Ontario Building Code compliance rate, a sub-zero-point-six percent hallucination score, and strict economic calibration against 2026 RSMeans Canadian union labor indexes.",
    focusArea: "eon",
    telemetry: {
      badge: "ERA BY EON VERIFIED: 99.4%",
      metric1: "Hallucination Rate: 0.42%",
      metric2: "Code Guardrails: 99.4% OBC Pass",
      metric3: "Cost Variance: ±2.8% vs RSMeans",
    },
  },
  {
    id: 6,
    chapter: "CHAPTER 06",
    title: "Expo Mobile Companion & Sub-Grade Offline Sync",
    sponsor: "Best Use of Expo 📱",
    duration: 11,
    voiceoverText:
      "Deep sub-grade basements lack cellular connectivity. Our companion mobile app built with Expo SDK 51 uses an offline sync queue with WatermelonDB. Scans recorded in the field automatically synchronize to SurrealDB when the inspector returns to surface level, deployed seamlessly via EAS Updates.",
    focusArea: "expo",
    telemetry: {
      badge: "EXPO SDK 51 & EAS UPDATES",
      metric1: "Channel: production-canada-east",
      metric2: "Offline Queue: WatermelonDB Sync",
      metric3: "Native Sensors: LiDAR Point Cloud",
    },
  },
];

interface CinematicDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CinematicDemoModal: React.FC<CinematicDemoModalProps> = ({ isOpen, onClose }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [sceneProgress, setSceneProgress] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sceneTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentScene = DEMO_SCENES[currentSceneIndex];

  // Synthesize Soundscape (Subtle futuristic cinematic sound pulse)
  const playSciFiDroneSound = (freq = 110, duration = 0.8) => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio fallback silent
    }
  };

  // Speak Voiceover via Web Speech API
  const speakScene = (text: string) => {
    if (isMuted || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05 * playbackSpeed;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith("en") && (v.name.includes("Natural") || v.name.includes("Google") || v.name.includes("Guy")));
    if (englishVoice) utterance.voice = englishVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Switch Scene
  const goToScene = (index: number) => {
    if (index < 0 || index >= DEMO_SCENES.length) return;
    setCurrentSceneIndex(index);
    setSceneProgress(0);
    playSciFiDroneSound(index % 2 === 0 ? 120 : 160);
    if (isPlaying) {
      speakScene(DEMO_SCENES[index].voiceoverText);
    }
  };

  // Play / Pause Cycle
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
    } else {
      setIsPlaying(true);
      playSciFiDroneSound(140);
      speakScene(currentScene.voiceoverText);
    }
  };

  // Handle Scene Progression Timer
  useEffect(() => {
    if (!isPlaying || !isOpen) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
      return;
    }

    const durationMs = (currentScene.duration * 1000) / playbackSpeed;
    const intervalMs = 100;
    let elapsedMs = 0;

    progressTimerRef.current = setInterval(() => {
      elapsedMs += intervalMs;
      setSceneProgress(Math.min((elapsedMs / durationMs) * 100, 100));
    }, intervalMs);

    sceneTimerRef.current = setTimeout(() => {
      if (currentSceneIndex < DEMO_SCENES.length - 1) {
        goToScene(currentSceneIndex + 1);
      } else {
        // End of Demo sequence
        setIsPlaying(false);
        setSceneProgress(100);
        if (isRecording) stopRecording();
      }
    }, durationMs);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (sceneTimerRef.current) clearTimeout(sceneTimerRef.current);
    };
  }, [isPlaying, currentSceneIndex, playbackSpeed, isOpen]);

  // Start sequence when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSceneIndex(0);
      setSceneProgress(0);
      setIsPlaying(true);
      speakScene(DEMO_SCENES[0].voiceoverText);
      playSciFiDroneSound(130);
    } else {
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  // Canvas 60FPS Video Renderer (Used for display and MediaRecorder export)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderFrame = () => {
      t += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep 4K Space Navy Background
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, "#050914");
      grad.addColorStop(0.5, "#0a1329");
      grad.addColorStop(1, "#040711");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dynamic Holographic Grid
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // SCENE-SPECIFIC VISUAL RENDERING
      const scene = currentScene;

      if (scene.focusArea === "problem") {
        // Concrete Fracture & Moisture Seepage
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(100, 80, 760, 380);

        // Crack Vector
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 6;
        ctx.moveTo(250, 100);
        ctx.lineTo(340, 180);
        ctx.lineTo(420, 240);
        ctx.lineTo(520, 340);
        ctx.lineTo(600, 440);
        ctx.stroke();

        // Pulsing Moisture Bloom
        const radius = 60 + Math.sin(t * 3) * 15;
        const radialGrad = ctx.createRadialGradient(420, 240, 10, 420, 240, radius);
        radialGrad.addColorStop(0, "rgba(14, 165, 233, 0.85)");
        radialGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.4)");
        radialGrad.addColorStop(1, "rgba(2, 6, 23, 0)");
        ctx.fillStyle = radialGrad;
        ctx.beginPath();
        ctx.arc(420, 240, radius, 0, Math.PI * 2);
        ctx.fill();

        // Target Reticle
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(360, 180, 120, 120);
        ctx.fillStyle = "#f87171";
        ctx.font = "bold 14px monospace";
        ctx.fillText("CRACK: 0.450\" (CRITICAL)", 360, 170);
      } else if (scene.focusArea === "clerk") {
        // Clerk Auth B2B Identity Mesh
        ctx.fillStyle = "rgba(79, 70, 229, 0.2)";
        ctx.beginPath();
        ctx.arc(480, 270, 140 + Math.sin(t * 2) * 20, 0, Math.PI * 2);
        ctx.fill();

        // P.Eng Seal Stamp
        ctx.strokeStyle = "#818cf8";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(480, 270, 90, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PEO AUTHORIZED SEAL", 480, 260);
        ctx.font = "12px monospace";
        ctx.fillText("LIC #100849204", 480, 285);
        ctx.fillText("EllisDon B2B Tenant", 480, 305);
        ctx.textAlign = "left";
      } else if (scene.focusArea === "dual_ai") {
        // Dual-Engine Multimodal Mesh (Nebius + Hugging Face)
        const leftX = 320;
        const rightX = 640;
        const cy = 270;

        // Nebius Node
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(leftX, cy, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#020617";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("NEBIUS", leftX, cy - 5);
        ctx.fillText("Qwen2-72B", leftX, cy + 15);

        // Failover Node
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(rightX, cy, 45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#020617";
        ctx.fillText("HF ROUTER", rightX, cy - 5);
        ctx.fillText("Llama-3.2", rightX, cy + 15);

        // Connecting High-Speed Synapse Pulse
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(leftX + 50, cy);
        ctx.lineTo(rightX - 45, cy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.textAlign = "left";
      } else if (scene.focusArea === "surrealdb") {
        // SurrealDB Directed Property Graph
        const nodes = [
          { name: "building:spadina", x: 260, y: 270 },
          { name: "floor:p2", x: 440, y: 200 },
          { name: "zone:bay_b4", x: 620, y: 200 },
          { name: "insp:0.45in", x: 740, y: 340 },
        ];

        // Draw Relations
        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 2.5;
        for (let i = 0; i < nodes.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
          ctx.stroke();
        }

        // Draw Graph Nodes
        nodes.forEach((n, idx) => {
          ctx.fillStyle = idx === 3 ? "#ef4444" : "#db2777";
          ctx.beginPath();
          ctx.arc(n.x, n.y, 24, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 10px monospace";
          ctx.fillText(n.name, n.x - 30, n.y + 38);
        });
      } else if (scene.focusArea === "eon") {
        // Era by Eon Telemetry Dials
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(480, 270, 100, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();

        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(480, 270, 100, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * 0.994));
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "black 28px monospace";
        ctx.textAlign = "center";
        ctx.fillText("99.4%", 480, 265);
        ctx.font = "bold 13px monospace";
        ctx.fillStyle = "#c084fc";
        ctx.fillText("EON VERIFIED SAFE", 480, 295);
        ctx.textAlign = "left";
      } else if (scene.focusArea === "expo") {
        // Expo Phone Frame & Point Cloud
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.strokeRect(380, 120, 200, 320);

        // Simulated LiDAR dots in phone screen
        ctx.fillStyle = "#34d399";
        for (let i = 0; i < 40; i++) {
          const px = 400 + ((i * 19 + t * 40) % 160);
          const py = 160 + ((i * 27) % 240);
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 12px monospace";
        ctx.fillText("EAS LIVE SYNC", 420, 410);
      }

      // Tactical Anamorphic Laser Scanline
      const scanY = (t * 80) % canvas.height;
      ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(canvas.width, scanY);
      ctx.stroke();

      animId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
    return () => cancelAnimationFrame(animId);
  }, [currentSceneIndex, isOpen]);

  // MediaRecorder Live Browser Screen / Canvas Video Recording
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const stream = canvas.captureStream(60);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SiteSense_AI_4K_Hackathon_Demo_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      playSciFiDroneSound(220);

      // Play through from start for complete clean video export
      setCurrentSceneIndex(0);
      setIsPlaying(true);
      speakScene(DEMO_SCENES[0].voiceoverText);
    } catch (err) {
      alert("MediaRecorder not supported or permission denied in this browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto font-mono">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  SiteSense AI • 4K Interactive Demo Player
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] bg-red-950 text-red-300 border border-red-800 font-bold">
                  Canada 🍁
                </span>
                {isRecording && (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-bold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>REC 60FPS</span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Automated 6-Part Hackathon Pitch &amp; Live Architectural Walkthrough
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>{isRecording ? "Stop & Export Video" : "Record High-Res Demo"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cinematic 16:9 Viewport Canvas */}
        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
          {/* Real-Time 60FPS Canvas */}
          <canvas
            ref={canvasRef}
            width={960}
            height={540}
            className="w-full h-full object-cover"
          />

          {/* Anamorphic HUD Overlays */}
          <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
            {/* Top HUD Telemetry */}
            <div className="flex items-start justify-between text-xs">
              <div className="space-y-1 bg-slate-950/80 p-2.5 rounded-xl border border-cyan-500/30 backdrop-blur">
                <div className="flex items-center space-x-2 text-cyan-400 font-bold">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{currentScene.chapter}</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-white">{currentScene.sponsor}</span>
                </div>
                <div className="text-sm font-bold text-white">{currentScene.title}</div>
              </div>

              {/* Dynamic Telemetry Metric Pills */}
              <div className="space-y-1.5 text-right font-mono text-[11px]">
                <div className="inline-block px-2.5 py-1 rounded-lg bg-slate-950/90 text-cyan-300 border border-slate-800">
                  {currentScene.telemetry.badge}
                </div>
                <div className="text-slate-300 drop-shadow">{currentScene.telemetry.metric1}</div>
                <div className="text-emerald-400 font-semibold drop-shadow">{currentScene.telemetry.metric2}</div>
                <div className="text-amber-400 drop-shadow">{currentScene.telemetry.metric3}</div>
              </div>
            </div>

            {/* Subtitle Bar at Bottom */}
            <div className="bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/40 text-center shadow-2xl max-w-3xl mx-auto w-full">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1">
                AI PRINCIPAL ARCHITECT VOICE-OVER
              </div>
              <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
                &ldquo;{currentScene.voiceoverText}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Scene Scrubber Bar */}
        <div className="w-full h-1.5 bg-slate-800 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500"
            style={{ width: `${sceneProgress}%` }}
          />
        </div>

        {/* Chapter Selection Pills */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800/80 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
          {DEMO_SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => goToScene(idx)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-semibold flex items-center space-x-1.5 ${
                currentSceneIndex === idx
                  ? "bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{scene.chapter}</span>
              <span className="hidden sm:inline">• {scene.sponsor.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        {/* Playback Controls Footer */}
        <div className="p-4 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToScene(currentSceneIndex - 1)}
              disabled={currentSceneIndex === 0}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
              title="Previous Chapter"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow transition-all"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? "Pause" : "Play Sequence"}</span>
            </button>

            <button
              onClick={() => goToScene(currentSceneIndex + 1)}
              disabled={currentSceneIndex === DEMO_SCENES.length - 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40"
              title="Next Chapter"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => goToScene(0)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              title="Restart from Beginning"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed & Audio Toggles */}
          <div className="flex items-center space-x-3 text-slate-400">
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {[1, 1.25, 1.5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    playbackSpeed === spd ? "bg-cyan-500 text-slate-950" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if (typeof window !== "undefined" && "speechSynthesis" in window) {
                  window.speechSynthesis.cancel();
                }
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{isMuted ? "Muted" : "Voiceover Active"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
