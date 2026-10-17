"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Plane,
  Sun,
  Activity,
  Compass,
  Search,
  Filter,
  Layers,
  Maximize2,
  Play,
  Bell,
  User,
  ExternalLink,
  FileText,
  Database,
  Sparkles,
  ChevronRight,
  Plus,
  Download,
  RefreshCw,
  Eye,
  Zap,
  Cloud,
  CheckCircle2,
  Clock,
  Edit2,
  FolderOpen,
  Save,
  Printer,
  Shield,
  Radio,
  Sliders,
  Check,
  Smartphone,
  ChevronDown,
  Camera,
  Video,
  Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { CameraHUD, SITE_PRESETS, PresetSite } from "@/components/CameraHUD";
import { WorkOrderPrintModal } from "@/components/WorkOrderPrintModal";
import { PartnerStackModal, PartnerKey } from "@/components/PartnerStackModal";
import { ExpoCompanionModal } from "@/components/ExpoCompanionModal";
import { EonBenchmarkModal } from "@/components/EonBenchmarkModal";
import { CinematicDemoModal } from "@/components/CinematicDemoModal";
import { InspectionResult, UserRole } from "@/lib/types";
import { Film } from "lucide-react";

export default function Home() {
  // Navigation & Viewport State
  const [activeNavTab, setActiveNavTab] = useState<string>("Dashboard");
  const [activeLeftTab, setActiveLeftTab] = useState<string>("AI Analysis");
  const [viewportMode, setViewportMode] = useState<"camera" | "satellite" | "map" | "terrain">("camera");
  const [logFilter, setLogFilter] = useState<string>("All Logs");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Modals State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [activePartnerModal, setActivePartnerModal] = useState<PartnerKey>(null);
  const [isExpoModalOpen, setIsExpoModalOpen] = useState<boolean>(false);
  const [isEonModalOpen, setIsEonModalOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);

  // Role State
  const [currentRole, setCurrentRole] = useState<UserRole>("Lead Structural Inspector");
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState<boolean>(false);

  // Autonomous Demo Pipeline Hook & URL Trigger
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__OPEN_DEMO_MODAL__ = () => setIsDemoModalOpen(true);
      if (window.location.search.includes("autoDemo=1")) {
        setIsDemoModalOpen(true);
      }
    }
  }, []);

  // Active Inspection & Work-Order Data
  const [currentInspection, setCurrentInspection] = useState<InspectionResult>({
    zone: "Basement Foundation Wall - East Bay B-4",
    severity: "MODERATE",
    memoryDelta:
      "SurrealDB Temporal Audit: Baseline crack width 0.05\" stabilized. Ground moisture measured at 14.8%. Structural shear risks remain within acceptable tolerance threshold.",
    technicalDiagnosis:
      "Concrete compressive matrix intact (>32 MPa). Minor micro-fracture stabilized at 0.05 inches with zero active water egress. Minor calcite efflorescence along cold-joint boundary.",
    ontarioCodeReference:
      "Ontario Building Code (OBC) Part 4.1.8 & CSA A23.3 (Concrete Structural Integrity)",
    eonConfidenceScore: 0.994,
    lineItemQuote: [
      { item: "Baseline Preventive Polyurethane Sealant", costCAD: 680 },
      { item: "Sub-Grade Hydrostatic Pressure Relief Monitoring", costCAD: 450 },
      { item: "P.Eng Site Inspection & Seal Sign-Off", costCAD: 850 },
    ],
    totalEstimatedCostCAD: 1980,
    recommendedContractorAction:
      "Site clear for trade contractor dispatch. Apply preventative elastomeric seal along cold joint.",
    modelUsed: "Nebius AI (Qwen2-VL-72B) + Eon Guardrails",
    fallbackTriggered: false,
    latencyMs: 742,
  });

  // Right Column Live Webcam State & Ref
  const rightVideoRef = useRef<HTMLVideoElement>(null);
  const rightStreamRef = useRef<MediaStream | null>(null);
  const [isRightWebcamActive, setIsRightWebcamActive] = useState<boolean>(false);
  const [webcamNotice, setWebcamNotice] = useState<string | null>(null);

  // Start / Toggle Webcam on Right Column
  const toggleRightWebcam = async () => {
    if (isRightWebcamActive) {
      if (rightStreamRef.current) {
        rightStreamRef.current.getTracks().forEach((track) => track.stop());
        rightStreamRef.current = null;
      }
      if (rightVideoRef.current) {
        rightVideoRef.current.srcObject = null;
      }
      setIsRightWebcamActive(false);
      setWebcamNotice(null);
    } else {
      try {
        setWebcamNotice("Requesting camera access...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        rightStreamRef.current = stream;
        if (rightVideoRef.current) {
          rightVideoRef.current.srcObject = stream;
          rightVideoRef.current.play();
        }
        setIsRightWebcamActive(true);
        setWebcamNotice("Live optical stream connected.");
      } catch (err: any) {
        console.warn("Webcam access error:", err);
        setWebcamNotice("Camera permission denied. High-definition construction stream active.");
        setIsRightWebcamActive(false);
      }
    }
  };

  // Capture Snapshot from the Right Video Stream
  const captureRightSnapshot = () => {
    if (rightVideoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = rightVideoRef.current.videoWidth || 640;
      canvas.height = rightVideoRef.current.videoHeight || 360;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(rightVideoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.85);
        handleScan({
          image: base64,
          zoneName: currentInspection.zone,
          voiceNotes: "Live webcam snapshot captured from auxiliary feed CAM-01.",
          presetId: "webcam_snapshot",
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      if (rightStreamRef.current) {
        rightStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Mission Logs Data
  const missionLogs = [
    {
      time: "01:32",
      title: "Data Ingestion Complete",
      description: "Satellite high-resolution imagery and LiDAR point cloud mesh loaded successfully.",
      status: "Success",
      type: "System",
    },
    {
      time: "01:31",
      title: "OBC & Environmental Data Fetched",
      description: "Toronto building metrics, hydrostatic loads, and precipitation models updated.",
      status: "Success",
      type: "Moisture",
    },
    {
      time: "01:30",
      title: "Sensor Telemetry Check",
      description: "Zero optical or thermal anomalies detected in optical sensor stream.",
      status: "Success",
      type: "Structural",
    },
    {
      time: "01:28",
      title: "Risk Analysis Completed",
      description: "AI analysis finished with overall composite score: 0.27 / 1.0 (Low Risk).",
      status: "Success",
      type: "Analysis",
    },
    {
      time: "01:27",
      title: "Sub-Grade Moisture Detected",
      description: "P2 basement footing joint indicates 14.8% moisture (within safe tolerance).",
      status: "Warning",
      type: "Moisture",
    },
    {
      time: "01:25",
      title: "Mission Created",
      description: "SCANNER-017 inspection waypoint route initialized (East Footing -> West Sump).",
      status: "Success",
      type: "System",
    },
  ];

  const filteredLogs = missionLogs.filter((log) => {
    const matchesFilter = logFilter === "All Logs" || log.type.toLowerCase() === logFilter.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Re-run AI Analysis Handler
  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 900);
  };

  // Scan handler
  const handleScan = async (payload: {
    image: string;
    zoneName: string;
    voiceNotes: string;
    presetId: string;
  }) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: payload.image,
          zoneName: payload.zoneName,
          userVoiceNotes: payload.voiceNotes,
          selectedPresetId: payload.presetId,
          role: currentRole,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentInspection(data);
      }
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    } catch (err) {
      console.warn("Scan failed, fallback preserved.", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* =================================================================
          TOP NAVIGATION BAR (Pixel-Perfect AeroOps Style)
         ================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-[#070d18]/90 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Tagline */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1.5px] shadow-[0_0_18px_rgba(6,182,212,0.35)] flex items-center justify-center">
              <div className="w-full h-full bg-[#080e1a] rounded-[10px] flex items-center justify-center">
                <span className="text-xl">🍁</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-black tracking-tight text-white font-mono">
                  SiteSense AI
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono">
                  AEROMESH v3.2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Autonomous Spatial Inspection &amp; Memory Agent
              </p>
            </div>
          </div>

          {/* Center Navigation Pills */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80 text-xs font-mono">
            {["Dashboard", "Analysis", "Reports", "SurrealDB Logs", "Settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveNavTab(tab)}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  activeNavTab === tab
                    ? "bg-cyan-500 text-slate-950 shadow-md font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {/* Right Section: System Online, Notification, Profile */}
          <div className="flex items-center space-x-3">
            {/* 4K Cinematic Demo Trigger Button */}
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-slate-950 font-black text-xs transition-all shadow-[0_0_18px_rgba(6,182,212,0.45)] hover:scale-105 font-mono"
              title="Watch Automated 4K Interactive Demo Pitch"
            >
              <Film className="w-3.5 h-3.5 text-slate-950" />
              <span>🎬 4K AI Pitch Video</span>
            </button>

            {/* System Online Badge */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-semibold hidden sm:inline">System Online</span>
            </div>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => setIsEonModalOpen(true)}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
              title="3 Active Guardrail Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-black flex items-center justify-center shadow">
                3
              </span>
            </button>

            {/* User Profile Pill / Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all text-xs font-mono"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
                  FI
                </div>
                <div className="text-left hidden lg:block">
                  <div className="font-bold text-white leading-tight">Fokrul Islam</div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Administrator / Lead Inspector
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Role Dropdown */}
              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 font-mono text-xs space-y-1">
                  <div className="px-3 py-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Clerk B2B Enterprise Role</span>
                    <span className="text-cyan-400 font-bold">Active</span>
                  </div>

                  {[
                    "Lead Structural Inspector",
                    "General Contractor",
                    "Client Read-Only View",
                  ].map((roleOption) => (
                    <button
                      key={roleOption}
                      onClick={() => {
                        setCurrentRole(roleOption as UserRole);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between ${
                        currentRole === roleOption
                          ? "bg-cyan-950/70 border border-cyan-500/50 text-white"
                          : "hover:bg-slate-800/80 text-slate-300"
                      }`}
                    >
                      <span className="font-semibold">{roleOption}</span>
                      {currentRole === roleOption && <Check className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =================================================================
          MAIN COMMAND CENTER 3-COLUMN LAYOUT
         ================================================================= */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-4 sm:p-5 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ===============================================================
            COLUMN 1: LEFT (Mission Control & Quick Access) [2.8 Cols]
           =============================================================== */}
        <aside className="lg:col-span-3 xl:col-span-2 space-y-4 font-mono text-xs">
          {/* Mission Control Nav Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block">
              MISSION CONTROL
            </span>

            {/* 4K Cinematic Demo Launcher Card */}
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 to-cyan-950/60 border border-purple-700/60 hover:border-cyan-400 text-left transition-all group shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-slate-950 font-bold shadow">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-white group-hover:text-cyan-300">4K Cinematic Demo</div>
                  <div className="text-[9px] text-slate-400">Automated 6-Part Pitch</div>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            </button>

            <div className="space-y-1">
              {[
                { name: "AI Analysis", icon: Activity, active: true },
                { name: "Data Ingestion", icon: Database, active: false },
                { name: "Site / Mission Setup", icon: Sliders, active: false },
                { name: "Risk & Shear Engine", icon: AlertTriangle, active: false },
                { name: "OBC & RSMeans Matrix", icon: Cloud, active: false },
                { name: "Reports", icon: FileText, active: false },
                { name: "Audit Logs", icon: Clock, active: false },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = activeLeftTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveLeftTab(item.name)}
                    className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl transition-all ${
                      isSelected
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 font-bold shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                    <span className="truncate">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Access Section */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl space-y-2.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block">
              QUICK ACCESS
            </span>

            <div className="space-y-2">
              <button
                onClick={() => setActivePartnerModal("surrealdb")}
                className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-300 group-hover:text-cyan-300">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-3.5 h-3.5 text-blue-400" />
                    <span className="font-semibold text-[11px]">RSMeans / OBC Live Data</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => setIsEonModalOpen(true)}
                className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-300 group-hover:text-amber-300">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-semibold text-[11px]">Hazard Check - Shear Warning</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-slate-300 group-hover:text-emerald-300">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-semibold text-[11px]">Risk Summary - MODERATE</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Cyberpunk Promo Graphic Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-[#0b1324] border border-cyan-900/40 shadow-2xl relative overflow-hidden space-y-3">
            {/* Cyberpunk City/Drone Graphic */}
            <div className="relative h-28 w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-cyan-800/40">
              <svg className="w-full h-full" viewBox="0 0 240 120">
                <defs>
                  <linearGradient id="cyberSky" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#081024" />
                    <stop offset="100%" stopColor="#030712" />
                  </linearGradient>
                </defs>
                <rect width="240" height="120" fill="url(#cyberSky)" />
                <rect x="20" y="60" width="25" height="60" fill="#0f172a" />
                <rect x="50" y="40" width="35" height="80" fill="#1e293b" />
                <rect x="90" y="25" width="40" height="95" fill="#0f172a" />
                <rect x="135" y="50" width="30" height="70" fill="#1e293b" />
                <rect x="170" y="35" width="45" height="85" fill="#0f172a" />
                <circle cx="65" cy="55" r="1.5" fill="#06b6d4" />
                <circle cx="75" cy="70" r="1.5" fill="#06b6d4" />
                <circle cx="105" cy="40" r="1.5" fill="#38bdf8" />
                <circle cx="115" cy="55" r="1.5" fill="#38bdf8" />
                <circle cx="120" cy="30" r="14" fill="none" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3,2" />
                <circle cx="120" cy="30" r="2.5" fill="#06b6d4" />
                <line x1="120" y1="30" x2="60" y2="85" stroke="#06b6d4" strokeWidth="0.8" opacity="0.4" />
                <line x1="120" y1="30" x2="180" y2="70" stroke="#06b6d4" strokeWidth="0.8" opacity="0.4" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="font-bold text-white text-xs">Safe Structures. Smarter Decisions.</div>
              <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                AI-powered autonomous spatial memory for Canadian construction &amp; infrastructure.
              </p>
            </div>
          </div>
        </aside>

        {/* ===============================================================
            COLUMN 2: MIDDLE (Command Center & Tactical Viewport) [6.2 Cols]
           =============================================================== */}
        <section className="lg:col-span-6 xl:col-span-7 space-y-4 font-mono text-xs">
          {/* Header Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  Pre-Inspection Dispatch Analysis
                </h1>
                <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Autonomous Inspection Unit • Toronto Downtown Tower - Sub-Grade P2 • 2026-10-17 01:34
              </p>
            </div>

            {/* Big Green GO Badge */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500 text-emerald-300 font-bold text-xs transition-all shadow-[0_0_15px_rgba(16,185,129,0.25)]"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>GO - Dispatch Decision ↻</span>
              </button>
            </div>
          </div>

          {/* Risk Metric Grid (4 Cards + 1 Radial Score) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {/* Card 1: Total Risks */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">Total Risks</span>
              <div className="flex items-baseline space-x-1">
                <span className="text-xl font-black text-white">2</span>
                <span className="text-[10px] text-slate-400">(0 Critical)</span>
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-red-400 font-semibold">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span>Active Watch</span>
              </div>
            </div>

            {/* Card 2: Moisture Risk */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">Moisture Risk</span>
              <div className="text-xl font-black text-emerald-400">Low</div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                <Sun className="w-3 h-3 text-amber-400" />
                <span>0.2 / 1.0</span>
              </div>
            </div>

            {/* Card 3: Airspace / Atmospheric */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">Atmospheric</span>
              <div className="text-xl font-black text-emerald-400">Low</div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                <Plane className="w-3 h-3 text-cyan-400" />
                <span>0.1 / 1.0</span>
              </div>
            </div>

            {/* Card 4: Ground / Shear Risk */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow space-y-1">
              <span className="text-[10px] text-slate-400 block uppercase">Ground / Shear</span>
              <div className="text-xl font-black text-amber-400">Moderate</div>
              <div className="flex items-center space-x-1 text-[10px] text-amber-300/80">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                <span>0.4 / 1.0</span>
              </div>
            </div>

            {/* Card 5: Radial Score Gauge (0.27 / 1.0) */}
            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 shadow flex flex-col items-center justify-center text-center">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-cyan-400"
                    strokeDasharray="27, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute font-black text-xs text-white">0.27</div>
              </div>
              <span className="text-[9px] text-emerald-400 font-bold mt-1">LOW RISK (0.27)</span>
            </div>
          </div>

          {/* MAIN CENTRAL TACTICAL VIEWPORT */}
          <div className="rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col">
            {/* Viewport Top Bar */}
            <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
              {/* Left View Toggles (Including active Camera HUD Tab!) */}
              <div className="flex items-center space-x-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
                <button
                  onClick={() => setViewportMode("camera")}
                  className={`flex items-center space-x-1 px-3 py-1 rounded transition-colors ${
                    viewportMode === "camera"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>📷 Camera HUD</span>
                </button>
                <button
                  onClick={() => setViewportMode("satellite")}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewportMode === "satellite"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Satellite
                </button>
                <button
                  onClick={() => setViewportMode("map")}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewportMode === "map"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Map / CAD
                </button>
                <button
                  onClick={() => setViewportMode("terrain")}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewportMode === "terrain"
                      ? "bg-cyan-500 text-slate-950 font-bold shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Terrain / LiDAR
                </button>
              </div>

              {/* Right Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 10, 160))}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 10, 80))}
                  className="px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
                  title="Zoom Out"
                >
                  -
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                  title="Reset Center"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Viewport Content: Switches seamlessly between Camera HUD and Tactical Map */}
            {viewportMode === "camera" ? (
              /* ACTIVE FULL-SIZE CAMERA HUD VIEWPORT */
              <div className="w-full">
                <CameraHUD
                  onScan={handleScan}
                  onPresetChange={(preset) => {
                    setCurrentInspection((prev) => ({
                      ...prev,
                      zone: preset.zone,
                      severity: preset.defaultSeverity,
                    }));
                  }}
                  isAnalyzing={isAnalyzing}
                  activeZone={currentInspection.zone}
                />
              </div>
            ) : (
              /* TACTICAL SATELLITE / MAP CANVAS */
              <div className="relative h-[340px] sm:h-[400px] w-full bg-[#08111e] overflow-hidden select-none">
                <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <pattern
                      id="diagonalDangerHatch"
                      width="12"
                      height="12"
                      patternTransform="rotate(45 0 0)"
                      patternUnits="userSpaceOnUse"
                    >
                      <line x1="0" y1="0" x2="0" y2="12" stroke="#ef4444" strokeWidth="2.5" opacity="0.65" />
                    </pattern>
                    <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="40" y2="0" stroke="#06b6d4" strokeWidth="0.5" opacity="0.15" />
                      <line x1="0" y1="0" x2="0" y2="40" stroke="#06b6d4" strokeWidth="0.5" opacity="0.15" />
                    </pattern>
                    <radialGradient id="satelliteGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#0f213d" />
                      <stop offset="100%" stopColor="#060c16" />
                    </radialGradient>
                  </defs>

                  <rect width="1000" height="500" fill="url(#satelliteGlow)" />
                  <rect width="1000" height="500" fill="url(#tacticalGrid)" />

                  <rect
                    x="140"
                    y="80"
                    width="720"
                    height="340"
                    fill="#0c1729"
                    stroke="#1e3a5f"
                    strokeWidth="2"
                    rx="6"
                    opacity="0.8"
                  />

                  <line x1="140" y1="250" x2="860" y2="250" stroke="#1e3a5f" strokeWidth="3" strokeDasharray="8,6" />
                  <line x1="420" y1="80" x2="420" y2="420" stroke="#1e3a5f" strokeWidth="3" strokeDasharray="8,6" />
                  <line x1="680" y1="80" x2="680" y2="420" stroke="#1e3a5f" strokeWidth="3" strokeDasharray="8,6" />

                  {/* Restricted Hazard Polygon */}
                  <polygon
                    points="260,140 450,140 490,260 290,290"
                    fill="url(#diagonalDangerHatch)"
                    stroke="#ef4444"
                    strokeWidth="2"
                  />
                  <rect x="270" y="150" width="180" height="22" fill="#0b1120" rx="3" opacity="0.9" />
                  <text x="278" y="165" fill="#f87171" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    RESTRICTED SHEAR ZONE (CSA)
                  </text>

                  {/* Flight Path */}
                  <path
                    d="M 180,360 L 320,340 L 520,380 L 720,320 L 800,180 L 640,160 L 520,220"
                    stroke="#06b6d4"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    fill="none"
                  />

                  <circle cx="180" cy="360" r="4" fill="#06b6d4" />
                  <text x="175" y="380" fill="#38bdf8" fontSize="9" fontFamily="monospace">WP-01</text>
                  <circle cx="320" cy="340" r="4" fill="#06b6d4" />
                  <text x="315" y="360" fill="#38bdf8" fontSize="9" fontFamily="monospace">WP-02</text>
                  <circle cx="520" cy="380" r="4" fill="#06b6d4" />
                  <text x="515" y="400" fill="#38bdf8" fontSize="9" fontFamily="monospace">WP-03</text>
                  <circle cx="720" cy="320" r="4" fill="#06b6d4" />
                  <text x="715" y="340" fill="#38bdf8" fontSize="9" fontFamily="monospace">WP-04</text>

                  {/* POI Markers */}
                  <g transform="translate(790, 170)">
                    <circle cx="10" cy="10" r="14" fill="#3b82f6" opacity="0.25" />
                    <circle cx="10" cy="10" r="6" fill="#3b82f6" />
                    <text x="24" y="14" fill="#93c5fd" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      POI-A: Water Sump
                    </text>
                  </g>

                  <g transform="translate(630, 150)">
                    <circle cx="10" cy="10" r="14" fill="#f59e0b" opacity="0.25" />
                    <circle cx="10" cy="10" r="6" fill="#f59e0b" />
                    <text x="24" y="14" fill="#fde68a" fontSize="10" fontWeight="bold" fontFamily="monospace">
                      POI-B: 600V Vault
                    </text>
                  </g>

                  {/* Drone Marker */}
                  <g transform="translate(520, 220)">
                    <circle cx="0" cy="0" r="32" fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" opacity="0.4" />
                    <circle cx="0" cy="0" r="18" fill="none" stroke="#10b981" strokeWidth="1.5" opacity="0.7" />
                    <circle cx="0" cy="0" r="6" fill="#10b981" />
                    <rect x="12" y="-12" width="94" height="20" fill="#060c18" rx="4" stroke="#10b981" strokeWidth="1" />
                    <text x="18" y="2" fill="#34d399" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      SCANNER-017
                    </text>
                  </g>
                </svg>

                {/* Compass Rose */}
                <div className="absolute top-4 right-4 bg-slate-950/80 border border-slate-800 p-2 rounded-xl text-center backdrop-blur">
                  <div className="w-8 h-8 relative flex items-center justify-center">
                    <span className="absolute top-0 text-[9px] font-black text-cyan-400">N</span>
                    <span className="absolute bottom-0 text-[8px] text-slate-500">S</span>
                    <span className="absolute left-0 text-[8px] text-slate-500">W</span>
                    <span className="absolute right-0 text-[8px] text-slate-500">E</span>
                    <Compass className="w-4 h-4 text-slate-400 animate-spin" style={{ animationDuration: "30s" }} />
                  </div>
                </div>

                {/* Bottom Legend */}
                <div className="absolute bottom-3 left-3 bg-slate-950/85 border border-slate-800 p-2.5 rounded-xl backdrop-blur flex flex-wrap gap-3 text-[10px] text-slate-300">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-0.5 bg-cyan-400" />
                    <span>Flight Path</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-red-500/40 border border-red-500 rounded-sm" />
                    <span>Restricted Danger Area</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>POI Station</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Scanner Drone</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Bar */}
            <div className="p-3 bg-slate-950 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => alert("Mission plan synchronized with SurrealDB Spatial Graph.")}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Mission</span>
                </button>
                <button
                  onClick={() => alert("Plan #2026-CA loaded from SurrealDB memory.")}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Load Plan</span>
                </button>
                <button
                  onClick={() => alert("Waypoint trajectory saved.")}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>

              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Work-Order</span>
              </button>
            </div>
          </div>

          {/* BOTTOM SECTION: MISSION LOG & ANALYSIS */}
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Mission Log &amp; Analysis
              </h3>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {["All Logs", "Analysis", "Structural", "Moisture", "System"].map((filt) => (
                <button
                  key={filt}
                  onClick={() => setLogFilter(filt)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    logFilter === filt
                      ? "bg-cyan-500 text-slate-950 font-bold"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {filt}
                </button>
              ))}
            </div>

            <div className="divide-y divide-slate-800/70">
              {filteredLogs.map((log, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-950/40 px-2 rounded-lg transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-slate-500 text-[11px] font-bold shrink-0">{log.time}</span>
                    <div>
                      <div className="font-bold text-slate-200 text-xs">{log.title}</div>
                      <div className="text-[11px] text-slate-400 font-sans">{log.description}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      log.status === "Success"
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                        : "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===============================================================
            COLUMN 3: RIGHT (AI Intelligence & Live Optical Stream) [3.2 Cols]
           =============================================================== */}
        <div className="lg:col-span-3 space-y-4 font-mono text-xs">
          {/* Top Card: AI Analysis & Explanation */}
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wide">
                AI Analysis &amp; Explanation
              </h3>
              <span className="px-2 py-0.5 rounded text-[9px] bg-purple-950 text-purple-300 border border-purple-800 font-bold flex items-center space-x-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                <span>Nebius + Eon</span>
              </span>
            </div>

            {/* Big Green Decision Banner */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-700/60 space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-black text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Dispatch Decision: GO</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                All critical risks are within acceptable limits. Site is clear for contractor dispatch.
              </p>
            </div>

            {/* Risk Breakdown Progress Bars */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Risk Breakdown
              </span>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Weather Risk:</span>
                  <span className="text-emerald-400 font-bold">Low (0.2)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[20%] h-full bg-emerald-400" />
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Shear Fracture:</span>
                  <span className="text-emerald-400 font-bold">Low (0.1)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[10%] h-full bg-emerald-400" />
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Ground Pressure:</span>
                  <span className="text-amber-400 font-bold">Moderate (0.4)</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[40%] h-full bg-amber-400" />
                </div>

                <div className="flex justify-between pt-1 font-bold">
                  <span className="text-slate-200">Composite Score:</span>
                  <span className="text-cyan-400">0.27 / 1.0</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="w-[27%] h-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
                </div>
              </div>
            </div>

            {/* Key Factors Checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Key Factors
              </span>

              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Core Strength: Compressive &gt;30 MPa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Building Code: No OBC Part 4 violations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Hydrostatic: Below capillary breach</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Reinforcement: Rebar bonding intact</span>
                </div>
              </div>
            </div>

            {/* AI Explanation Rich Quote */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                AI Explanation (Nebius / Eon Guardrails)
              </span>
              <p className="text-[11px] text-slate-300 font-sans italic leading-relaxed">
                &ldquo;Structural conditions are favorable with zero dynamic load shifts. SurrealDB historical delta shows crack width stable at 0.05 inches with no active water egress. Minor surface efflorescence detected at footing.&rdquo;
              </p>
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1 pt-1"
              >
                <span>View Full Forensic Analysis</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Glowing Gradient Action Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(59,130,246,0.35)] flex items-center justify-center space-x-2"
            >
              <Zap className={`w-4 h-4 ${isAnalyzing ? "animate-spin" : ""}`} />
              <span>{isAnalyzing ? "Computing Inference..." : "⚡ Run Analysis"}</span>
            </button>
          </div>

          {/* Bottom Card: Live Feed • Live (HTML5 Video & Real Webcam Streaming) */}
          <div className="p-4 rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Live Feed
                </span>
                <span className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live</span>
                </span>
              </div>
              <button
                onClick={toggleRightWebcam}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
              >
                <span>{isRightWebcamActive ? "Stop Stream" : "Switch Source"}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* 16:9 Real HTML5 Video Container & Real Webcam Feed */}
            <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center group shadow-inner">
              {/* HTML5 Live Video Element */}
              <video
                ref={rightVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!isRightWebcamActive ? "hidden" : "block"}`}
              />

              {/* High-Resolution Construction Fallback Stream when Webcam Inactive */}
              {!isRightWebcamActive && (
                <div className="relative w-full h-full">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover filter contrast-105"
                    poster="https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80"
                  >
                    <source
                      src="https://assets.mixkit.co/videos/preview/mixkit-construction-site-building-a-house-41381-large.mp4"
                      type="video/mp4"
                    />
                  </video>
                  {/* Subtle dark gradient overlay */}
                  <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[0.5px]" />
                </div>
              )}

              {/* Optical Targeting Crosshairs Overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-16 h-16 border border-cyan-400/50 rounded-full" />
                </div>
              </div>

              {/* Live Overlay Tags */}
              <div className="absolute top-2 left-2 bg-slate-950/85 text-[9px] text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60 font-mono">
                {isRightWebcamActive ? "🔴 LIVE WEBCAM (CAM-01)" : "CAM-01 • Sub-Grade P2"}
              </div>
              <div className="absolute top-2 right-2 bg-slate-950/85 text-[9px] text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800 font-bold">
                1080p 60FPS
              </div>

              {/* Center "Turn on Webcam" Prompt Pill when Webcam is Inactive */}
              {!isRightWebcamActive && (
                <button
                  onClick={toggleRightWebcam}
                  className="absolute inset-0 m-auto w-44 h-10 rounded-xl bg-cyan-500/95 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-2xl transition-all hover:scale-105 z-20"
                >
                  <Camera className="w-4 h-4" />
                  <span>Turn on Live Webcam</span>
                </button>
              )}

              {/* Snapshot and Stop Controls when Live Webcam is Active */}
              {isRightWebcamActive && (
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-20">
                  <button
                    onClick={captureRightSnapshot}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] flex items-center space-x-1 shadow-lg transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Capture Snapshot</span>
                  </button>
                  <button
                    onClick={toggleRightWebcam}
                    className="px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] transition-colors shadow"
                  >
                    <span>Stop Camera</span>
                  </button>
                </div>
              )}
            </div>

            {/* Webcam Notice feedback */}
            {webcamNotice && (
              <div className="text-[10px] text-cyan-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {webcamNotice}
              </div>
            )}

            {/* Mission Details Table */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                <span>Mission Details</span>
                <button
                  onClick={() => alert("Mission parameters editor opened.")}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
                >
                  <Edit2 className="w-2.5 h-2.5" />
                  <span>Edit</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Mission ID:</span>
                  <span className="font-bold text-white">SCANNER-017</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Inspect Time:</span>
                  <span className="font-bold text-cyan-300">12 min (Est.)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Unit Sensor:</span>
                  <span className="font-bold text-white">Autonomous Quad</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Battery:</span>
                  <span className="font-bold text-emerald-400">78%</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Destination:</span>
                  <span className="font-bold text-slate-200 truncate block">East Foundation Bay</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Wind / Vibe:</span>
                  <span className="font-bold text-slate-200">6 kt (W)</span>
                </div>
              </div>
            </div>

            {/* Final Status Banner */}
            <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-700/60 text-[10px] text-emerald-300 flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                All systems nominal. Ready for dispatch. AI spatial analysis complete. No critical risks detected.
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* =================================================================
          GLOBAL MODALS (Print, Partner Proofs, Expo Mobile, Eon Benchmarks)
         ================================================================= */}
      <WorkOrderPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        inspection={currentInspection}
        role={currentRole}
      />

      <PartnerStackModal
        activePartner={activePartnerModal}
        onClose={() => setActivePartnerModal(null)}
      />

      <ExpoCompanionModal
        isOpen={isExpoModalOpen}
        onClose={() => setIsExpoModalOpen(false)}
      />

      <EonBenchmarkModal
        isOpen={isEonModalOpen}
        onClose={() => setIsEonModalOpen(false)}
      />

      <CinematicDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
