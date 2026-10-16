"use client";

import React, { useState } from "react";
import {
  X,
  Smartphone,
  QrCode,
  Wifi,
  WifiOff,
  Bell,
  RefreshCw,
  Layers,
  Camera,
  CheckCircle2,
  ExternalLink,
  Shield,
  Download,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface ExpoCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpoCompanionModal: React.FC<ExpoCompanionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [offlineMode, setOfflineMode] = useState(false);
  const [pushSent, setPushSent] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState<"camera" | "sync" | "eas">("camera");

  const sendPushNotification = () => {
    setPushSent(true);
    setTimeout(() => setPushSent(false), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-700/60 flex items-center justify-center text-blue-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                  Expo Mobile Companion & Field AR Bridge
                </h3>
                <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-mono font-bold">
                  Track: Best Use of Expo 📱
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Cross-Platform React Native App • EAS Updates • Sub-Grade Offline Sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 font-mono text-xs">
          {/* Left Column: Interactive Mobile Mockup Frame (5 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center">
            {/* Phone Bezel */}
            <div className="w-[280px] h-[520px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col justify-between overflow-hidden">
              {/* Notch / Dynamic Island */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-900 rounded-full flex items-center justify-center z-20">
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/80" />
              </div>

              {/* Mobile Screen Content */}
              <div className="w-full h-full bg-slate-900 rounded-[30px] overflow-hidden flex flex-col relative pt-7">
                {/* Mobile App Header */}
                <div className="px-3 py-2 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between text-[10px]">
                  <span className="font-bold text-white flex items-center space-x-1">
                    <span>🍁 SiteSense</span>
                    <span className="text-[8px] text-blue-400 bg-blue-950 px-1 py-0.2 rounded">EXPO</span>
                  </span>
                  <div className="flex items-center space-x-1 text-slate-400">
                    {offlineMode ? (
                      <WifiOff className="w-3 h-3 text-amber-400" />
                    ) : (
                      <Wifi className="w-3 h-3 text-emerald-400" />
                    )}
                    <span>94%</span>
                  </div>
                </div>

                {/* Mobile Camera Preview / Scan View */}
                <div className="flex-1 relative bg-slate-950 overflow-hidden flex flex-col justify-between p-3">
                  <img
                    src="https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80"
                    alt="Mobile LiDAR Feed"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                  />

                  {/* Mobile AR Laser & Reticle */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-24 h-24 border border-cyan-400/60 rounded-lg flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                    </div>
                  </div>

                  <div className="relative z-10 bg-slate-950/80 backdrop-blur p-2 rounded-lg text-[9px] text-cyan-300 border border-cyan-500/30">
                    <div className="font-bold">LiDAR Point Cloud: 142k pts</div>
                    <div>Crack Width: 0.45&quot; (Critical Delta)</div>
                  </div>

                  {/* Mobile Bottom Control Pill */}
                  <div className="relative z-10 flex items-center justify-between bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-[10px]">
                    <button
                      onClick={() => setOfflineMode(!offlineMode)}
                      className={`px-2 py-1 rounded transition-colors ${
                        offlineMode ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {offlineMode ? "Offline Queue" : "Surreal Live"}
                    </button>
                    <button
                      onClick={sendPushNotification}
                      className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-bold rounded"
                    >
                      Capture AR
                    </button>
                  </div>
                </div>

                {/* Simulated Push Notification Toast */}
                {pushSent && (
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-9 left-2 right-2 bg-slate-950/95 border border-cyan-500/70 p-2 rounded-xl text-[9px] shadow-xl z-30"
                  >
                    <div className="flex items-center space-x-1.5 text-cyan-400 font-bold">
                      <Bell className="w-3 h-3" />
                      <span>EAS Push: Work Order #8842</span>
                    </div>
                    <p className="text-slate-300 text-[8px] mt-0.5">
                      Critical crack alert synced to Lead Structural Inspector Marcus Vance.
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">
              React Native Expo Client (iOS & Android)
            </p>
          </div>

          {/* Right Column: Technical Specs & QR Deployment (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Live EAS Deployment Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-bold text-xs uppercase tracking-wide flex items-center space-x-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Expo Application Services (EAS) Status</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                  EAS Update: Live
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 block text-[10px]">EAS Channel:</span>
                  <span className="text-white font-bold">production-canada-east</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Runtime Version:</span>
                  <span className="text-white font-bold">1.0.0 (SDK 51)</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Offline Engine:</span>
                  <span className="text-cyan-300 font-bold">WatermelonDB + Surreal RPC</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Native Sensors:</span>
                  <span className="text-emerald-300 font-bold">ARKit / ARCore LiDAR Mesh</span>
                </div>
              </div>
            </div>

            {/* Live QR Code Box */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center space-x-4">
              <div className="w-24 h-24 bg-white p-2 rounded-xl shrink-0 flex items-center justify-center">
                {/* SVG QR Code Simulation */}
                <svg className="w-full h-full text-slate-950" viewBox="0 0 100 100">
                  <path
                    fill="currentColor"
                    d="M0 0h30v30H0zm40 0h20v10H40zm30 0h30v30H70zM10 10h10v10H10zm70 10h10v10H80zM0 40h10v20H0zm20 0h20v10H20zm30 0h10v30H50zm30 0h20v20H80zM0 70h30v30H0zm10 10h10v10H10zm30 0h10v20H40zm20 0h10v10H60zm20 0h20v20H80zm-10 10h10v10H70z"
                  />
                </svg>
              </div>

              <div className="space-y-1">
                <span className="text-white font-bold text-xs block">
                  Scan to Test on Expo Go
                </span>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  Scan this QR code with your iOS Camera or Android Expo Go app to launch SiteSense Mobile instantly on physical hardware.
                </p>
                <div className="pt-1 text-[10px] text-cyan-400">
                  exp://u.expo.dev/update/sitesense-ai-canada-2026
                </div>
              </div>
            </div>

            {/* Offline-First Architecture Callout */}
            <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-800/40 space-y-1 text-[11px]">
              <span className="text-blue-300 font-bold flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Sub-Grade P2/P3 Offline Synchronization</span>
              </span>
              <p className="text-slate-300 font-sans leading-relaxed text-[11px]">
                Canadian construction sites and high-rise basements frequently lack cellular reception. SiteSense AI uses an offline-first sync queue: inspectors record scans and voice memos offline, and the app automatically synchronizes with the SurrealDB graph memory once back at ground level.
              </p>
            </div>

            {/* Trigger Notification Button */}
            <button
              onClick={sendPushNotification}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 font-mono"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Simulate Instant EAS Push Notification</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
