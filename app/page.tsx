"use client";

import { useState, useRef } from "react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type FruitType = "Citrus" | "Grapes" | "Stonefruit";
type Decision = "ACCEPT" | "ACCEPT_WITH_CLAIM" | "REJECT";

interface FieldConfig {
  id: string;
  label: string;
  type: "number" | "select";
  unit?: string;
  options?: string[];
  placeholder?: string;
  step?: string;
  passDisplay: string;
  passCheck: (value: string, variety?: string) => boolean | null;
  failExplanation: string;
  failAction: string;
}

interface FieldResult {
  id: string;
  label: string;
  value: string;
  unit?: string;
  pass: boolean;
  failExplanation: string;
  failAction: string;
  passDisplay: string;
}

// ─────────────────────────────────────────────
// FIELD DEFINITIONS — CITRUS
// ─────────────────────────────────────────────
const CITRUS_FIELDS: FieldConfig[] = [
  {
    id: "pulp_temp",
    label: "Pulp Temperature",
    type: "number",
    unit: "°F",
    placeholder: "e.g. 36",
    step: "0.1",
    passDisplay: "34–38°F",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 34 && n <= 38;
    },
    failExplanation:
      "Temperature outside 34–38°F indicates cold chain failure or inadequate pre-cooling, accelerating decay and reducing shelf life.",
    failAction:
      "File a cold chain claim with the carrier. Document arrival temperature with time-stamped photos and request the reefer printout.",
  },
  {
    id: "brix",
    label: "Brix (Sugar Content)",
    type: "number",
    unit: "°Bx",
    placeholder: "e.g. 11.5",
    step: "0.1",
    passDisplay: "10.0+ °Bx",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 10.0;
    },
    failExplanation:
      "Low Brix indicates the fruit was harvested under-mature, resulting in poor flavor and consumer dissatisfaction.",
    failAction:
      "Request a credit memo from the shipper. Attach Brix readings and sample documentation to your claim.",
  },
  {
    id: "firmness",
    label: "Pressure / Firmness",
    type: "number",
    unit: "lbs",
    placeholder: "e.g. 8",
    step: "0.1",
    passDisplay: "6–12 lbs",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 6 && n <= 12;
    },
    failExplanation:
      "Firmness outside range signals over-ripeness (too soft) or immaturity (too hard), reducing shelf life or eating quality.",
    failAction:
      "Document firmness readings across multiple samples. Evaluate for immediate sale or markdown if too soft.",
  },
  {
    id: "color",
    label: "Color",
    type: "select",
    options: ["Green", "Breaking", "Half Color", "Full Color", "Over Color"],
    passDisplay: "Half Color or Full Color",
    passCheck: (v) => {
      if (!v) return null;
      return v === "Half Color" || v === "Full Color";
    },
    failExplanation:
      "Color outside acceptable range signals under-maturity (Green/Breaking) or over-ripeness (Over Color), limiting marketability and shelf life.",
    failAction:
      "Photograph color defects across multiple cartons. Issue conditional acceptance or request shipper credit based on buyer standards.",
  },
  {
    id: "decay",
    label: "Decay %",
    type: "number",
    unit: "%",
    placeholder: "e.g. 0.5",
    step: "0.1",
    passDisplay: "0–1%",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 0 && n <= 1;
    },
    failExplanation:
      "Decay above 1% significantly reduces usable yield and poses food safety concerns, especially in warm storage environments.",
    failAction:
      "Document and photograph all decay. Segregate affected product. File claim for full lot if systemic decay is found.",
  },
  {
    id: "pitting",
    label: "Pitting / Chilling Injury",
    type: "select",
    options: ["None", "Slight", "Moderate", "Severe"],
    passDisplay: "None or Slight",
    passCheck: (v) => {
      if (!v) return null;
      return v === "None" || v === "Slight";
    },
    failExplanation:
      "Moderate to severe pitting indicates improper temperature management in transit — causing cellular damage and drastically reducing shelf life.",
    failAction:
      "File a cold chain / temperature abuse claim. Request transit temperature logs and reefer printout from the carrier.",
  },
  {
    id: "dehydration",
    label: "Dehydration",
    type: "select",
    options: ["None", "Slight", "Moderate", "Severe"],
    passDisplay: "None or Slight",
    passCheck: (v) => {
      if (!v) return null;
      return v === "None" || v === "Slight";
    },
    failExplanation:
      "Moderate to severe dehydration results in significant weight loss and reduces visual appeal and product value at retail.",
    failAction:
      "Document dehydration with photos. Request a commercial allowance or credit memo based on estimated shrink loss.",
  },
  {
    id: "off_odor",
    label: "Off Odor",
    type: "select",
    options: ["None", "Slight", "Strong"],
    passDisplay: "None only",
    passCheck: (v) => {
      if (!v) return null;
      return v === "None";
    },
    failExplanation:
      "Any off odor is a serious defect indicating fermentation, rot, or chemical contamination — a direct food safety concern.",
    failAction:
      "Reject the load if odor is strong. For slight odor, quarantine the lot and consult your QA team before any resale.",
  },
  {
    id: "label_compliance",
    label: "Label / Pack Compliance",
    type: "select",
    options: ["Compliant", "Minor Issues", "Non-Compliant"],
    passDisplay: "Compliant",
    passCheck: (v) => {
      if (!v) return null;
      return v === "Compliant";
    },
    failExplanation:
      "Non-compliant labeling may violate USDA or retail specifications, creating legal risk and chargeback exposure.",
    failAction:
      "Flag for compliance team. Request corrected documentation from shipper. Reserve your right to chargeback.",
  },
];

