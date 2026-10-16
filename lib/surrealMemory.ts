import { MemoryNode, Severity } from "./types";

export interface SurrealGraphEdge {
  from: string;
  relation: string;
  to: string;
  metadata?: Record<string, any>;
}

// Seeded realistic Canadian inspection timeline for multi-date temporal deltas
export const INITIAL_MEMORY_NODES: MemoryNode[] = [
  {
    id: "insp_log_001",
    buildingId: "building:toronto_spadina_180",
    floor: "P2 Sub-Grade Level",
    zone: "Basement Foundation Wall - East Bay B-4",
    timestamp: "2026-10-10T09:30:00Z",
    severity: "LOW",
    crackWidthInches: 0.05,
    moisturePercentage: 14.2,
    costCAD: 850,
    headline: "Baseline Initial Survey: Hairline diagonal shear crack detected",
    detail: "Micro-fissure observed 1.2m above floor slab. Low moisture readings (14.2%). No immediate rebar exposure. Recommend bi-weekly baseline monitoring under OBC Part 9.",
    codeReference: "OBC 9.15.4 (Foundation Wall Standards)",
    imageUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "insp_log_002",
    buildingId: "building:toronto_spadina_180",
    floor: "P2 Sub-Grade Level",
    zone: "Basement Foundation Wall - East Bay B-4",
    timestamp: "2026-10-12T14:15:00Z",
    severity: "MODERATE",
    crackWidthInches: 0.18,
    moisturePercentage: 22.8,
    costCAD: 2450,
    headline: "Follow-up Survey: Moisture surge +8.6% & 0.18\" lateral shift",
    detail: "Post heavy autumn rainfall, hydrostatic pressure increased. Crack widened from 0.05\" to 0.18\" (+260%). Efflorescence deposits and damp perimeter observed.",
    codeReference: "OBC 4.1.8 / CSA A23.3 (Structural Concrete)",
    imageUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "insp_log_003",
    buildingId: "building:toronto_spadina_180",
    floor: "P2 Sub-Grade Level",
    zone: "Basement Foundation Wall - East Bay B-4",
    timestamp: "2026-10-17T08:45:00Z",
    severity: "CRITICAL",
    crackWidthInches: 0.45,
    moisturePercentage: 38.5,
    costCAD: 5850,
    headline: "Autonomous Scan: Critical 0.45\" structural gap with active ingress",
    detail: "Substantial crack propagation exceeding CSA threshold. Active capillary water ingress. Rebar oxidation risk. Immediate structural polyurethane pressure injection required.",
    codeReference: "OBC 4.1.8.3 & Part 5 (Wind, Water & Hydrostatic Loads)",
    imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "insp_log_004",
    buildingId: "building:toronto_spadina_180",
    floor: "Roof Mechanical Penthouse",
    zone: "Commercial HVAC Chiller Bay #2",
    timestamp: "2026-10-05T11:20:00Z",
    severity: "MODERATE",
    crackWidthInches: 0.0,
    moisturePercentage: 62.0,
    costCAD: 3200,
    headline: "Vibration Mount Degradation & Condensate Rusting",
    detail: "Severe galvanic corrosion detected along secondary refrigerant loop and seismic isolation springs. CSA B52 mechanical compliance warning.",
    codeReference: "CSA B52 Mechanical Refrigeration Code / OBC 6.2.2",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "insp_log_005",
    buildingId: "building:toronto_spadina_180",
    floor: "Level 1 Electrical Vault",
    zone: "Primary 600V Main Electrical Switchgear",
    timestamp: "2026-10-14T16:00:00Z",
    severity: "CRITICAL",
    crackWidthInches: 0.0,
    moisturePercentage: 11.0,
    costCAD: 7400,
    headline: "Phase B Busbar Thermal Anomaly: 89°C (Overload Delta +47°C)",
    detail: "FLIR thermal differential revealed loose mechanical lug on Phase B. Arc-flash hazard. Immediate de-energization and torque re-specification under Ontario Electrical Safety Code (OESC Rule 12-112).",
    codeReference: "Ontario Electrical Safety Code 28th Edition / Rule 12-112",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80",
  },
];

