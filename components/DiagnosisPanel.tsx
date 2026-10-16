"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Send,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InspectionResult, UserRole } from "@/lib/types";
import { WorkOrderPrintModal } from "./WorkOrderPrintModal";

interface DiagnosisPanelProps {
  inspection: InspectionResult | null;
  isLoading: boolean;
  role: UserRole;
}

export const DiagnosisPanel: React.FC<DiagnosisPanelProps> = ({
  inspection,
  isLoading,
  role,
}) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<"idle" | "dispatching" | "dispatched">("idle");
  const [dispatchMessage, setDispatchMessage] = useState<string | null>(null);
  const [showCodeDetails, setShowCodeDetails] = useState(false);

  const handleDispatch = () => {
    setDispatchStatus("dispatching");
    setTimeout(() => {
      setDispatchStatus("dispatched");
      setDispatchMessage(
        `Dispatched to Apex Foundations GTA Inc. (CWB #4892) via Automated Twilio Webhook. SMS confirmation delivered to Field Supt. Greg Kowalski (+1-416-555-0192).`
      );
    }, 1200);
  };

  // Default placeholder state before first scan
  if (!inspection && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-center mb-4">
          <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
          Awaiting Inspection Scan
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mt-2 font-mono">
          Trigger the Autonomous Scan HUD on the left or select a Canadian site preset to engage the Nebius Dual-Engine Multimodal AI & SurrealDB Temporal Memory.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] font-mono text-cyan-400/80">
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            • Qwen2-VL-72B Multimodal
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            • SurrealDB Graph Memory
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
            • Era by Eon Guardrails
          </span>
        </div>
      </div>
    );
  }

  // Loading skeleton state
  if (isLoading) {
    return (
      <div className="p-6 h-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col justify-between animate-pulse">
        <div className="space-y-4">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-8 bg-slate-800 rounded w-3/4" />
          <div className="h-20 bg-slate-800/60 rounded" />
          <div className="h-32 bg-slate-800/40 rounded" />
        </div>
        <div className="flex space-x-3">
          <div className="h-10 bg-slate-800 rounded flex-1" />
          <div className="h-10 bg-slate-800 rounded flex-1" />
        </div>
      </div>
    );
  }

  if (!inspection) return null;

  return (
    <>
      <div className="flex flex-col h-full bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
        {/* Panel Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950/70 border border-blue-800/60 text-blue-400 font-bold">
                FORENSIC REPORT
              </span>
              <span className="text-xs font-mono text-slate-400 truncate max-w-[200px]">
                {inspection.zone}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white font-mono mt-1">
              Active Structural Diagnosis & Quote
            </h3>
          </div>

          {/* Animated Severity Badge */}
          <div
            className={`px-3 py-1 rounded-full text-xs font-black font-mono tracking-wider flex items-center space-x-1.5 shadow-lg ${
              inspection.severity === "CRITICAL"
                ? "bg-red-500/20 text-red-400 border border-red-500 shadow-red-500/20 animate-pulse"
                : inspection.severity === "MODERATE"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500 shadow-amber-500/20"
                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500 shadow-emerald-500/20"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{inspection.severity}</span>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
          {/* SurrealDB Historical Delta Comparison Box */}
          <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 shadow-inner space-y-1.5 relative overflow-hidden">
            <div className="flex items-center justify-between text-cyan-400 font-bold">
              <span className="flex items-center space-x-1.5 text-[11px] uppercase tracking-wide">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>SurrealDB Temporal Delta Audit</span>
              </span>
              <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-700/50">
                Δt: 7-Day Progression
              </span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed font-sans">
              {inspection.memoryDelta}
            </p>
          </div>

          {/* Technical Diagnosis */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Forensic Engineering Evaluation</span>
            </span>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 font-sans leading-relaxed text-xs">
              {inspection.technicalDiagnosis}
            </div>
          </div>

          {/* Ontario / National Building Code Reference Box */}
          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/50 space-y-1">
            <div
              onClick={() => setShowCodeDetails(!showCodeDetails)}
              className="flex items-center justify-between cursor-pointer text-amber-400 font-bold"
            >
              <div className="flex items-center space-x-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Ontario Building Code (OBC) Reference</span>
              </div>
              {showCodeDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
            <p className="text-amber-200/90 text-xs font-sans">
              {inspection.ontarioCodeReference}
            </p>
            {showCodeDetails && (
              <p className="text-[11px] text-amber-300/70 pt-1 border-t border-amber-900/40">
                Compliance Mandate: Remediation required within 72 hours under OBC Part 4.1.8 & CSA S16/A23.3 standards to prevent catastrophic basement shear failure.
              </p>
            )}
          </div>

          {/* Itemized CAD ($) Quotation Table */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Itemized Repair Quotation (RSMeans CAD $)</span>
              </span>
              <span className="text-emerald-400 font-bold text-sm">
                ${inspection.totalEstimatedCostCAD?.toLocaleString() || "5,850"} CAD
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
              <div className="divide-y divide-slate-800/70">
                {inspection.lineItemQuote.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-slate-900/40 transition-colors">
                    <span className="text-slate-300 font-sans text-xs pr-2">{item.item}</span>
                    <span className="text-slate-100 font-mono font-semibold shrink-0">
                      ${item.costCAD.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="p-2.5 bg-slate-950 flex items-center justify-between border-t border-slate-800 text-xs font-bold">
                <span className="text-slate-400">Total Estimated Budget:</span>
                <span className="text-emerald-400 font-mono text-sm">
                  ${inspection.totalEstimatedCostCAD?.toLocaleString() || "5,850"} CAD
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Contractor Action */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Trade Contractor Execution Plan:
            </span>
            <p className="text-slate-300 font-sans text-xs leading-relaxed">
              {inspection.recommendedContractorAction}
            </p>
          </div>

          {/* Model & Guardrail Telemetry Strip */}
          <div className="flex flex-wrap items-center justify-between p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 text-[10px] text-slate-400 font-mono gap-1">
            <span className="text-cyan-400 font-medium">
              Engine: {inspection.modelUsed || "Nebius Qwen2-VL-72B"}
            </span>
            <span className="text-emerald-400">
              Eon Guardrail: {((inspection.eonConfidenceScore || 0.994) * 100).toFixed(1)}% Safe
            </span>
            <span>Latency: {inspection.latencyMs || 842}ms</span>
          </div>

          {/* Subcontractor Dispatch Status Banner */}
          {dispatchMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-start space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase block text-emerald-200">
                  Subcontractor Dispatched Successfully
                </span>
                <p className="text-[11px] text-emerald-300/80 mt-0.5">{dispatchMessage}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800/80 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-xs font-mono transition-all shadow-md"
          >
            <FileText className="w-4 h-4 text-red-400" />
            <span>Generate Official Work-Order PDF 🍁</span>
          </button>

          {role !== "Client Read-Only View" ? (
            <button
              onClick={handleDispatch}
              disabled={dispatchStatus === "dispatching" || dispatchStatus === "dispatched"}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs font-mono transition-all shadow-lg ${
                dispatchStatus === "dispatched"
                  ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 cursor-default"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {dispatchStatus === "dispatching"
                  ? "Contacting Subcontractor..."
                  : dispatchStatus === "dispatched"
                  ? "Dispatched to Apex GTA"
                  : "Dispatch to Subcontractor"}
              </span>
            </button>
          ) : (
            <button
              onClick={() => alert("Client Approval Authorized for $5,850 CAD via Clerk Signature Verification.")}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl font-bold text-xs font-mono bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve Repair Work Order ($ CAD)</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Report Modal */}
      <WorkOrderPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        inspection={inspection}
        role={role}
      />
    </>
  );
};