// ─────────────────────────────────────────────
// FIELD DEFINITIONS — GRAPES
// ─────────────────────────────────────────────
const GRAPES_FIELDS: FieldConfig[] = [
  {
    id: "pulp_temp",
    label: "Pulp Temperature",
    type: "number",
    unit: "°F",
    placeholder: "e.g. 34",
    step: "0.1",
    passDisplay: "32–36°F",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 32 && n <= 36;
    },
    failExplanation:
      "Temperature out of range accelerates decay and reduces shelf life dramatically — grapes are extremely sensitive to cold chain breaks.",
    failAction:
      "File a cold chain claim with the carrier. Document arrival temperature with photos and request the reefer data printout.",
  },
  {
    id: "brix",
    label: "Brix (Sugar Content)",
    type: "number",
    unit: "°Bx",
    placeholder: "e.g. 17",
    step: "0.1",
    passDisplay: "16.0+ °Bx",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 16.0;
    },
    failExplanation:
      "Brix below 16 indicates grapes were harvested before reaching eating maturity — a fundamental and non-recoverable quality deficiency.",
    failAction:
      "Request a credit memo from the shipper. Document Brix readings on multiple clusters and attach to claim.",
  },
  {
    id: "berry_firmness",
    label: "Berry Firmness",
    type: "select",
    options: ["Firm", "Slightly Soft", "Soft", "Very Soft"],
    passDisplay: "Firm or Slightly Soft",
    passCheck: (v) => {
      if (!v) return null;
      return v === "Firm" || v === "Slightly Soft";
    },
    failExplanation:
      "Soft or very soft grapes have severely limited shelf life, are prone to leaking and secondary decay, and will not meet retail standards.",
    failAction:
      "Evaluate for immediate foodservice or processing diversion. Document with photos and weights. File claim for value loss.",
  },
  {
    id: "color",
    label: "Color",
    type: "select",
    options: ["Poor", "Fair", "Good", "Excellent"],
    passDisplay: "Good or Excellent",
    passCheck: (v) => {
      if (!v) return null;
      return v === "Good" || v === "Excellent";
    },
    failExplanation:
      "Poor or fair color development reduces consumer appeal and indicates immaturity or varietal non-conformance.",
    failAction:
      "Photograph color across multiple representative samples. Consider markdown pricing and request a shipper credit.",
  },
  {
    id: "decay",
    label: "Decay %",
    type: "number",
    unit: "%",
    placeholder: "e.g. 0.5",
    step: "0.1",
    passDisplay: "0–1%",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 0 && n <= 1;
    },
    failExplanation:
      "Decay above 1% spreads rapidly through the lot — especially under humid or warm conditions. Early action is critical.",
    failAction:
      "Photograph decay across multiple cartons. File for full-lot rejection if systemic. Segregate affected clusters immediately.",
  },
  {
    id: "shatter",
    label: "Shatter % (Loose Berries)",
    type: "number",
    unit: "%",
    placeholder: "e.g. 2",
    step: "0.1",
    passDisplay: "0–3%",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 0 && n <= 3;
    },
    failExplanation:
      "Excessive shatter indicates rough handling, vibration damage, or over-maturity — reducing pack weight and consumer appeal.",
    failAction:
      "Weigh loose berry percentage across multiple cartons. File transit damage or maturity claim with carrier or shipper.",
  },
  {
    id: "so2_damage",
    label: "SO₂ Damage",
    type: "select",
    options: ["None", "Slight", "Moderate", "Severe"],
    passDisplay: "None or Slight",
    passCheck: (v) => {
      if (!v) return null;
      return v === "None" || v === "Slight";
    },
    failExplanation:
      "Moderate to severe SO₂ damage bleaches and breaks down berry skin — indicating improper SO₂ pad management during transit.",
    failAction:
      "Document SO₂ damage with close-up photos. File a packing/transit claim against the shipper. Reject if severe.",
  },
  {
    id: "off_odor",
    label: "Off Odor",
    type: "select",
    options: ["None", "Slight", "Strong"],
    passDisplay: "None only",
    passCheck: (v) => {
      if (!v) return null;
      return v === "None";
    },
    failExplanation:
      "Off odors in grapes indicate fermentation, SO₂ over-exposure, or contamination — a food safety and quality concern.",
    failAction:
      "Quarantine the lot immediately. Reject if odor is strong. Consult QA before any resale of affected product.",
  },
  {
    id: "label_compliance",
    label: "Label / Pack Compliance",
    type: "select",
    options: ["Compliant", "Minor Issues", "Non-Compliant"],
    passDisplay: "Compliant",
    passCheck: (v) => {
      if (!v) return null;
      return v === "Compliant";
    },
    failExplanation:
      "Non-compliant labeling creates chargeback risk at retail and may violate USDA fresh fruit labeling requirements.",
    failAction:
      "Flag for compliance review. Request corrected paperwork from the shipper. Reserve your chargeback rights in writing.",
  },
];

