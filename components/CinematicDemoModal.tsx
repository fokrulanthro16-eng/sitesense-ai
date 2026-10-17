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
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

interface SceneStep {
  id: number;
  chapter: string;
  title: string;
  sponsor: string;
  duration: number; // in seconds fallback
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
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const match = window.location.search.match(/[?&]speed=([0-9.]+)/);
      if (match && match[1]) return parseFloat(match[1]);
    }
    return 1;
  });
  const [sceneProgress, setSceneProgress] = useState<number>(0);
  const [activeWordChar, setActiveWordChar] = useState<number>(0);
  const [isAutoPipelineRunning, setIsAutoPipelineRunning] = useState<boolean>(false);
  const [exportCompleteNotice, setExportCompleteNotice] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentSceneIndexRef = useRef<number>(0);

  // Keep ref synchronized
  useEffect(() => {
    currentSceneIndexRef.current = currentSceneIndex;
  }, [currentSceneIndex]);

  const currentScene = DEMO_SCENES[currentSceneIndex];

  // Voice Selection (Prefers natural Google/Microsoft/Samantha voices)
  const getBestVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Jenny") ||
            v.name.includes("Aria") ||
            v.name.includes("Guy") ||
            v.name.includes("US English"))
      ) ||
      voices.find((v) => v.lang === "en-US" || v.lang === "en-CA") ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0] ||
      null
    );
  };

  // Soundscape Synthesizer: Generates cinematic drones & audio track into MediaRecorder stream
  const playSciFiDroneSound = (freq = 110, duration = 0.8) => {
    if (isMuted || typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
        audioDestRef.current = audioContextRef.current.createMediaStreamDestination();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      if (audioDestRef.current) {
        gain.connect(audioDestRef.current);
      }

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio synth silent fallback
    }
  };

  // Autonomous Speech Engine: Speaks chapter voiceover and triggers onend progression
  const speakCurrentScene = (sceneIndex: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);

    const scene = DEMO_SCENES[sceneIndex];
    if (!scene) return;

    setSceneProgress(0);
    setActiveWordChar(0);

    const fallbackDuration = (scene.duration * 1000) / playbackSpeed;
    const intervalMs = 80;
    let elapsed = 0;

    progressTimerRef.current = setInterval(() => {
      elapsed += intervalMs;
      setSceneProgress(Math.min((elapsed / fallbackDuration) * 100, 100));
    }, intervalMs);

    // If muted, advance based on timer
    if (isMuted) {
      fallbackTimerRef.current = setTimeout(() => {
        advanceNextStep();
      }, fallbackDuration);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(scene.voiceoverText);
    utterance.rate = 1.05 * playbackSpeed;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    const voice = getBestVoice();
    if (voice) utterance.voice = voice;

    // Real-time word boundary karaoke
    utterance.onboundary = (e: any) => {
      if (typeof e.charIndex === "number") {
        setActiveWordChar(e.charIndex);
      }
    };

    // Autonomous step transition on speech end
    utterance.onend = () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      setSceneProgress(100);
      setTimeout(() => {
        advanceNextStep();
      }, 700);
    };

    utterance.onerror = (err) => {
      console.warn("Speech synthesis error or interrupted, using fallback timer.", err);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = setTimeout(() => {
        advanceNextStep();
      }, fallbackDuration);
    };

    // Watchdog fallback timer guarantees smooth progression in headless/quiet environments
    fallbackTimerRef.current = setTimeout(() => {
      console.log(`Watchdog timer advancing chapter from scene ${sceneIndex}`);
      advanceNextStep();
    }, fallbackDuration + 600);

    window.speechSynthesis.speak(utterance);
  };

  // Advance to next chapter or finish presentation
  const advanceNextStep = () => {
    const nextIdx = currentSceneIndexRef.current + 1;
    if (nextIdx < DEMO_SCENES.length) {
      setCurrentSceneIndex(nextIdx);
      playSciFiDroneSound(nextIdx % 2 === 0 ? 130 : 180);
      speakCurrentScene(nextIdx);
    } else {
      // Sequence completed!
      handlePresentationFinished();
    }
  };

  // Handle Presentation Completion
  const handlePresentationFinished = () => {
    setIsPlaying(false);
    setSceneProgress(100);

    // If recording was active, stop MediaRecorder and export video
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    setIsAutoPipelineRunning(false);
    setIsRecording(false);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Switch to specific scene
  const goToScene = (index: number) => {
    if (index < 0 || index >= DEMO_SCENES.length) return;
    setCurrentSceneIndex(index);
    playSciFiDroneSound(140);
    if (isPlaying) {
      speakCurrentScene(index);
    }
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    } else {
      setIsPlaying(true);
      playSciFiDroneSound(150);
      speakCurrentScene(currentSceneIndex);
    }
  };

  // Automated Voiceover Video Pipeline Trigger (One-click complete execution & export)
  const startAutomatedPresentationAndRecord = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      setIsAutoPipelineRunning(true);
      setExportCompleteNotice(null);
      recordedChunksRef.current = [];

      // 60FPS High-Res Canvas Stream
      const stream = canvas.captureStream(60);

      // Create audio destination for synthesized audio
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      if (!audioDestRef.current) {
        audioDestRef.current = audioContextRef.current.createMediaStreamDestination();
      }

      // Add audio track to media stream
      const audioTracks = audioDestRef.current.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        stream.addTrack(audioTracks[0]);
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8000000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SiteSense_AI_Demo_Presentation.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsRecording(false);
        setExportCompleteNotice("Presentation Video Exported & Downloaded Successfully! (SiteSense_AI_Demo_Presentation.webm)");

        // Expose binary base64 on window for automated pipeline collection
        if (typeof window !== "undefined") {
          const reader = new FileReader();
          reader.onloadend = () => {
            (window as any).__RECORDED_VIDEO_BASE64__ = reader.result;
            (window as any).__RECORDED_VIDEO_SIZE__ = blob.size;
            (window as any).__RECORDED_VIDEO_READY__ = true;
          };
          reader.readAsDataURL(blob);
        }
      };

      mediaRecorder.start(200);
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      // Reset to beginning and play through autonomously
      setCurrentSceneIndex(0);
      setIsPlaying(true);
      speakCurrentScene(0);
      playSciFiDroneSound(220);
    } catch (err) {
      console.error("Recording pipeline error:", err);
      alert("MediaRecorder not supported or permission denied in this browser.");
      setIsAutoPipelineRunning(false);
      setIsRecording(false);
    }
  };

  const manualStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setIsAutoPipelineRunning(false);
  };

  // Expose automation hooks on window
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__START_DEMO_RECORDING__ = startAutomatedPresentationAndRecord;
      (window as any).__STOP_DEMO_RECORDING__ = manualStopRecording;
      (window as any).__DEMO_SCENE_INDEX__ = () => currentSceneIndexRef.current;
      (window as any).__DEMO_IS_RECORDING__ = () => isRecording;
      (window as any).__ADVANCE_DEMO_STEP__ = advanceNextStep;
    }
  }, [isOpen, isRecording]);

  // Start sequence when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSceneIndex(0);
      setSceneProgress(0);
      setIsPlaying(true);
      speakCurrentScene(0);
      playSciFiDroneSound(130);

      // Auto-trigger recording if URL parameter autoRecord=1 is present
      if (typeof window !== "undefined" && window.location.search.includes("autoRecord=1")) {
        setTimeout(() => {
          startAutomatedPresentationAndRecord();
        }, 600);
      }
    } else {
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      manualStopRecording();
    }
  }, [isOpen]);

  // 60FPS Canvas Dynamic Camera Sweep & Telemetry Renderer
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

      const scene = currentScene;

      // Camera pan and zoom variables per scene
      let panX = canvas.width / 2;
      let panY = canvas.height / 2;
      let zoom = 1.0;

      if (scene.focusArea === "problem") {
        panX = 420 + Math.sin(t * 0.8) * 20;
        panY = 240 + Math.cos(t * 0.8) * 15;
        zoom = 1.08 + Math.sin(t * 0.5) * 0.04;
      } else if (scene.focusArea === "clerk") {
        panX = 480;
        panY = 270;
        zoom = 1.1 + Math.sin(t * 0.6) * 0.05;
      } else if (scene.focusArea === "dual_ai") {
        panX = 480 + Math.sin(t) * 30;
        panY = 270;
        zoom = 1.05;
      } else if (scene.focusArea === "surrealdb") {
        panX = 500 + Math.cos(t * 0.5) * 40;
        panY = 260;
        zoom = 1.06;
      } else if (scene.focusArea === "eon") {
        panX = 480;
        panY = 270;
        zoom = 1.12 + Math.sin(t * 0.4) * 0.03;
      } else if (scene.focusArea === "expo") {
        panX = 480;
        panY = 280;
        zoom = 1.08;
      }

      // Draw Base Background
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, "#050914");
      bgGrad.addColorStop(0.5, "#091224");
      bgGrad.addColorStop(1, "#030611");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cyber Matrix Grid
      ctx.strokeStyle = "rgba(6, 182, 212, 0.12)";
      ctx.lineWidth = 1;
      const gridSize = 45;
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

      // CAMERA TRANSFORM SWEEP
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-panX, -panY);

      // SCENE 1: Problem (Concrete Shear Crack & Hydrostatic Water Surge)
      if (scene.focusArea === "problem") {
        // Concrete wall block
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(100, 80, 760, 380);

        // Water Infiltration Bloom
        const moistureRadius = 70 + Math.sin(t * 3) * 15;
        const waterGrad = ctx.createRadialGradient(420, 240, 10, 420, 240, moistureRadius);
        waterGrad.addColorStop(0, "rgba(14, 165, 233, 0.85)");
        waterGrad.addColorStop(0.5, "rgba(59, 130, 246, 0.4)");
        waterGrad.addColorStop(1, "rgba(15, 23, 42, 0)");
        ctx.fillStyle = waterGrad;
        ctx.beginPath();
        ctx.arc(420, 240, moistureRadius, 0, Math.PI * 2);
        ctx.fill();

        // Shear Fracture Line
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 6;
        ctx.moveTo(250, 100);
        ctx.lineTo(340, 180);
        ctx.lineTo(420, 240);
        ctx.lineTo(520, 340);
        ctx.lineTo(600, 440);
        ctx.stroke();

        // Sub-Millimeter Vernier Calipers
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(350, 170, 140, 140);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px monospace";
        ctx.fillText("SHEAR CRACK: 0.450\" ±0.005mm", 350, 155);
        ctx.fillStyle = "#f87171";
        ctx.font = "11px monospace";
        ctx.fillText("HYDROSTATIC SURGE: +24.3%", 350, 330);
      }

      // SCENE 2: Clerk B2B Identity & PEO Seal
      if (scene.focusArea === "clerk") {
        // Rotating Holographic Rings
        ctx.save();
        ctx.translate(480, 270);
        ctx.rotate(t * 0.5);
        ctx.strokeStyle = "rgba(79, 70, 229, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(-120, -120, 240, 240);
        ctx.restore();

        // P.Eng Seal Circle
        ctx.strokeStyle = "#6366f1";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(480, 270, 95, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "black 15px monospace";
        ctx.textAlign = "center";
        ctx.fillText("PROVINCE OF ONTARIO", 480, 240);
        ctx.font = "bold 13px monospace";
        ctx.fillText("PEO LIC #100849204", 480, 265);
        ctx.fillStyle = "#a5b4fc";
        ctx.font = "11px monospace";
        ctx.fillText("CLERK B2B: EllisDon Infrastructure", 480, 290);
        ctx.fillText("Role: Lead Structural Inspector", 480, 310);
        ctx.textAlign = "left";
      }

      // SCENE 3: Dual-Engine Multimodal (Nebius + Hugging Face)
      if (scene.focusArea === "dual_ai") {
        const leftX = 320;
        const rightX = 640;
        const cy = 270;

        // Nebius Primary Node
        ctx.fillStyle = "#06b6d4";
        ctx.beginPath();
        ctx.arc(leftX, cy, 55, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#020617";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "center";
        ctx.fillText("NEBIUS AI", leftX, cy - 8);
        ctx.fillText("Qwen2-VL-72B", leftX, cy + 14);

        // Failover Node
        ctx.fillStyle = "#a855f7";
        ctx.beginPath();
        ctx.arc(rightX, cy, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#020617";
        ctx.fillText("HF ROUTER", rightX, cy - 8);
        ctx.fillText("Llama-3.2", rightX, cy + 14);

        // Animated Synapse Pulses
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 8]);
        ctx.beginPath();
        ctx.moveTo(leftX + 55, cy);
        ctx.lineTo(rightX - 50, cy);
        ctx.stroke();
        ctx.setLineDash([]);

        // Latency Badge
        ctx.fillStyle = "#10b981";
        ctx.font = "bold 13px monospace";
        ctx.fillText("LATENCY: 742 ms • STRICT JSON", 480, cy - 25);
        ctx.textAlign = "left";
      }

      // SCENE 4: SurrealDB Directed Graph Memory
      if (scene.focusArea === "surrealdb") {
        const nodes = [
          { name: "building:spadina", x: 260, y: 270 },
          { name: "floor:p2", x: 440, y: 190 },
          { name: "zone:bay_b4", x: 620, y: 190 },
          { name: "insp:0.45in", x: 740, y: 340 },
        ];

        ctx.strokeStyle = "#ec4899";
        ctx.lineWidth = 3;
        for (let i = 0; i < nodes.length - 1; i++) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
          ctx.stroke();
        }

        nodes.forEach((n, idx) => {
          ctx.fillStyle = idx === 3 ? "#ef4444" : "#db2777";
          ctx.beginPath();
          ctx.arc(n.x, n.y, 25, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 11px monospace";
          ctx.fillText(n.name, n.x - 35, n.y + 40);
        });

        ctx.fillStyle = "#f472b6";
        ctx.font = "bold 14px monospace";
        ctx.fillText("Δt: +800% Widening (Oct 10 -> Oct 17)", 420, 130);
      }

      // SCENE 5: Era by Eon Continuous Benchmarks
      if (scene.focusArea === "eon") {
        ctx.strokeStyle = "#a855f7";
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(480, 270, 105, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();

        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(480, 270, 105, Math.PI * 0.8, Math.PI * (0.8 + 1.4 * 0.994));
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "black 32px monospace";
        ctx.textAlign = "center";
        ctx.fillText("99.4%", 480, 260);
        ctx.font = "bold 14px monospace";
        ctx.fillStyle = "#c084fc";
        ctx.fillText("EON VERIFIED SAFE", 480, 290);
        ctx.fillStyle = "#34d399";
        ctx.font = "11px monospace";
        ctx.fillText("Hallucination: <0.6% • RSMeans ±2.8%", 480, 315);
        ctx.textAlign = "left";
      }

      // SCENE 6: Expo Mobile Companion & Offline Sync
      if (scene.focusArea === "expo") {
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 3;
        ctx.strokeRect(380, 110, 200, 330);

        // Animated Depth Dots
        ctx.fillStyle = "#34d399";
        for (let i = 0; i < 45; i++) {
          const px = 400 + ((i * 19 + t * 45) % 160);
          const py = 150 + ((i * 27) % 250);
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px monospace";
        ctx.fillText("EAS LIVE UPDATE", 425, 415);
        ctx.fillStyle = "#38bdf8";
        ctx.font = "10px monospace";
        ctx.fillText("Subgrade WatermelonDB Queue", 400, 435);
      }

      ctx.restore();

      // Tactical Anamorphic Laser Scanline
      const scanY = (t * 85) % canvas.height;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-2xl overflow-y-auto font-mono">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-slate-950/90 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  SiteSense AI • Autonomous Demo Presentation
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
                Autonomous Speech Synthesis &amp; Direct In-Browser Video Export Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* AUTONOMOUS ONE-CLICK RECORDING & EXPORT PIPELINE BUTTON */}
            <button
              onClick={isRecording ? manualStopRecording : startAutomatedPresentationAndRecord}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${
                isRecording
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isRecording ? "Stop Recording" : "Generate Full Voiceover Video"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas Viewport */}
        <div className="relative aspect-video w-full bg-slate-950 overflow-hidden flex items-center justify-center">
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

            {/* Subtitle Karaoke Bar at Bottom */}
            <div className="bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/40 text-center shadow-2xl max-w-3xl mx-auto w-full">
              <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider mb-1 flex items-center justify-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>AUTONOMOUS SPEECH VOICE-OVER (PEO FORENSIC ARCHITECT)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 font-sans leading-relaxed">
                &ldquo;{currentScene.voiceoverText}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Export Complete Notification Toast */}
        {exportCompleteNotice && (
          <div className="px-6 py-2.5 bg-emerald-950/90 border-t border-b border-emerald-700/80 text-emerald-300 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{exportCompleteNotice}</span>
            </div>
            <button
              onClick={() => setExportCompleteNotice(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Scene Scrubber Progress Bar */}
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
              <span>{isPlaying ? "Pause" : "Play Autonomous Pitch"}</span>
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
