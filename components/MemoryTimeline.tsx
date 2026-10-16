"use client";

import React, { useState } from "react";
import {
  Database,
  GitCommit,
  GitBranch,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Code2,
  Calendar,
  Layers,
  MapPin,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MemoryNode, Severity } from "@/lib/types";
import { surrealMemory, INITIAL_MEMORY_NODES } from "@/lib/surrealMemory";

interface MemoryTimelineProps {
  onSelectNode?: (node: MemoryNode) => void;
  activeZone: string;
}

export const MemoryTimeline: React.FC<MemoryTimelineProps> = ({
  onSelectNode,
  activeZone,
}) => {
  const [nodes, setNodes] = useState<MemoryNode[]>(surrealMemory.getNodes());
  const [selectedNode, setSelectedNode] = useState<MemoryNode>(nodes[2] || nodes[0]);
  const [activeTab, setActiveTab] = useState<"timeline" | "graph" | "surrealql">("timeline");
  const [filterZone, setFilterZone] = useState<string>("all");

  const filteredNodes =
    filterZone === "all"
      ? nodes
      : nodes.filter((n) => n.zone.toLowerCase().includes(filterZone.toLowerCase()));

  const surrealQLQueries = surrealMemory.getSurrealQLQueries(selectedNode.zone);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/70 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">
                SurrealDB Spatial & Temporal Agent Memory
              </h3>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800 font-mono">
                Graph Relations: building → floor → zone
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Live Temporal Progression & Historical Delta Store (Toronto Spadina Tower • P2 Sub-Grade)
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === "timeline"
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab("graph")}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === "graph"
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Spatial Graph</span>
          </button>
          <button
            onClick={() => setActiveTab("surrealql")}
            className={`px-3 py-1 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === "surrealql"
                ? "bg-cyan-500 text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>SurrealQL</span>
          </button>
        </div>
      </div>

      {/* Zone Filter Chips */}
      <div className="flex items-center space-x-2 text-xs font-mono overflow-x-auto pb-1 scrollbar-none">
        <span className="text-slate-500 text-[11px] shrink-0">Filter Zone:</span>
        <button
          onClick={() => setFilterZone("all")}
          className={`px-2.5 py-0.5 rounded-full border text-[11px] whitespace-nowrap transition-colors ${
            filterZone === "all"
              ? "bg-cyan-950 border-cyan-500 text-cyan-300"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          All Nodes ({nodes.length})
        </button>
        <button
          onClick={() => setFilterZone("basement")}
          className={`px-2.5 py-0.5 rounded-full border text-[11px] whitespace-nowrap transition-colors ${
            filterZone === "basement"
              ? "bg-cyan-950 border-cyan-500 text-cyan-300"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          Basement Wall B-4 (3 Historical Deltas)
        </button>
        <button
          onClick={() => setFilterZone("hvac")}
          className={`px-2.5 py-0.5 rounded-full border text-[11px] whitespace-nowrap transition-colors ${
            filterZone === "hvac"
              ? "bg-cyan-950 border-cyan-500 text-cyan-300"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          HVAC Chiller Bay #2
        </button>
        <button
          onClick={() => setFilterZone("switchgear")}
          className={`px-2.5 py-0.5 rounded-full border text-[11px] whitespace-nowrap transition-colors ${
            filterZone === "switchgear"
              ? "bg-cyan-950 border-cyan-500 text-cyan-300"
              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
          }`}
        >
          600V Switchgear
        </button>
      </div>

      {/* Main Content Area Based On Tab */}
      {activeTab === "timeline" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Horizontal / Vertical Timeline Flow (8 Cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Chronological Inspection Nodes (Click to Inspect)</span>
              <span className="text-cyan-400">Δt Temporal Chain</span>
            </div>

            <div className="space-y-2.5">
              {filteredNodes.map((node, index) => {
                const isSelected = selectedNode.id === node.id;
                return (
                  <motion.div
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      onSelectNode?.(node);
                    }}
                    whileHover={{ scale: 1.01 }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                      isSelected
                        ? "bg-slate-800/90 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                        : "bg-slate-950/60 border-slate-800/90 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="font-bold text-slate-200">{node.timestamp.split("T")[0]}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 truncate max-w-[150px]">{node.zone}</span>
                      </div>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          node.severity === "CRITICAL"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : node.severity === "MODERATE"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        }`}
                      >
                        {node.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans line-clamp-1 mb-2">
                      {node.headline}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/60">
                      <div>
                        {node.crackWidthInches > 0 && (
                          <span className="text-cyan-300 mr-3">
                            Crack: <span className="font-bold">{node.crackWidthInches}&quot;</span>
                          </span>
                        )}
                        <span>
                          Moisture: <span className="font-bold text-slate-300">{node.moisturePercentage}%</span>
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold">
                        ${node.costCAD.toLocaleString()} CAD
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-400" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Node Snapshot & Temporal Delta Deep Dive (5 Cols) */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3 font-mono">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                <span className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider">
                  Surreal Node Snapshot
                </span>
                <span className="text-[10px] text-slate-400">
                  ID: {selectedNode.id}
                </span>
              </div>

              {selectedNode.imageUrl && (
                <div className="relative h-28 w-full rounded-lg overflow-hidden border border-slate-800 mb-3">
                  <img
                    src={selectedNode.imageUrl}
                    alt="Historical Snapshot"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-slate-950/90 text-[9px] px-1.5 py-0.5 rounded text-cyan-400 border border-slate-800">
                    Archived Frame
                  </div>
                </div>
              )}

              <h4 className="text-xs font-bold text-white font-sans mb-1.5">
                {selectedNode.headline}
              </h4>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed mb-3">
                {selectedNode.detail}
              </p>

              {/* Metric Delta Comparison Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-400 block">Crack Width:</span>
                  <span className="text-cyan-300 font-bold">
                    {selectedNode.crackWidthInches > 0 ? `${selectedNode.crackWidthInches}"` : "N/A (Surface)"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Hydrostatic Moisture:</span>
                  <span className="text-blue-300 font-bold">{selectedNode.moisturePercentage}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Repair Estimate:</span>
                  <span className="text-emerald-400 font-bold">${selectedNode.costCAD} CAD</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Building Standard:</span>
                  <span className="text-amber-400 font-bold truncate block">{selectedNode.codeReference.split("/")[0]}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[10px] text-cyan-300">
              <span className="font-bold block mb-0.5">Autonomous Agent Memory Insight:</span>
              This node is stored in SurrealDB as a persistent temporal vector, automatically informing future structural degradation velocity calculations.
            </div>
          </div>
        </div>
      )}

      {/* Spatial Graph View */}
      {activeTab === "graph" && (
        <div className="p-6 rounded-xl bg-slate-950/90 border border-slate-800 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-bold text-slate-200">SurrealDB Graph Schema Relations:</span>
            <span className="text-cyan-400">Directed Property Graph</span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 p-6 bg-slate-900/50 rounded-xl border border-slate-800/80 overflow-x-auto">
            <div className="p-3 bg-blue-950/60 border border-blue-700/60 rounded-xl text-center min-w-[160px]">
              <span className="text-[10px] text-blue-400 uppercase font-bold block">Building Root</span>
              <span className="text-white font-bold text-xs">building:toronto_spadina</span>
              <span className="text-[10px] text-slate-400 block mt-1">180 Spadina Ave</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 rotate-90 md:rotate-0" />

            <div className="p-3 bg-cyan-950/60 border border-cyan-700/60 rounded-xl text-center min-w-[150px]">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block">Floor Node</span>
              <span className="text-white font-bold text-xs">floor:p2_subgrade</span>
              <span className="text-[10px] text-slate-400 block mt-1">Elevation -6.4m</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 rotate-90 md:rotate-0" />

            <div className="p-3 bg-purple-950/60 border border-purple-700/60 rounded-xl text-center min-w-[180px]">
              <span className="text-[10px] text-purple-400 uppercase font-bold block">Spatial Zone</span>
              <span className="text-white font-bold text-xs">zone:east_bay_b4</span>
              <span className="text-[10px] text-slate-400 block mt-1">Foundation Retaining Wall</span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 rotate-90 md:rotate-0" />

            <div className="p-3 bg-red-950/60 border border-red-700/60 rounded-xl text-center min-w-[180px]">
              <span className="text-[10px] text-red-400 uppercase font-bold block">Inspection Record (3)</span>
              <span className="text-white font-bold text-xs">insp_log_003 (Latest)</span>
              <span className="text-[10px] text-red-300 block mt-1">0.45&quot; Critical Ingress</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] text-slate-400 pt-2">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-200 font-bold block mb-1">1. Spatial Traversal</span>
              SurrealQL graph traversals let inspectors instantly query historical degradation rates across entire sub-grade levels.
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-200 font-bold block mb-1">2. Temporal Delta Engine</span>
              Automated comparison between baseline and follow-up nodes calculates material expansion velocity in inches/month.
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-200 font-bold block mb-1">3. Automated Event Dispatch</span>
              Real-time SurrealDB `DEFINE EVENT` hooks automatically publish work-orders to trade subcontractors upon `CRITICAL` severity classification.
            </div>
          </div>
        </div>
      )}

      {/* SurrealQL Console View */}
      {activeTab === "surrealql" && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-cyan-400 font-bold">Live SurrealQL Query Console</span>
            <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              ENDPOINT: {process.env.NEXT_PUBLIC_SURREAL_URL || "http://127.0.0.1:8000/rpc"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 text-cyan-300 space-y-2 overflow-x-auto">
            {surrealQLQueries.map((query, idx) => (
              <div key={idx} className={query.startsWith("--") ? "text-slate-500 italic" : "text-emerald-400 font-semibold"}>
                {query}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Graph relations validated under SurrealDB 2.0 specs.</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>SurrealDB RPC Connected</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