// ─────────────────────────────────────────────
// FIELD DEFINITIONS — STONEFRUIT
// ─────────────────────────────────────────────
const STONEFRUIT_FIELDS: FieldConfig[] = [
  {
    id: "pulp_temp",
    label: "Pulp Temperature",
    type: "number",
    unit: "°F",
    placeholder: "e.g. 34",
    step: "0.1",
    passDisplay: "32–36°F",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 32 && n <= 36;
    },
    failExplanation:
      "Temperature deviation in stonefruit signals cold chain failure — accelerating ripening, internal breakdown, and decay.",
    failAction:
      "File a cold chain claim immediately. Request the carrier's temperature recorder printout and document with photos.",
  },
  {
    id: "brix",
    label: "Brix (Sugar Content)",
    type: "number",
    unit: "°Bx",
    placeholder: "e.g. 13",
    step: "0.1",
    passDisplay: "12.0+ °Bx (Peaches/Nect. / Plums)  |  14.0+ °Bx (Cherries)",
    passCheck: (v, variety) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return variety === "Cherries" ? n >= 14.0 : n >= 12.0;
    },
    failExplanation:
      "Low Brix in stonefruit indicates premature harvest, leading to poor flavor, mealy texture, and high consumer return rates.",
    failAction:
      "Document Brix readings across multiple samples. File an immaturity claim with the shipper and assess foodservice diversion.",
  },
  {
    id: "firmness",
    label: "Pressure / Firmness",
    type: "number",
    unit: "lbs",
    placeholder: "e.g. 7",
    step: "0.1",
    passDisplay: "4–10 lbs",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 4 && n <= 10;
    },
    failExplanation:
      "Firmness outside range signals over-ripeness (too soft for retail shelf life) or immaturity (too firm to ripen properly).",
    failAction:
      "Document readings across the lot. Evaluate for immediate use or markdown if soft. Request credit memo from shipper.",
  },
  {
    id: "color",
    label: "Color",
    type: "select",
    options: ["Green", "Undercolor", "Good Color", "Full Color", "Over Ripe"],
    passDisplay: "Good Color or Full Color",
    passCheck: (v) => {
      if (!v) return null;
      return v === "Good Color" || v === "Full Color";
    },
    failExplanation:
      "Improper color signals immaturity (Green/Undercolor) or over-ripeness — both significantly reduce shelf life and retail marketability.",
    failAction:
      "Document color across the lot with photos. File a maturity claim for green fruit. Evaluate over-ripe fruit for immediate markdown.",
  },
  {
    id: "decay",
    label: "Decay %",
    type: "number",
    unit: "%",
    placeholder: "e.g. 0.5",
    step: "0.1",
    passDisplay: "0–1%",
    passCheck: (v) => {
      const n = parseFloat(v);
      if (isNaN(n)) return null;
      return n >= 0 && n <= 1;
    },
    failExplanation:
      "Stonefruit decay (especially Monilinia brown rot) spreads rapidly — one affected piece can destroy an entire pallet within 24–48 hours.",
    failAction:
      "Photograph all decay instances. Segregate immediately. File an urgent claim — stonefruit decay claims are time-sensitive.",
  },
  {
    id: "internal_breakdown",
    label: "Internal Breakdown",
    type: "select",
    options: ["None", "Slight", "Moderate", "Severe"],
    passDisplay: "None only",
    passCheck: (v) => {
      if (!v) return null;
      return v === "None";
    },
    failExplanation:
      "Any internal breakdown indicates cold chain damage or over-ripeness. Consumers cannot detect it externally, creating high returns risk.",
    failAction:
      "Cut-sample multiple units and photograph the breakdown pattern. File cold chain or quality claim. Consider full rejection if widespread.",
  },
  {
    id: "pit_burn",
    label: "Pit Burn",
    type: "select",
    options: ["None", "Slight", "Moderate", "Severe"],
    passDisplay: "None or Slight",
    passCheck: (v) => {
      if (!v) return null;
      return v === "None" || v === "Slight";
    },
    failExplanation:
      "Moderate to severe pit burn (internal browning around the pit) indicates pre-harvest heat stress, significantly reducing eating quality.",
    failAction:
      "Document with cut-sample photos across multiple pieces. File an origin quality claim with the shipper. Assess usable yield before accepting.",
  },
  {
    id: "off_odor",
    label: "Off Odor",
    type: "select",
    options: ["None", "Slight", "Strong"],
    passDisplay: "None only",
    passCheck: (v) => {
      if (!v) return null;
      return v === "None";
    },
    failExplanation:
      "Off odors in stonefruit indicate fermentation or advanced decay — a direct food safety concern and grounds for outright rejection.",
    failAction:
      "Quarantine the lot immediately. Reject if odor is strong. Consult your QA or food safety team before any distribution.",
  },
  {
    id: "label_compliance",
    label: "Label / Pack Compliance",
    type: "select",
    options: ["Compliant", "Minor Issues", "Non-Compliant"],
    passDisplay: "Compliant",
    passCheck: (v) => {
      if (!v) return null;
      return v === "Compliant";
    },
    failExplanation:
      "Non-compliant labels create legal and chargeback exposure and may violate USDA fresh stonefruit import requirements.",
    failAction:
      "Contact the shipper for corrected documentation. Reserve the right to reject or chargeback. Flag immediately for compliance review.",
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function getFields(fruitType: FruitType): FieldConfig[] {
  if (fruitType === "Citrus") return CITRUS_FIELDS;
  if (fruitType === "Grapes") return GRAPES_FIELDS;
  return STONEFRUIT_FIELDS;
}

function evaluateAll(
  fruitType: FruitType,
  values: Record<string, string>,
  variety: string
): FieldResult[] {
  return getFields(fruitType).map((field) => {
    const value = values[field.id] ?? "";
    const result = field.passCheck(value, variety);
    return {
      id: field.id,
      label: field.label,
      value,
      unit: field.unit,
      pass: result === true,
      failExplanation: field.failExplanation,
      failAction: field.failAction,
      passDisplay: field.passDisplay,
    };
  });
}

function getDecision(results: FieldResult[]): Decision {
  const fails = results.filter((r) => !r.pass).length;
  if (fails <= 1) return "ACCEPT";
  if (fails <= 3) return "ACCEPT_WITH_CLAIM";
  return "REJECT";
}

function generateReportText(
  fruitType: FruitType,
  variety: string,
  origin: string,
  buyerType: string,
  results: FieldResult[],
  decision: Decision
): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const decisionLabel =
    decision === "ACCEPT"
      ? "ACCEPT — Fruit meets arrival standards"
      : decision === "ACCEPT_WITH_CLAIM"
      ? "ACCEPT WITH CLAIM — Document issues and file claim"
      : "REJECT — Fruit does not meet arrival standards";

  const failures = results.filter((r) => !r.pass);
  const line = "=".repeat(54);
  const divider = "-".repeat(54);

  const lines = [
    line,
    "     OFF-SPEC ARRIVAL INSPECTION REPORT",
    "     Powered by Axarat",
    line,
    "",
    `Date/Time  : ${dateStr}  |  ${timeStr}`,
    `Fruit Type : ${fruitType}${variety ? ` (${variety})` : ""}`,
    `Origin     : ${origin}`,
    `Buyer Type : ${buyerType}`,
    "",
    divider,
    `DECISION   : ${decisionLabel}`,
    `Failures   : ${failures.length} of 9 inspection points failed`,
    divider,
    "",
    "INSPECTION RESULTS:",
    "",
    ...results.map((r, i) => {
      const label = `  ${String(i + 1).padStart(2)}. ${r.label}${r.unit ? ` (${r.unit})` : ""}`;
      const val = r.value ? `${r.value}${r.unit ? ` ${r.unit}` : ""}` : "—";
      const badge = r.pass ? "PASS" : "FAIL";
      return `${label.padEnd(36)}${val.padEnd(14)}${badge}`;
    }),
    "",
  ];

  if (failures.length > 0) {
    lines.push("FAILED POINTS & RECOMMENDED ACTIONS:");
    lines.push("");
    failures.forEach((r, i) => {
      lines.push(`  ${i + 1}. ${r.label}`);
      lines.push(
        `     Recorded : ${r.value || "—"}${r.unit ? ` ${r.unit}` : ""}`
      );
      lines.push(`     Issue    : ${r.failExplanation}`);
      lines.push(`     Action   : ${r.failAction}`);
      lines.push("");
    });
  }

  lines.push(line);
  lines.push("Axarat — Real-time visibility for fresh produce importers.");
  lines.push("Start your 15-day pilot: axarat.com/#contact");
  lines.push(line);

  return lines.join("\n");
}

