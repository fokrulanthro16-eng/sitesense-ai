"use client";

import React, { useState } from "react";
import {
  FileText,
  Printer,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  User,
  Shield,
  Send,
  Search,
} from "lucide-react";
import { InspectionResult, UserRole } from "@/lib/types";
import { WorkOrderPrintModal } from "./WorkOrderPrintModal";

interface WorkOrdersViewProps {
  currentInspection: InspectionResult | null;
  role: UserRole;
}

interface StoredWorkOrder {
  id: string;
  zone: string;
  contractor: string;
  severity: "CRITICAL" | "MODERATE" | "LOW";
  costCAD: number;
  date: string;
  status: "DISPATCHED" | "SCHEDULED" | "COMPLETED";
  summary: string;
  code: string;
}

const SEED_WORK_ORDERS: StoredWorkOrder[] = [
  {
    id: "WO-2026-CA-8842",
    zone: "Basement Foundation Wall - East Bay B-4",
    contractor: "Apex Foundations GTA Inc.",
    severity: "CRITICAL",
    costCAD: 5850,
    date: "2026-10-17",
    status: "DISPATCHED",
    summary: "High-pressure polyurethane injection + carbon fiber reinforcement straps for 0.45\" structural gap.",
    code: "OBC 4.1.8 & CSA A23.3",
  },
  {
    id: "WO-2026-CA-8839",
    zone: "Roof Level 24 Membrane Drain Basin",
    contractor: "Great Lakes Roofing & Waterproofing Ltd.",
    severity: "MODERATE",
    costCAD: 5350,
    date: "2026-10-15",
    status: "SCHEDULED",
    summary: "Torch-applied SBS 2-ply membrane repair & drain flange lead flashing replacement.",
    code: "OBC 5.6.1 & CRCA Standard",
  },
  {
    id: "WO-2026-CA-8831",
    zone: "Primary 600V Main Electrical Switchgear",
    contractor: "Eldor High-Voltage Systems GTA",
    severity: "CRITICAL",
    costCAD: 6900,
    date: "2026-10-14",
    status: "COMPLETED",
    summary: "De-energized 800A busbar, re-machined silver-plated lug on Phase B (89°C thermal anomaly), torque audit.",
    code: "OESC Rule 12-112 & CSA Z462",
  },
  {
    id: "WO-2026-CA-8820",
    zone: "Commercial HVAC Chiller Bay #2",
    contractor: "Trane Commercial Services Ontario",
    severity: "MODERATE",
    costCAD: 3600,
    date: "2026-10-05",
    status: "COMPLETED",
    summary: "Replaced sacrificial zinc anode, installed Grade 316 isolator flange, calibrated vibration snubbers.",
    code: "CSA B52 & OBC 6.2.2",
  },
];

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  currentInspection,
  role,
}) => {
  const [orders, setOrders] = useState<StoredWorkOrder[]>(SEED_WORK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<StoredWorkOrder | null>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const totalCommittedCAD = orders.reduce((sum, o) => sum + o.costCAD, 0);

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());

  const handlePrintOrder = (order: StoredWorkOrder) => {
    setSelectedOrder(order);
    setIsPrintOpen(true);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Enterprise Work Orders &amp; RSMeans Quotations
            </h3>
            <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 font-bold">
              Canada 🍁
            </span>
          </div>
          <p className="text-slate-400 text-xs font-mono mt-0.5">
            Audit-ready PEO forensic engineering work packages, contractor assignments, and municipal compliance filings.
          </p>
        </div>

        {/* Financial KPI */}
        <div className="flex items-center space-x-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">
              Total Committed Capital (CAD)
            </span>
            <span className="text-lg font-black text-emerald-400">
              ${totalCommittedCAD.toLocaleString()} CAD
            </span>
          </div>
          <div className="border-l border-slate-800 pl-3">
            <span className="text-[10px] text-slate-400 block uppercase">HST (13%)</span>
            <span className="text-xs text-slate-300">
              ${Math.round(totalCommittedCAD * 0.13).toLocaleString()} CAD
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-slate-500 text-[11px]">Filter Status:</span>
          {["all", "dispatched", "scheduled", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-colors ${
                filter === st
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <span className="text-slate-400 text-xs">
          Showing {filteredOrders.length} of {orders.length} Records
        </span>
      </div>

      {/* Work Orders List */}
      <div className="space-y-3">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white text-xs">{order.id}</span>
                <span className="text-slate-500">•</span>
                <span className="text-cyan-400 font-semibold">{order.zone}</span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    order.severity === "CRITICAL"
                      ? "bg-red-500/20 text-red-400 border border-red-500/40"
                      : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  }`}
                >
                  {order.severity}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    order.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : order.status === "DISPATCHED"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/40"
                      : "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <p className="text-slate-300 font-sans text-xs leading-relaxed">
                {order.summary}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span>
                  Contractor: <span className="text-slate-200 font-semibold">{order.contractor}</span>
                </span>
                <span>
                  Standard: <span className="text-amber-400">{order.code}</span>
                </span>
                <span>
                  Date: <span className="text-slate-200">{order.date}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
              <span className="text-base font-black text-emerald-400">
                ${order.costCAD.toLocaleString()} CAD
              </span>
              <button
                onClick={() => handlePrintOrder(order)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow"
              >
                <Printer className="w-3.5 h-3.5 text-cyan-400" />
                <span>View &amp; Print PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Printable Modal (If Triggered) */}
      {selectedOrder && (
        <WorkOrderPrintModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          inspection={{
            zone: selectedOrder.zone,
            severity: selectedOrder.severity,
            memoryDelta: `Logged work order: ${selectedOrder.summary}`,
            technicalDiagnosis: selectedOrder.summary,
            ontarioCodeReference: selectedOrder.code,
            eonConfidenceScore: 0.994,
            lineItemQuote: [
              { item: "Subcontractor Certified Trade Execution", costCAD: Math.round(selectedOrder.costCAD * 0.7) },
              { item: "Materials & Structural Equipment", costCAD: Math.round(selectedOrder.costCAD * 0.3) },
            ],
            totalEstimatedCostCAD: selectedOrder.costCAD,
            recommendedContractorAction: `Execute certified remediation per ${selectedOrder.code} requirements.`,
          }}
          role={role}
        />
      )}
    </div>
  );
};