export class SurrealSpatialMemory {
  private static instance: SurrealSpatialMemory;
  private nodes: MemoryNode[] = [...INITIAL_MEMORY_NODES];
  private endpoint: string;

  private constructor() {
    this.endpoint = process.env.NEXT_PUBLIC_SURREAL_URL || "http://127.0.0.1:8000/rpc";
  }

  public static getInstance(): SurrealSpatialMemory {
    if (!SurrealSpatialMemory.instance) {
      SurrealSpatialMemory.instance = new SurrealSpatialMemory();
    }
    return SurrealSpatialMemory.instance;
  }

  public getNodes(): MemoryNode[] {
    return [...this.nodes];
  }

  public getNodesByZone(zoneName: string): MemoryNode[] {
    return this.nodes
      .filter((n) => n.zone.toLowerCase().includes(zoneName.toLowerCase()) || zoneName.toLowerCase().includes(n.zone.toLowerCase()))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  public getHistoricalContextString(zoneName: string): string {
    const records = this.getNodesByZone(zoneName);
    if (records.length === 0) {
      return "SurrealDB Memory: First inspection on record for this zone. No baseline comparative delta available.";
    }

    const lines = records.map((r, idx) => {
      return `[Record #${idx + 1} | Date: ${r.timestamp.split("T")[0]}]: Severity ${r.severity}, Crack: ${r.crackWidthInches}", Moisture: ${r.moisturePercentage}%, Cost CAD: $${r.costCAD}. Note: "${r.headline}"`;
    });

    const baseline = records[0];
    const latest = records[records.length - 1];
    const crackDelta = latest.crackWidthInches - baseline.crackWidthInches;
    const moistureDelta = latest.moisturePercentage - baseline.moisturePercentage;

    return `=== SURREALDB AGENT MEMORY AUDIT TRAIL ===
Spatial Node: building:toronto_spadina_180 -> floor:P2 -> zone:${zoneName}
Historical Records Count: ${records.length}
Chronology:
${lines.join("\n")}
Calculated Temporal Trend:
- Crack Width Progression: ${baseline.crackWidthInches}" -> ${latest.crackWidthInches}" (Delta: +${crackDelta.toFixed(2)}")
- Hydrostatic Moisture Delta: ${baseline.moisturePercentage}% -> ${latest.moisturePercentage}% (Delta: +${moistureDelta.toFixed(1)}%)
- Prior Estimated Remediation Cost: $${latest.costCAD} CAD
Requirement: Calculate the new temporal delta relative to these historic records.`;
  }

  public logNewInspection(node: Omit<MemoryNode, "id">): MemoryNode {
    const newNode: MemoryNode = {
      ...node,
      id: `insp_log_${Date.now().toString().slice(-4)}`,
    };
    this.nodes.push(newNode);
    return newNode;
  }

  public getSurrealQLQueries(zoneName: string): string[] {
    return [
      `-- SurrealDB Spatial Traversal & Temporal Graph Query`,
      `SELECT * FROM inspection_log WHERE zone ~ "${zoneName}" ORDER BY timestamp ASC;`,
      `-- Spatial Graph Edge Relations`,
      `RELATE building:toronto_spadina_180->has_floor->floor:p2->has_zone->zone:east_bay_b4 SET last_scanned = time::now();`,
      `-- Real-time Subcontractor Dispatch Trigger`,
      `DEFINE EVENT critical_alert ON TABLE inspection_log WHEN $after.severity = "CRITICAL" THEN (
  CREATE work_order SET zone = $after.zone, costCAD = $after.costCAD, status = "DISPATCHED"
);`,
    ];
  }
}

export const surrealMemory = SurrealSpatialMemory.getInstance();
