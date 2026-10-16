"use client";

import React from "react";
import {
  Camera,
  Database,
  FileText,
  ShieldCheck,
  Smartphone,
  MapPin,
  CloudRain,
  Building2,
  AlertTriangle,
  ChevronRight,
  Activity,
  Award,
} from "lucide-react";

export type ActiveTab =
  | "scanner"
  | "memory"
  | "workorders"
  | "benchmarks"
  | "expo";

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  criticalAlertCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  criticalAlertCount,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: any; badge?: string }[] = [
    {
      id: "scanner",
      label: "Live Scanner HUD",
      icon: Camera,
      badge: "LIVE",
    },
    {
      id: "memory",
      label: "SurrealDB Memory Graph",
      icon: Database,
      badge: "GRAPH",
    },
    {
      id: "workorders",
      label: "Work Orders & Quotes",
      icon: FileText,
      badge: `${criticalAlertCount} Pending`,
    },
    {
      id: "benchmarks",
      label: "Era by Eon Benchmarks",
      icon: ShieldCheck,
      badge: "99.4%",
    },
    {
      id: "expo",
      label: "Expo Mobile Sync QR",
      icon: Smartphone,
      badge: "SDK 51",
    },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-950/70 backdrop-blur-xl border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 font-mono text-xs">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block">
            Agent Dashboard
          </span>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 font-bold shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        isActive
                          ? "bg-cyan-400 text-slate-950"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Site & Sensor Environmental Telemetry */}
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
            <span className="flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Active Job Site</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>

          <div className="space-y-1 text-slate-300">
            <div className="font-bold text-white text-xs truncate">Toronto Downtown Tower</div>
            <div className="text-slate-400 text-[11px] truncate flex items-center space-x-1">
              <MapPin className="w-3 h-3 text-red-400 shrink-0" />
              <span>180 Spadina Ave, Toronto</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-slate-400">
              <span>Sub-Grade Level:</span>
              <span className="text-cyan-300 font-bold">P2 (-6.4m)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center space-x-1">
                <CloudRain className="w-3 h-3 text-blue-400" />
                <span>Weather / Rain:</span>
              </span>
              <span className="text-amber-400 font-bold">11°C • Surge Risk</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Hydrostatic Press:</span>
              <span className="text-red-400 font-bold">38.5 kPa (High)</span>
            </div>
          </div>
        </div>

        {/* Hackathon Sponsor Accreditations */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-[10px] text-slate-400">
          <div className="font-bold text-slate-300 flex items-center space-x-1.5">
            <Award className="w-3.5 h-3.5 text-yellow-400" />
            <span>Build North Hackathon</span>
          </div>
          <div className="text-[10px] leading-relaxed text-slate-500">
            Hosted by Georgian, Anthropic, Google Cloud, Expo, Clerk, Era by Eon, and SurrealDB.
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-500 space-y-1">
        <div className="flex items-center justify-between">
          <span>Dual-Engine Mesh:</span>
          <span className="text-emerald-400 font-bold">Online</span>
        </div>
        <div className="flex items-center justify-between">
          <span>SurrealDB RPC:</span>
          <span className="text-cyan-400 font-bold">127.0.0.1:8000</span>
        </div>
        <div className="text-[9px] text-slate-600 pt-1 text-center">
          SiteSense AI v1.0.0 • Canadian Spec
        </div>
      </div>
    </aside>
  );
};
