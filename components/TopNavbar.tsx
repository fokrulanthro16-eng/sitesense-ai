"use client";

import React, { useState } from "react";
import {
  Shield,
  Layers,
  ChevronDown,
  User,
  Check,
  Building2,
  ExternalLink,
  Smartphone,
  Database,
  Cpu,
  Key,
  Bell,
} from "lucide-react";
import { UserRole } from "@/lib/types";
import { PartnerKey } from "./PartnerStackModal";

interface TopNavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenPartnerModal: (partner: PartnerKey) => void;
  onOpenExpoModal: () => void;
  onOpenEonModal: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentRole,
  onRoleChange,
  onOpenPartnerModal,
  onOpenExpoModal,
  onOpenEonModal,
}) => {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; title: string; subtitle: string; badge: string }[] = [
    {
      role: "Lead Structural Inspector",
      title: "Dr. Marcus Vance, P.Eng",
      subtitle: "Full Forensic Inspection & PEO Sign-Off",
      badge: "PEO Lic #100849204",
    },
    {
      role: "General Contractor",
      title: "Greg Kowalski (EllisDon)",
      subtitle: "Work-Order Quoting & Subcontractor Dispatch",
      badge: "General Contractor GTA",
    },
    {
      role: "Client Read-Only View",
      title: "Oxford Properties Asset Mgr",
      subtitle: "Capital Approval & Risk Dashboard",
      badge: "Owner / Tenant",
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-rose-500 to-red-700 shadow-[0_0_15px_rgba(239,68,68,0.4)] text-white text-xl">
            🍁
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-black tracking-tight text-white font-mono">
                SiteSense AI
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-red-950 text-red-300 border border-red-800">
                Canada 🍁
              </span>
            </div>
            <p className="text-[10px] text-cyan-400 font-mono hidden sm:block">
              Autonomous Spatial Inspection & Memory Agent
            </p>
          </div>
        </div>

        {/* Interactive Partner Stack Pills */}
        <div className="hidden xl:flex items-center space-x-2 font-mono text-[11px]">
          <button
            onClick={() => onOpenPartnerModal("expo")}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/60 transition-all hover:scale-105"
            title="Click for Expo Mobile Architecture Proof"
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>[Expo Mobile Ready]</span>
          </button>

          <button
            onClick={() => onOpenPartnerModal("clerk")}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 transition-all hover:scale-105"
            title="Click for Clerk B2B Auth Architecture Proof"
          >
            <Key className="w-3.5 h-3.5 text-indigo-400" />
            <span>[Clerk B2B Auth]</span>
          </button>

          <button
            onClick={() => onOpenPartnerModal("surrealdb")}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-pink-950/60 hover:bg-pink-900/60 text-pink-300 border border-pink-800/60 transition-all hover:scale-105"
            title="Click for SurrealDB Graph Memory Proof"
          >
            <Database className="w-3.5 h-3.5 text-pink-400" />
            <span>[SurrealDB Graph Memory]</span>
          </button>

          <button
            onClick={() => onOpenPartnerModal("eon")}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 transition-all hover:scale-105"
            title="Click for Era by Eon Guardrail Verification"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>[Era by Eon: 99.4%]</span>
          </button>

          <button
            onClick={() => onOpenPartnerModal("nebius")}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/60 transition-all hover:scale-105"
            title="Click for Nebius Studio & HF Vision Details"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>[Nebius + HF Vision]</span>
          </button>
        </div>

        {/* Right Section: Clerk Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all"
          >
            {/* User Profile Avatar */}
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow">
              MV
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900" />
            </div>

            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white leading-tight font-mono truncate max-w-[140px]">
                {currentRole}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight truncate">
                EllisDon &amp; PCL Partner
              </div>
            </div>

            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Role Dropdown Menu */}
          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 font-mono text-xs space-y-1">
              <div className="px-3 py-2 border-b border-slate-800 text-[10px] text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Clerk B2B Enterprise Role Switcher</span>
                <span className="text-cyan-400 font-bold">Active Org</span>
              </div>

              {roles.map((r) => {
                const isSelected = currentRole === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => {
                      onRoleChange(r.role);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-start justify-between ${
                      isSelected
                        ? "bg-cyan-950/70 border border-cyan-500/50 text-white"
                        : "hover:bg-slate-800/80 text-slate-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs flex items-center space-x-1.5">
                        <span>{r.role}</span>
                      </div>
                      <div className="text-[10px] text-cyan-400 mt-0.5">{r.title}</div>
                      <div className="text-[10px] text-slate-400">{r.subtitle}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />}
                  </button>
                );
              })}

              <div className="p-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Tenant: EllisDon Infrastructure GTA</span>
                <span className="text-emerald-400 font-bold">OAuth Verified</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