// ─────────────────────────────────────────────
// STEP INDICATOR COMPONENT
// ─────────────────────────────────────────────
function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10 shadow-sm">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
              step >= 1
                ? "bg-[#0b0f1a] text-white border-[#0b0f1a]"
                : "bg-gray-100 text-gray-400 border-gray-300"
            }`}
          >
            {step > 1 ? "✓" : "1"}
          </div>
          <span
            className={`text-sm font-semibold hidden sm:block ${
              step === 1 ? "text-[#0b0f1a]" : "text-gray-400"
            }`}
          >
            Shipment Details
          </span>
          <span className={`text-sm font-semibold sm:hidden ${step === 1 ? "text-[#0b0f1a]" : "text-gray-400"}`}>
            Details
          </span>
        </div>

        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-[#0b0f1a] rounded-full transition-all duration-700 ease-out ${
              step >= 2 ? "w-full" : "w-0"
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
              step === 2
                ? "bg-[#0b0f1a] text-white border-[#0b0f1a]"
                : "bg-gray-100 text-gray-400 border-gray-300"
            }`}
          >
            2
          </div>
          <span
            className={`text-sm font-semibold hidden sm:block ${
              step === 2 ? "text-[#0b0f1a]" : "text-gray-400"
            }`}
          >
            Inspection Data
          </span>
          <span className={`text-sm font-semibold sm:hidden ${step === 2 ? "text-[#0b0f1a]" : "text-gray-400"}`}>
            Inspection
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function OffSpecAnalyzer() {
  const [step, setStep] = useState<1 | 2>(1);
  const [fruitType, setFruitType] = useState<FruitType | "">("");
  const [variety, setVariety] = useState("");
  const [origin, setOrigin] = useState("");
  const [buyerType, setBuyerType] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<FieldResult[]>([]);
  const [decision, setDecision] = useState<Decision | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const fields = fruitType ? getFields(fruitType as FruitType) : [];
  const filledCount = fields.filter(
    (f) => (values[f.id] ?? "") !== ""
  ).length;

  const step1Valid =
    !!fruitType &&
    !!origin &&
    !!buyerType &&
    (fruitType !== "Stonefruit" || !!variety);

  function handleStartInspection() {
    if (!step1Valid) return;
    setStep(2);
    setValues({});
    setResults([]);
    setDecision(null);
  }

  function handleGenerateReport() {
    if (!fruitType || filledCount < 9) return;
    const evaluated = evaluateAll(fruitType as FruitType, values, variety);
    setResults(evaluated);
    setDecision(getDecision(evaluated));
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function handleDownload() {
    if (!fruitType || !decision) return;
    const text = generateReportText(
      fruitType as FruitType,
      variety,
      origin,
      buyerType,
      results,
      decision
    );
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `arrival-report-${fruitType.toLowerCase()}-${
      new Date().toISOString().slice(0, 10)
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    setStep(1);
    setFruitType("");
    setVariety("");
    setOrigin("");
    setBuyerType("");
    setValues({});
    setResults([]);
    setDecision(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getFieldStatus(
    field: FieldConfig,
    value: string
  ): "pass" | "fail" | "empty" {
    const result = field.passCheck(value, variety);
    if (result === null) return "empty";
    return result ? "pass" : "fail";
  }

  const fruitEmoji: Record<string, string> = {
    Citrus: "🍊",
    Grapes: "🍇",
    Stonefruit: "🍑",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Navbar ── */}
      <nav className="bg-[#0b0f1a] text-white px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg z-20 relative">
        <div className="flex items-center">
          <img
            src="/logo.png"
            alt="Axarat"
            className="h-8 w-auto mr-2.5"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span className="text-white font-black text-base tracking-tight">
            Axarat
          </span>
        </div>
        <span className="text-xs sm:text-sm font-bold text-slate-300 tracking-wide uppercase">
          Off-Spec Arrival Analyzer
        </span>
      </nav>

      {/* ── Hero ── */}
      <div className="bg-[#0b0f1a] text-white px-4 pb-8 pt-6 sm:pt-8 sm:pb-10 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-black mb-2.5 leading-tight">
            Does This Fruit Meet Your Arrival Standards?
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Enter your arrival inspection data below and get an instant Accept
            or Reject decision — with full justification.
          </p>
        </div>
      </div>

      {/* ── Step Indicator ── */}
      <StepIndicator step={step} />

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* ════════ STEP 1 ════════ */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
              <p className="text-xs font-black tracking-widest text-[#007a6b] uppercase mb-1">
                Step 1 of 2
              </p>
              <h2 className="text-lg font-bold text-[#0b0f1a] mb-5">
                Shipment Details
              </h2>

              <div className="space-y-5">
                {/* Fruit Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Fruit Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Citrus", "Grapes", "Stonefruit"] as FruitType[]).map(
                      (ft) => (
                        <button
                          key={ft}
                          onClick={() => {
                            setFruitType(ft);
                            setVariety("");
                          }}
                          className={`py-3.5 px-2 rounded-xl border-2 text-sm font-bold transition-all active:scale-[0.97] ${
                            fruitType === ft
                              ? "bg-[#0b0f1a] text-white border-[#0b0f1a] shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:border-[#0b0f1a] hover:text-[#0b0f1a]"
                          }`}
                        >
                          <span className="block text-xl mb-0.5">
                            {fruitEmoji[ft]}
                          </span>
                          {ft}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Stonefruit Variety */}
                {fruitType === "Stonefruit" && (
                  <div className="animate-report-in">
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Variety
                    </label>
                    <p className="text-xs text-gray-400 mb-2">
                      Required — affects Brix pass threshold
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {["Peaches/Nectarines", "Cherries", "Plums"].map((v) => (
                        <button
                          key={v}
                          onClick={() => setVariety(v)}
                          className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all active:scale-[0.97] leading-tight ${
                            variety === v
                              ? "bg-[#0b0f1a] text-white border-[#0b0f1a] shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:border-[#0b0f1a] hover:text-[#0b0f1a]"
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Origin */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Origin
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-3 text-sm bg-white focus:outline-none focus:border-[#0b0f1a] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Select country / region…</option>
                    {[
                      "Chile",
                      "Peru",
                      "Mexico",
                      "South Africa",
                      "Spain",
                      "California",
                      "Other",
                    ].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buyer Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Buyer Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Retail", "Foodservice", "Wholesale"] as const).map(
                      (bt) => (
                        <button
                          key={bt}
                          onClick={() => setBuyerType(bt)}
                          className={`py-3.5 px-2 rounded-xl border-2 text-sm font-bold transition-all active:scale-[0.97] ${
                            buyerType === bt
                              ? "bg-[#00e5c8] text-[#0b0f1a] border-[#00e5c8] shadow-sm"
                              : "bg-white text-gray-700 border-gray-200 hover:border-[#00e5c8] hover:text-[#0b0f1a]"
                          }`}
                        >
                          {bt}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleStartInspection}
              disabled={!step1Valid}
              className="w-full bg-[#00e5c8] hover:brightness-95 active:brightness-90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[#0b0f1a] font-black py-4 rounded-2xl text-base transition-all shadow-sm active:scale-[0.98]"
            >
              Start Inspection →
            </button>

            {!step1Valid && (
              <p className="text-center text-xs text-gray-400">
                Complete all fields above to continue
              </p>
            )}
          </div>
        )}

        {/* ════════ STEP 2 ════════ */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setStep(1);
                  setResults([]);
                  setDecision(null);
                }}
                className="text-[#0b0f1a] text-sm font-semibold hover:underline flex items-center gap-1"
              >
                ← Back
              </button>
              <div className="flex gap-1.5 flex-wrap justify-end max-w-[65%]">
                {[
                  fruitType,
                  variety,
                  origin,
                  buyerType,
                ]
                  .filter(Boolean)
                  .map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-100 text-[#0b0f1a] border border-slate-200 text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-sm">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <p className="text-xs font-black tracking-widest text-[#007a6b] uppercase mb-1">
                    Step 2 of 2
                  </p>
                  <h2 className="text-lg font-bold text-[#0b0f1a]">
                    Inspection Data
                  </h2>
                </div>
                <div className="text-right">
                  <span
                    className={`text-2xl font-black leading-none ${
                      filledCount === 9 ? "text-green-600" : "text-gray-700"
                    }`}
                  >
                    {filledCount}
                    <span className="text-base font-normal text-gray-400">
                      /9
                    </span>
                  </span>
                  <p className="text-xs text-gray-400">fields done</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-gray-200 rounded-full mb-5 overflow-hidden">
                <div
                  className="h-full bg-[#0b0f1a] rounded-full transition-all duration-400 ease-out"
                  style={{ width: `${(filledCount / 9) * 100}%` }}
                />
              </div>

              <div className="space-y-3">
                {fields.map((field, idx) => {
                  const val = values[field.id] ?? "";
                  const status = getFieldStatus(field, val);

                  return (
                    <div
                      key={field.id}
                      className={`bg-white rounded-xl p-4 border-2 transition-colors duration-200 ${
                        status === "pass"
                          ? "border-green-300"
                          : status === "fail"
                          ? "border-red-300"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <span className="text-xs font-black text-[#0b0f1a] bg-slate-100 rounded-md w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-gray-800">
                              {field.label}
                            </span>
                            {field.unit && (
                              <span className="text-gray-400 font-normal text-xs ml-1">
                                ({field.unit})
                              </span>
                            )}
                            <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                              Pass:{" "}
                              <span className="text-green-700 font-semibold">
                                {field.passDisplay}
                              </span>
                            </p>
                          </div>
                        </div>
                        {status !== "empty" && (
                          <span
                            className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-black ${
                              status === "pass"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {status === "pass" ? "✓ PASS" : "✗ FAIL"}
                          </span>
                        )}
                      </div>

                      {/* Input */}
                      {field.type === "number" ? (
                        <input
                          type="number"
                          step={field.step}
                          inputMode="decimal"
                          placeholder={field.placeholder}
                          value={val}
                          onChange={(e) =>
                            setValues((prev) => ({
                              ...prev,
                              [field.id]: e.target.value,
                            }))
                          }
                          className={`w-full border-2 rounded-lg px-3 py-2.5 text-sm focus:outline-none transition-colors ${
                            status === "pass"
                              ? "border-green-200 bg-green-50 focus:border-green-400"
                              : status === "fail"
                              ? "border-red-200 bg-red-50 focus:border-red-400"
                              : "border-gray-200 bg-white focus:border-[#0b0f1a]"
                          }`}
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {field.options?.map((opt) => {
                            const optResult = field.passCheck(opt, variety);
                            const isSelected = val === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() =>
                                  setValues((prev) => ({
                                    ...prev,
                                    [field.id]: opt,
                                  }))
                                }
                                className={`px-3 py-1.5 rounded-lg border-2 text-xs sm:text-sm font-semibold transition-all active:scale-[0.95] ${
                                  isSelected
                                    ? optResult
                                      ? "bg-green-600 text-white border-green-600 shadow-sm"
                                      : "bg-red-600 text-white border-red-600 shadow-sm"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleGenerateReport}
              disabled={filledCount < 9}
              className="w-full bg-[#00e5c8] hover:brightness-95 active:brightness-90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[#0b0f1a] font-black py-4 rounded-2xl text-base transition-all shadow-sm active:scale-[0.98]"
            >
              {filledCount < 9
                ? `${9 - filledCount} field${9 - filledCount > 1 ? "s" : ""} remaining…`
                : "Generate My Report →"}
            </button>
          </div>
        )}

        {/* ════════ REPORT ════════ */}
        {decision && results.length > 0 && (
          <div ref={reportRef} className="mt-8 animate-report-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-[#0b0f1a]">
                Arrival Inspection Report
              </h2>
              <div className="flex gap-1.5">
                {[fruitType, origin].filter(Boolean).map((tag) => (
                  <span
                    key={tag}
                    className="bg-slate-100 text-[#0b0f1a] border border-slate-200 text-xs font-semibold px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Decision Banner ── */}
            {decision === "ACCEPT" && (
              <div className="bg-green-600 text-white rounded-2xl p-5 sm:p-6 mb-5 text-center animate-banner-in shadow-lg">
                <div className="text-4xl sm:text-5xl font-black mb-1 tracking-tight">
                  ✓ ACCEPT
                </div>
                <div className="text-base sm:text-lg font-bold opacity-95 mb-1">
                  Fruit meets arrival standards
                </div>
                <div className="text-sm opacity-75">
                  {results.filter((r) => !r.pass).length === 0
                    ? "All 9 inspection points passed"
                    : "1 minor issue noted — within acceptance threshold"}
                </div>
              </div>
            )}

            {decision === "ACCEPT_WITH_CLAIM" && (
              <div className="bg-amber-500 text-white rounded-2xl p-5 sm:p-6 mb-5 text-center animate-banner-in shadow-lg">
                <div className="text-3xl sm:text-4xl font-black mb-1 tracking-tight">
                  ⚠ ACCEPT WITH CLAIM
                </div>
                <div className="text-base sm:text-lg font-bold opacity-95 mb-1">
                  Document issues and file claim
                </div>
                <div className="text-sm opacity-75">
                  {results.filter((r) => !r.pass).length} of 9 points failed —
                  claim is warranted before acceptance
                </div>
              </div>
            )}

            {decision === "REJECT" && (
              <div className="bg-red-600 text-white rounded-2xl p-5 sm:p-6 mb-5 text-center animate-banner-in shadow-lg">
                <div className="text-4xl sm:text-5xl font-black mb-1 tracking-tight">
                  ✗ REJECT
                </div>
                <div className="text-base sm:text-lg font-bold opacity-95 mb-1">
                  Fruit does not meet arrival standards
                </div>
                <div className="text-sm opacity-75">
                  {results.filter((r) => !r.pass).length} of 9 points failed —
                  exceeds maximum rejection threshold
                </div>
              </div>
            )}

            {/* ── Summary Table ── */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden mb-5 shadow-sm">
              <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-700">
                  Inspection Summary
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    {results.filter((r) => r.pass).length} Pass
                  </span>
                  <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                    {results.filter((r) => !r.pass).length} Fail
                  </span>
                </div>
              </div>
              {results.map((r, idx) => (
                <div
                  key={r.id}
                  className={`flex items-center justify-between px-4 py-3 border-b last:border-0 ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-bold text-gray-400 w-5 shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-gray-800">
                        {r.label}
                      </span>
                      {r.value && (
                        <span className="text-xs text-gray-500 ml-1.5 font-mono">
                          {r.value}
                          {r.unit ? ` ${r.unit}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 ml-2 px-2.5 py-0.5 rounded-full text-xs font-black ${
                      r.pass
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.pass ? "PASS" : "FAIL"}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Failed Points Detail ── */}
            {results.filter((r) => !r.pass).length > 0 && (
              <div className="mb-5">
                <h3 className="text-sm font-black text-red-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-black shrink-0">
                    !
                  </span>
                  Failed Points — Why It Matters &amp; What To Do
                </h3>
                <div className="space-y-3">
                  {results
                    .filter((r) => !r.pass)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="bg-red-50 rounded-xl p-4 border border-red-100"
                      >
                        <div className="font-black text-red-800 text-sm mb-1.5 flex items-start gap-2">
                          <span className="text-red-500 shrink-0">✗</span>
                          <span>
                            {r.label}
                            {r.value && (
                              <span className="font-normal text-red-500 text-xs ml-1.5">
                                — Recorded:{" "}
                                <span className="font-mono">
                                  {r.value}
                                  {r.unit ? ` ${r.unit}` : ""}
                                </span>
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-red-700 mb-3 leading-relaxed pl-5">
                          {r.failExplanation}
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-red-100 ml-5">
                          <p className="text-xs font-black text-[#0b0f1a] uppercase tracking-wide mb-1">
                            Recommended Action
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {r.failAction}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ── Download Button ── */}
            <button
              onClick={handleDownload}
              className="w-full bg-[#0b0f1a] hover:bg-slate-800 active:bg-slate-900 text-white font-black py-4 rounded-2xl text-base mb-4 flex items-center justify-center gap-2.5 transition-all shadow-sm active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v11m0 0l-3.5-3.5M12 15l3.5-3.5"
                />
              </svg>
              Download Arrival Report
            </button>

            {/* ── CTA Box ── */}
            <div className="bg-[#0b0f1a] text-white rounded-2xl p-5 sm:p-6 mb-5 border-l-4 border-[#00e5c8] shadow-sm">
              <p className="font-black text-[#00e5c8] text-base sm:text-lg mb-2">
                Need help building an arrival inspection protocol?
              </p>
              <p className="text-slate-200 text-sm leading-relaxed mb-4">
                Axarat gives fresh produce importers real-time visibility into
                their shipments, so problems show up before the rejection does.
                Reply to this email or visit{" "}
                <a
                  href="https://axarat.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#00e5c8] font-bold hover:brightness-125"
                >
                  axarat.com
                </a>
              </p>
              <a
                href="https://axarat.com/#contact"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#00e5c8] text-[#0b0f1a] font-black text-sm px-5 py-3 rounded-xl hover:brightness-95 active:scale-[0.98] transition-all"
              >
                Start your 15-day pilot →
              </a>
            </div>

            {/* ── Start Over ── */}
            <button
              onClick={handleReset}
              className="w-full border-2 border-gray-300 text-gray-600 font-bold py-3.5 rounded-2xl text-sm hover:border-[#0b0f1a] hover:text-[#0b0f1a] transition-all active:scale-[0.98]"
            >
              Start New Inspection
            </button>
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="mt-auto bg-[#0b0f1a] border-t border-slate-800 px-4 py-6 text-center">
        <img
          src="/logo.png"
          alt="Axarat"
          className="h-7 w-auto mx-auto mb-2 opacity-80"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <p className="text-xs text-slate-400 leading-relaxed">
          Powered by{" "}
          <span className="font-black text-white">Axarat</span> —
          Real-time visibility for fresh produce importers
        </p>
        <p className="text-xs text-slate-500 mt-1">
          &copy; {new Date().getFullYear()} Axarat. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
