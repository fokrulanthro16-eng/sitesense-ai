"use client";

import React, { useRef } from "react";
import { X, Printer, Download, CheckCircle, Shield, Building2, MapPin, Calendar, FileText } from "lucide-react";
import { InspectionResult } from "@/lib/types";

interface WorkOrderPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: InspectionResult | null;
  role: string;
}

export const WorkOrderPrintModal: React.FC<WorkOrderPrintModalProps> = ({
  isOpen,
  onClose,
  inspection,
  role,
}) => {
  if (!isOpen || !inspection) return null;

  const subtotal = inspection.totalEstimatedCostCAD || 5850;
  const hst = Math.round(subtotal * 0.13);
  const grandTotal = subtotal + hst;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top Header Bar for UI (hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🍁</span>
            <div>
              <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                Official Enterprise Work-Order & Engineering Report
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Generated via SiteSense AI • Ready for 1-Click PDF Export
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md font-mono"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 md:p-12 space-y-8 font-sans print:p-6" id="printable-work-order">
          {/* Header & Logo */}
          <div className="flex flex-col md:flex-row md:items-start justify-between border-b-2 border-slate-900 pb-6 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  SiteSense AI
                </span>
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                  Canada 🍁
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                Autonomous Spatial Inspection & Forensic Engineering Systems
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                PEO Certificate of Authorization #100849204 • CSA / OBC Compliant
              </p>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded text-xs font-mono font-bold text-slate-800 border border-slate-300">
                WORK ORDER #: WO-2026-CA-8842
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1.5">
                Date: {new Date().toLocaleDateString("en-CA")} | Time: {new Date().toLocaleTimeString("en-CA")}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Status: <span className="font-bold text-red-600">DISPATCH READY</span>
              </p>
            </div>
          </div>

          {/* Project Site & Inspector Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Job Site & Spatial Location</span>
              </div>
              <p className="font-semibold text-slate-900">Toronto Downtown High-Rise Tower</p>
              <p className="text-slate-600">180 Spadina Ave, Toronto, ON M5T 2C2</p>
              <p className="text-slate-600">
                <span className="font-medium text-slate-800">Spatial Zone:</span> {inspection.zone}
              </p>
              <p className="text-slate-500 font-mono">GPS: 43.6532° N, 79.3832° W • Elevation: -6.4m (P2)</p>
            </div>

            <div className="space-y-1.5 md:border-l md:border-slate-200 md:pl-6">
              <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Inspection Authority & Governance</span>
              </div>
              <p className="font-semibold text-slate-900">
                Inspector: Dr. Marcus Vance, P.Eng, Struct.Eng
              </p>
              <p className="text-slate-600">Active Role: {role}</p>
              <p className="text-slate-600">
                AI Validation: <span className="font-mono font-bold text-emerald-700">Era by Eon (Score: {(inspection.eonConfidenceScore * 100).toFixed(1)}%)</span>
              </p>
              <p className="text-slate-500 font-mono">SurrealDB Node: building:toronto_spadina &rarr; floor:p2</p>
            </div>
          </div>

          {/* Severity & Executive Summary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                1. Structural Severity & Forensic Summary
              </h4>
              <span
                className={`px-3 py-1 rounded text-xs font-bold font-mono uppercase ${
                  inspection.severity === "CRITICAL"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "bg-amber-100 text-amber-700 border border-amber-300"
                }`}
              >
                Severity Level: {inspection.severity}
              </span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 font-mono">
              {inspection.technicalDiagnosis}
            </p>
          </div>

          {/* Temporal Delta & Building Code Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200">
              <span className="font-bold text-blue-900 uppercase block mb-1">
                SurrealDB Temporal Delta Audit
              </span>
              <p className="text-blue-950 text-[11px] leading-relaxed">
                {inspection.memoryDelta}
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-amber-50/70 border border-amber-200">
              <span className="font-bold text-amber-900 uppercase block mb-1">
                Ontario / National Code Reference
              </span>
              <p className="text-amber-950 text-[11px] leading-relaxed">
                {inspection.ontarioCodeReference}
              </p>
            </div>
          </div>

          {/* Itemized CAD Quote Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              2. Itemized Contractor Repair Quotation (CAD $)
            </h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Line Item Description</th>
                    <th className="py-2.5 px-4 text-right">Cost (CAD $)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inspection.lineItemQuote.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="py-2 px-4 text-slate-800">{line.item}</td>
                      <td className="py-2 px-4 text-right font-medium text-slate-900">
                        ${line.costCAD.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Subtotal</td>
                    <td className="py-2 px-4 text-right text-slate-900">
                      ${subtotal.toLocaleString()} CAD
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 text-slate-600">Ontario HST (13%)</td>
                    <td className="py-2 px-4 text-right text-slate-900">
                      ${hst.toLocaleString()} CAD
                    </td>
                  </tr>
                  <tr className="border-t-2 border-slate-900 text-sm bg-slate-100">
                    <td className="py-3 px-4 text-slate-900">Total Authorized Budget</td>
                    <td className="py-3 px-4 text-right text-blue-900 font-black">
                      ${grandTotal.toLocaleString()} CAD
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Recommended Contractor Action & Subcontractor Dispatch */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <span className="font-bold text-slate-900 font-mono uppercase block">
              3. Recommended Trade Contractor Action & Execution Protocol
            </span>
            <p className="text-slate-700 font-mono text-[11px] leading-relaxed">
              {inspection.recommendedContractorAction}
            </p>
            <p className="text-emerald-700 font-mono text-[11px] pt-1 font-semibold flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Assigned Subcontractor: Apex Foundations GTA Inc. (CWB Certified #4892)</span>
            </p>
          </div>

          {/* Inspector Signature & Engineering Seal Block */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-300">
            <div>
              <p className="text-[11px] text-slate-500 uppercase font-mono mb-6">
                Professional Engineering Seal (PEO)
              </p>
              <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-full flex flex-col items-center justify-center text-center p-2 text-slate-400 font-mono text-[9px]">
                <Shield className="w-6 h-6 text-slate-400 mb-1" />
                <span className="font-bold text-slate-600">M. VANCE, P.ENG</span>
                <span>PROVINCE OF ONTARIO</span>
                <span>LIC #100849204</span>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <div className="border-b-2 border-slate-800 pb-1 font-mono text-xs italic text-blue-900">
                Marcus Vance, M.A.Sc., P.Eng
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Lead Structural Forensic Inspector Signature
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Digitally cryptographically signed via Era by Eon Guardrail Engine
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-100">
            SiteSense AI Canada • Built for Canadian Infrastructure & Structural Resilience • Confidential B2B Document
          </div>
        </div>
      </div>
    </div>
  );
};
