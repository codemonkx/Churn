import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Search,
  Filter,
  ChevronRight,
  Info,
  Layers,
  Activity,
  ArrowUpRight,
  BarChart3,
  Users,
  Sliders,
  DollarSign,
  Clock,
  FileText,
} from "lucide-react";
import { PredictionResponse, ApiHealthStatus } from "@/types/prediction";
import { NavPage } from "@/components/Sidebar";
import { getTemplateDownloadUrl } from "@/lib/api";

interface OverviewViewProps {
  predictionData: PredictionResponse | null;
  healthStatus: ApiHealthStatus | null;
  onNavigate: (page: NavPage) => void;
  onLoadDemo: () => void;
  isLoadingDemo: boolean;
  activeFilename?: string;
}

// Illustrative Customer Sample for the Product Preview
interface SampleCustomer {
  id: string;
  tenure: number;
  contract: string;
  monthly: number;
  probability: number;
  outcome: "Likely to stay" | "Likely to cancel";
  riskTier: "Low" | "Medium" | "High";
  factors: string[];
}

const SAMPLE_PREVIEWS: SampleCustomer[] = [
  {
    id: "7590-VHVEG",
    tenure: 1,
    contract: "Month-to-month",
    monthly: 29.85,
    probability: 0.82,
    outcome: "Likely to cancel",
    riskTier: "High",
    factors: ["Month-to-month contract", "Tenure < 3 months", "Electronic check payment"],
  },
  {
    id: "3668-QPYBK",
    tenure: 34,
    contract: "One year",
    monthly: 53.85,
    probability: 0.14,
    outcome: "Likely to stay",
    riskTier: "Low",
    factors: ["Annual contract commitment", "Tenure > 24 months", "Active online security"],
  },
  {
    id: "9237-HQITU",
    tenure: 2,
    contract: "Month-to-month",
    monthly: 70.70,
    probability: 0.48,
    outcome: "Likely to stay",
    riskTier: "Medium",
    factors: ["Fiber optic connection", "No tech support add-on", "Paperless billing active"],
  },
  {
    id: "7795-CFOCW",
    tenure: 45,
    contract: "Two year",
    monthly: 42.30,
    probability: 0.22,
    outcome: "Likely to stay",
    riskTier: "Low",
    factors: ["Two-year contract loyalty", "Bank transfer autopay", "DSL stability"],
  },
  {
    id: "9305-CDSKC",
    tenure: 8,
    contract: "Month-to-month",
    monthly: 99.65,
    probability: 0.63,
    outcome: "Likely to cancel",
    riskTier: "High",
    factors: ["High monthly charges ($99+)", "Month-to-month term", "Fiber optic without device protection"],
  },
];

export const OverviewView: React.FC<OverviewViewProps> = ({
  predictionData,
  healthStatus,
  onNavigate,
  onLoadDemo,
  isLoadingDemo,
  activeFilename,
}) => {
  // Interactive state for Product Preview
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("7590-VHVEG");
  const [activeStepHover, setActiveStepHover] = useState<number | null>(null);
  const [previewFilter, setPreviewFilter] = useState<"all" | "stay" | "cancel">("all");

  const selectedCustomer =
    SAMPLE_PREVIEWS.find((c) => c.id === selectedCustomerId) || SAMPLE_PREVIEWS[0];

  const filteredPreviewList = SAMPLE_PREVIEWS.filter((item) => {
    if (previewFilter === "stay") return item.outcome === "Likely to stay";
    if (previewFilter === "cancel") return item.outcome === "Likely to cancel";
    return true;
  });

  const total = predictionData?.total_customers || 0;
  const stay = predictionData?.predicted_stay || 0;
  const cancel = predictionData?.predicted_churn || 0;
  const churnPct = total > 0 ? ((cancel / total) * 100).toFixed(1) : "0.0";

  const handleScrollToWorkflow = () => {
    const el = document.getElementById("workflow-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-16 max-w-7xl mx-auto pb-16">
      {/* ── 0. ACTIVE ANALYSIS BANNER (WHEN DATA HAS BEEN INGESTED) ── */}
      {predictionData && (
        <section className="bg-white rounded-2xl border border-[#5146E5]/30 p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-[#5146E5]/10 flex items-center justify-center text-[#5146E5] shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#159B70] uppercase tracking-wider">
                  Active Analysis Available
                </span>
                <span className="text-xs text-[#777D91]">|</span>
                <span className="text-xs font-mono text-[#777D91] truncate max-w-[200px]">
                  {activeFilename || "Customer Cohort"}
                </span>
              </div>
              <p className="text-sm font-display font-semibold text-[#151827]">
                {total.toLocaleString()} accounts evaluated &bull; {churnPct}% predicted churn ({cancel.toLocaleString()} at-risk accounts)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("intelligence")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-white transition-all cursor-pointer shadow-xs shrink-0"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Open Customer Intelligence</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      )}

      {/* ── 1. ASYMMETRIC HERO SECTION ── */}
      <section className="relative overflow-hidden rounded-3xl bg-white border border-[#E7E9F0] p-6 sm:p-10 lg:p-12 shadow-2xs">
        {/* Subtle technical background grid */}
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-grid-technical opacity-40 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (7 cols): Editorial Product Introduction */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono bg-[#F6F7FB] border border-[#E7E9F0] text-[#151827]">
              <span className="h-2 w-2 rounded-full bg-[#A3E635]" />
              <span className="font-semibold tracking-wide">AI-POWERED CUSTOMER RETENTION</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-bold text-[#151827] tracking-tight leading-[1.08]">
              Know your customers. <br />
              Predict <span className="text-[#5146E5]">what comes next.</span>
            </h1>

            <p className="text-base sm:text-lg text-[#777D91] leading-relaxed font-sans max-w-xl">
              Identify customers who may cancel their subscriptions before they leave. Turn customer data into actionable retention intelligence with Machine Learning.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                id="analyze-data-btn"
                onClick={() => onNavigate("ingestion")}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-white shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Analyze Customer Data</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleScrollToWorkflow}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-semibold bg-[#F6F7FB] hover:bg-white text-[#151827] border border-[#E7E9F0] hover:border-[#D5D9E2] transition-all cursor-pointer"
              >
                <span>Explore How It Works</span>
                <ChevronRight className="h-4 w-4 text-[#777D91]" />
              </button>
            </div>

            {/* Verification Telemetry */}
            <div className="pt-4 border-t border-[#E7E9F0] flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-[#777D91]">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#159B70]" />
                <span>Model: RandomForest (200 Trees)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#5146E5]" />
                <span>Calibrated Threshold: &tau;=0.57</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635]" />
                <span>Fast Batch Inference</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Custom Customer Churn Visualization */}
          <div className="lg:col-span-5 bg-[#F6F7FB] rounded-2xl border border-[#E7E9F0] p-6 shadow-inner space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7E9F0] pb-3">
              <div>
                <span className="text-[11px] font-mono text-[#777D91] uppercase tracking-wider block">
                  CHURN PROBABILITY MODEL
                </span>
                <span className="text-xs font-display font-bold text-[#151827]">
                  Subscriber Risk Distribution
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#5146E5]/10 text-[#5146E5] font-semibold">
                &tau; = 0.57 Cutoff
              </span>
            </div>

            {/* SVG Retention Distribution Bell Curves */}
            <div className="relative bg-white rounded-xl p-4 border border-[#E7E9F0] shadow-2xs">
              <div className="h-32 w-full">
                <svg
                  viewBox="0 0 320 120"
                  className="w-full h-full overflow-visible"
                  aria-label="Customer Retention vs Churn Probability Curves"
                >
                  <defs>
                    <linearGradient id="stayGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#159B70" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#159B70" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="churnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F04458" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#F04458" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Axis */}
                  <line x1="10" y1="105" x2="310" y2="105" stroke="#E7E9F0" strokeWidth="1.5" />

                  {/* Retained Distribution Curve (Peaked around 20%) */}
                  <path
                    d="M 10 105 Q 60 15, 110 50 T 210 105 L 10 105 Z"
                    fill="url(#stayGrad)"
                  />
                  <path
                    d="M 10 105 Q 60 15, 110 50 T 210 105"
                    fill="none"
                    stroke="#159B70"
                    strokeWidth="2.5"
                  />

                  {/* Churn Distribution Curve (Peaked around 75%) */}
                  <path
                    d="M 110 105 Q 210 35, 260 25 T 310 105 L 110 105 Z"
                    fill="url(#churnGrad)"
                  />
                  <path
                    d="M 110 105 Q 210 35, 260 25 T 310 105"
                    fill="none"
                    stroke="#F04458"
                    strokeWidth="2.5"
                  />

                  {/* Decision Threshold Line at x = 182 (approx 57%) */}
                  <line
                    x1="182"
                    y1="10"
                    x2="182"
                    y2="105"
                    stroke="#5146E5"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />

                  {/* Axis Tick Labels */}
                  <text x="12" y="118" fill="#777D91" fontSize="9" fontFamily="monospace">0%</text>
                  <text x="170" y="118" fill="#5146E5" fontSize="9" fontWeight="bold" fontFamily="monospace">57%</text>
                  <text x="290" y="118" fill="#777D91" fontSize="9" fontFamily="monospace">100%</text>

                  {/* Curve Annotations */}
                  <text x="50" y="45" fill="#159B70" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Likely to Stay</text>
                  <text x="215" y="45" fill="#F04458" fontSize="9" fontWeight="bold" fontFamily="sans-serif">Likely to Cancel</text>
                </svg>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#777D91] pt-2 border-t border-[#E7E9F0]">
                <span>Retention Horizon: 0%</span>
                <span className="text-[#5146E5] font-semibold">&tau; = 0.57 Decision Boundary</span>
                <span>Cancellation Risk: 100%</span>
              </div>
            </div>

            {/* Interactive Sample Customer Nodes */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#777D91] block">
                Illustrative Account Markers
              </span>

              <div className="grid grid-cols-1 gap-2">
                <div className="bg-white rounded-xl p-3 border border-[#E7E9F0] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#F04458]" />
                    <span className="font-mono text-xs font-semibold text-[#151827]">#7590-VHVEG</span>
                    <span className="text-[10px] text-[#777D91] font-mono">1 mo &bull; Month-to-month</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#F04458]">82% Churn</span>
                    <span className="text-[10px] text-[#F04458] block font-medium">Likely to cancel</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 border border-[#E7E9F0] flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#159B70]" />
                    <span className="font-mono text-xs font-semibold text-[#151827]">#3668-QPYBK</span>
                    <span className="text-[10px] text-[#777D91] font-mono">34 mos &bull; One year</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-[#159B70]">14% Churn</span>
                    <span className="text-[10px] text-[#159B70] block font-medium">Likely to stay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PRODUCT PREVIEW SECTION ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777D91]">
              PRODUCT DEMONSTRATION // INTELLIGENCE WORKSPACE
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#151827]">
              From customer records to retention intelligence.
            </h2>
            <p className="text-xs sm:text-sm text-[#777D91] leading-relaxed">
              Every uploaded customer row is mapped to an individualized churn probability, a risk tier classification, and key underlying subscription risk attributes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("ingestion")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-white shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Upload Your Customer Data</span>
          </button>
        </div>

        {/* High-Fidelity Interactive Table Mockup */}
        <div className="bg-white rounded-3xl border border-[#E7E9F0] shadow-2xs overflow-hidden">
          {/* Mockup Toolbar */}
          <div className="p-4 sm:p-5 border-b border-[#E7E9F0] flex flex-wrap items-center justify-between gap-3 bg-[#FAFAFC]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#159B70]" />
              <span className="text-xs font-mono font-semibold text-[#151827]">
                Customer Intelligence Table
              </span>
              <span className="text-xs text-[#777D91]">|</span>
              <span className="text-xs font-mono text-[#777D91]">
                Illustrative Cohort Preview
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#E7E9F0] text-xs font-mono">
              <button
                type="button"
                onClick={() => setPreviewFilter("all")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  previewFilter === "all"
                    ? "bg-[#151827] text-white font-semibold"
                    : "text-[#777D91] hover:text-[#151827]"
                }`}
              >
                All (5)
              </button>
              <button
                type="button"
                onClick={() => setPreviewFilter("stay")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  previewFilter === "stay"
                    ? "bg-[#159B70] text-white font-semibold"
                    : "text-[#777D91] hover:text-[#159B70]"
                }`}
              >
                Stay (3)
              </button>
              <button
                type="button"
                onClick={() => setPreviewFilter("cancel")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  previewFilter === "cancel"
                    ? "bg-[#F04458] text-white font-semibold"
                    : "text-[#777D91] hover:text-[#F04458]"
                }`}
              >
                Cancel (2)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E7E9F0]">
            {/* Table Area (8 cols) */}
            <div className="lg:col-span-8 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F6F7FB] border-b border-[#E7E9F0] text-[#777D91] font-mono uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Customer ID</th>
                    <th className="py-3 px-3 font-semibold">Tenure</th>
                    <th className="py-3 px-3 font-semibold">Contract</th>
                    <th className="py-3 px-3 font-semibold">Monthly</th>
                    <th className="py-3 px-4 font-semibold">Churn Probability</th>
                    <th className="py-3 px-3 font-semibold">Predicted Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9F0]">
                  {filteredPreviewList.map((row) => {
                    const isSelected = selectedCustomer.id === row.id;
                    const isCancel = row.outcome === "Likely to cancel";

                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedCustomerId(row.id)}
                        className={`hover:bg-[#F6F7FB]/80 transition-colors cursor-pointer ${
                          isSelected ? "bg-[#5146E5]/5" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#151827]">
                          <div className="flex items-center gap-2">
                            {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-[#5146E5]" />}
                            <span>{row.id}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[#777D91]">
                          {row.tenure} mo{row.tenure > 1 ? "s" : ""}
                        </td>
                        <td className="py-3.5 px-3 font-sans text-[#151827]">
                          {row.contract}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-[#151827] font-medium">
                          ${row.monthly.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="space-y-1 max-w-[120px]">
                            <div className="flex justify-between text-[11px] font-mono">
                              <span className={isCancel ? "text-[#F04458] font-bold" : "text-[#159B70] font-bold"}>
                                {(row.probability * 100).toFixed(0)}%
                              </span>
                              <span className="text-[#777D91] text-[10px]">
                                {row.riskTier} Risk
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-[#E7E9F0] rounded-full overflow-hidden">
                              <div
                                style={{ width: `${row.probability * 100}%` }}
                                className={`h-full rounded-full ${
                                  isCancel ? "bg-[#F04458]" : "bg-[#159B70]"
                                }`}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                              isCancel
                                ? "bg-rose-50 border-rose-200 text-rose-800"
                                : "bg-emerald-50 border-emerald-200 text-emerald-800"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isCancel ? "bg-[#F04458]" : "bg-[#159B70]"
                              }`}
                            />
                            <span>{row.outcome}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Customer 360 Dossier Teaser (4 cols) */}
            <div className="lg:col-span-4 p-5 sm:p-6 bg-[#FAFAFC] flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#777D91] uppercase tracking-wider">
                    SUBSCRIBER DOSSIER
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      selectedCustomer.outcome === "Likely to cancel"
                        ? "bg-[#F04458]/10 text-[#F04458]"
                        : "bg-[#159B70]/10 text-[#159B70]"
                    }`}
                  >
                    {selectedCustomer.riskTier} Risk Category
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-mono font-bold text-[#151827]">
                    {selectedCustomer.id}
                  </h3>
                  <p className="text-xs text-[#777D91]">
                    Predicted Churn Probability:{" "}
                    <strong className="text-[#151827]">
                      {(selectedCustomer.probability * 100).toFixed(0)}%
                    </strong>
                  </p>
                </div>

                <div className="bg-white rounded-xl p-3.5 border border-[#E7E9F0] space-y-2 text-xs">
                  <div className="flex justify-between text-[#777D91]">
                    <span>Contract Commitment:</span>
                    <span className="font-semibold text-[#151827]">{selectedCustomer.contract}</span>
                  </div>
                  <div className="flex justify-between text-[#777D91]">
                    <span>Tenure Duration:</span>
                    <span className="font-semibold text-[#151827]">{selectedCustomer.tenure} month(s)</span>
                  </div>
                  <div className="flex justify-between text-[#777D91]">
                    <span>Monthly Billing:</span>
                    <span className="font-semibold text-[#151827]">${selectedCustomer.monthly.toFixed(2)}/mo</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-semibold text-[#777D91] uppercase">
                    Detected Subscription Signals
                  </span>
                  <div className="space-y-1.5">
                    {selectedCustomer.factors.map((factor, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-[#151827] bg-white px-2.5 py-1.5 rounded-lg border border-[#E7E9F0]"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#5146E5]" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E7E9F0] text-center">
                <span className="text-[10px] font-mono text-[#777D91]">
                  Click rows to preview subscriber dossiers
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. HOW IT WORKS — INTERACTIVE STORYTELLING ── */}
      <section id="workflow-section" className="space-y-8 scroll-mt-20">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777D91]">
            02 // END-TO-END PIPELINE
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#151827]">
            Simple input. Intelligent predictions.
          </h2>
          <p className="text-xs sm:text-sm text-[#777D91] max-w-2xl leading-relaxed">
            A seamless four-step architecture transforming raw subscriber CSV data into actionable retention intelligence.
          </p>
        </div>

        {/* Connected Horizontal Workflow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* Step 01 */}
          <div
            onMouseEnter={() => setActiveStepHover(1)}
            onMouseLeave={() => setActiveStepHover(null)}
            className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-2xs space-y-4 flex flex-col justify-between ${
              activeStepHover === 1
                ? "border-[#5146E5] ring-2 ring-[#5146E5]/10"
                : "border-[#E7E9F0]"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-display font-bold text-[#5146E5]">
                  01
                </span>
                <div className="h-9 w-9 rounded-xl bg-[#5146E5]/10 text-[#5146E5] flex items-center justify-center">
                  <UploadCloud className="h-5 w-5" />
                </div>
              </div>

              <h3 className="text-base font-display font-bold text-[#151827]">
                Upload Customer Data
              </h3>

              <p className="text-xs text-[#777D91] leading-relaxed">
                Users upload their customer subscription CSV directly into the workspace, including contract terms, charges, and subscribed services.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E7E9F0] text-[11px] font-mono text-[#5146E5] font-semibold flex items-center justify-between">
              <span>CSV Ingestion</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Step 02 */}
          <div
            onMouseEnter={() => setActiveStepHover(2)}
            onMouseLeave={() => setActiveStepHover(null)}
            className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-2xs space-y-4 flex flex-col justify-between ${
              activeStepHover === 2
                ? "border-[#5146E5] ring-2 ring-[#5146E5]/10"
                : "border-[#E7E9F0]"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-display font-bold text-[#5146E5]">
                  02
                </span>
                <div className="h-9 w-9 rounded-xl bg-[#5146E5]/10 text-[#5146E5] flex items-center justify-center">
                  <Sliders className="h-5 w-5" />
                </div>
              </div>

              <h3 className="text-base font-display font-bold text-[#151827]">
                Validate and Prepare
              </h3>

              <p className="text-xs text-[#777D91] leading-relaxed">
                The system validates the CSV schema, verifies required feature columns, and handles categorical encoding and normalization.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E7E9F0] text-[11px] font-mono text-[#5146E5] font-semibold flex items-center justify-between">
              <span>Feature Validation</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Step 03 */}
          <div
            onMouseEnter={() => setActiveStepHover(3)}
            onMouseLeave={() => setActiveStepHover(null)}
            className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-2xs space-y-4 flex flex-col justify-between ${
              activeStepHover === 3
                ? "border-[#5146E5] ring-2 ring-[#5146E5]/10"
                : "border-[#E7E9F0]"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-display font-bold text-[#5146E5]">
                  03
                </span>
                <div className="h-9 w-9 rounded-xl bg-[#5146E5]/10 text-[#5146E5] flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
              </div>

              <h3 className="text-base font-display font-bold text-[#151827]">
                Predict Churn Risk
              </h3>

              <p className="text-xs text-[#777D91] leading-relaxed">
                The trained Machine Learning model evaluates customer records and generates calibrated probabilities against a calibrated 0.57 threshold.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E7E9F0] text-[11px] font-mono text-[#5146E5] font-semibold flex items-center justify-between">
              <span>ML Model Inference</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Step 04 */}
          <div
            onMouseEnter={() => setActiveStepHover(4)}
            onMouseLeave={() => setActiveStepHover(null)}
            className={`bg-white rounded-2xl p-6 border transition-all duration-200 shadow-2xs space-y-4 flex flex-col justify-between ${
              activeStepHover === 4
                ? "border-[#159B70] ring-2 ring-[#159B70]/10"
                : "border-[#E7E9F0]"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-display font-bold text-[#159B70]">
                  04
                </span>
                <div className="h-9 w-9 rounded-xl bg-[#159B70]/10 text-[#159B70] flex items-center justify-center">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </div>

              <h3 className="text-base font-display font-bold text-[#151827]">
                Explore Intelligence
              </h3>

              <p className="text-xs text-[#777D91] leading-relaxed">
                Users review customer-level predictions, probability scores, risk classifications, and export actionable retention reports for outreach.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E7E9F0] text-[11px] font-mono text-[#159B70] font-semibold flex items-center justify-between">
              <span>Retention Strategy</span>
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CUSTOMER RISK EXPLORER PREVIEW ── */}
      <section className="bg-white rounded-3xl border border-[#E7E9F0] p-6 sm:p-10 shadow-2xs space-y-8">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777D91]">
            03 // RISK SEGMENTATION FRAMEWORK
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#151827]">
            Not every customer has the same risk.
          </h2>
          <p className="text-xs sm:text-sm text-[#777D91] max-w-2xl leading-relaxed">
            Rather than treating churn as an all-or-nothing event, ChurnPredict segments accounts into three distinct risk tiers based on model probabilities.
          </p>
        </div>

        {/* The Three Risk Categories Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Low Risk */}
          <div className="bg-[#F6F7FB] rounded-2xl p-6 border border-[#E7E9F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#159B70] uppercase tracking-wider">
                LOW RISK COHORT
              </span>
              <span className="text-xs font-mono text-[#777D91] bg-white px-2 py-0.5 rounded-md border border-[#E7E9F0]">
                0% &ndash; 35%
              </span>
            </div>
            <h3 className="text-lg font-display font-bold text-[#151827]">
              Stable Subscribers
            </h3>
            <p className="text-xs text-[#777D91] leading-relaxed">
              Customers with relatively low predicted churn probability. Typically characterized by long-term contract agreements, multi-service adoption, and stable payment histories.
            </p>
          </div>

          {/* Medium Risk */}
          <div className="bg-[#F6F7FB] rounded-2xl p-6 border border-[#E7E9F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#D97706] uppercase tracking-wider">
                MEDIUM RISK COHORT
              </span>
              <span className="text-xs font-mono text-[#777D91] bg-white px-2 py-0.5 rounded-md border border-[#E7E9F0]">
                35% &ndash; 57%
              </span>
            </div>
            <h3 className="text-lg font-display font-bold text-[#151827]">
              Watchlist Accounts
            </h3>
            <p className="text-xs text-[#777D91] leading-relaxed">
              Customers with moderate predicted churn probability. While below the cancellation cutoff, these accounts exhibit vulnerability signals that warrant proactive service check-ins.
            </p>
          </div>

          {/* High Risk */}
          <div className="bg-[#F6F7FB] rounded-2xl p-6 border border-[#E7E9F0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-[#F04458] uppercase tracking-wider">
                HIGH RISK COHORT
              </span>
              <span className="text-xs font-mono text-[#777D91] bg-white px-2 py-0.5 rounded-md border border-[#E7E9F0]">
                &gt; 57% Threshold
              </span>
            </div>
            <h3 className="text-lg font-display font-bold text-[#151827]">
              Urgent Churn Hazard
            </h3>
            <p className="text-xs text-[#777D91] leading-relaxed">
              Customers with high predicted churn probability crossing the decision boundary. Require immediate retention offers, contract renewal incentives, or account manager intervention.
            </p>
          </div>
        </div>

        {/* Visual Probability Spectrum from 0% to 100% */}
        <div className="space-y-4 pt-4 border-t border-[#E7E9F0]">
          <div className="flex items-center justify-between text-xs font-mono text-[#777D91]">
            <span className="font-semibold text-[#159B70]">0% (Protected)</span>
            <span className="font-semibold text-[#D97706]">35% (Watchlist)</span>
            <span className="font-bold text-[#5146E5]">&tau; = 57% (Decision Threshold)</span>
            <span className="font-semibold text-[#F04458]">100% (High Churn)</span>
          </div>

          {/* Gradient Spectrum Bar with Pin Markers */}
          <div className="relative h-6 rounded-full bg-gradient-to-r from-[#159B70] via-[#D97706] to-[#F04458] p-0.5 shadow-inner">
            {/* Threshold Vertical Marker Line */}
            <div
              style={{ left: "57%" }}
              className="absolute top-0 bottom-0 w-1 bg-white shadow-md z-10"
              title="Calibrated Cutoff (57%)"
            />

            {/* Pinned Customer 1: 14% */}
            <div
              style={{ left: "14%" }}
              className="absolute -top-3 -translate-x-1/2 z-20"
              title="#3668-QPYBK: 14% Low Risk"
            >
              <div className="h-12 w-0.5 bg-[#151827] mx-auto opacity-40" />
              <div className="bg-[#151827] text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                #3668 (14%)
              </div>
            </div>

            {/* Pinned Customer 2: 48% */}
            <div
              style={{ left: "48%" }}
              className="absolute -bottom-8 -translate-x-1/2 z-20"
              title="#9237-HQITU: 48% Medium Risk"
            >
              <div className="bg-[#151827] text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                #9237 (48%)
              </div>
              <div className="h-3 w-0.5 bg-[#151827] mx-auto opacity-40" />
            </div>

            {/* Pinned Customer 3: 82% */}
            <div
              style={{ left: "82%" }}
              className="absolute -top-3 -translate-x-1/2 z-20"
              title="#7590-VHVEG: 82% High Risk"
            >
              <div className="h-12 w-0.5 bg-[#151827] mx-auto opacity-40" />
              <div className="bg-[#F04458] text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap font-bold">
                #7590 (82%)
              </div>
            </div>
          </div>

          <div className="pt-6 text-xs text-[#777D91] bg-[#F6F7FB] p-3.5 rounded-xl border border-[#E7E9F0] flex items-start gap-2.5">
            <Info className="h-4 w-4 text-[#5146E5] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Statistical Guidance:</strong> Risk classifications are derived from calibrated statistical likelihood and configurable decision boundaries (&tau;=0.57). Model probabilities represent risk propensity, not a guaranteed customer cancellation.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. WHY CUSTOMER CHURN PREDICTION MATTERS (EDITORIAL SPLIT) ── */}
      <section className="space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777D91]">
            04 // BUSINESS IMPACT
          </span>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#151827]">
            Keeping a customer starts with understanding risk.
          </h2>
        </div>

        {/* Editorial Split Composition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: The Problem — Reactive Retention */}
          <div className="bg-white rounded-3xl border border-[#F04458]/20 p-6 sm:p-8 space-y-4 shadow-2xs relative overflow-hidden">
            <div className="h-1.5 w-full bg-[#F04458] absolute top-0 left-0" />

            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-[#F04458]/10 text-[#F04458] flex items-center justify-center shrink-0">
                <TrendingDown className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#F04458] font-bold uppercase tracking-wider">
                  THE STATUS QUO
                </span>
                <h3 className="text-lg font-display font-bold text-[#151827]">
                  Reactive Churn Management
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#777D91] leading-relaxed">
              Most subscription businesses only learn a subscriber is leaving when they trigger a cancellation request or remove their payment method.
            </p>

            <ul className="space-y-2.5 text-xs text-[#151827]">
              <li className="flex items-start gap-2">
                <span className="text-[#F04458] font-bold">&times;</span>
                <span>Lost monthly recurring revenue (MRR) without warning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F04458] font-bold">&times;</span>
                <span>Exit surveys capture feedback after the customer has already decided to leave.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#F04458] font-bold">&times;</span>
                <span>Win-back campaigns suffer from poor conversion once churn has occurred.</span>
              </li>
            </ul>
          </div>

          {/* Right: The Opportunity — Predictive Retention */}
          <div className="bg-white rounded-3xl border border-[#159B70]/20 p-6 sm:p-8 space-y-4 shadow-2xs relative overflow-hidden">
            <div className="h-1.5 w-full bg-[#159B70] absolute top-0 left-0" />

            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-[#159B70]/10 text-[#159B70] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#159B70] font-bold uppercase tracking-wider">
                  THE CHURNPREDICT WAY
                </span>
                <h3 className="text-lg font-display font-bold text-[#151827]">
                  Predictive Retention Intelligence
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#777D91] leading-relaxed">
              Subscription behavior, contract structure, and service usage leave subtle early signals that machine learning detects weeks in advance.
            </p>

            <ul className="space-y-2.5 text-xs text-[#151827]">
              <li className="flex items-start gap-2">
                <span className="text-[#159B70] font-bold">&check;</span>
                <span>Prioritize high-risk, high-value accounts before cancellation occurs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#159B70] font-bold">&check;</span>
                <span>Deploy targeted renewal discounts, plan adjustments, or customer success outreach.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#159B70] font-bold">&check;</span>
                <span>Preserve recurring revenue and improve customer lifetime value (LTV).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CALL TO ACTION (LIGHT THEME) ── */}
      <section className="bg-white rounded-3xl border border-[#E7E9F0] p-8 sm:p-12 shadow-2xs text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#5146E5] font-semibold">
            GET STARTED TODAY
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-[#151827] tracking-tight">
            Ready to understand your customer churn?
          </h2>
          <p className="text-xs sm:text-sm text-[#777D91] leading-relaxed">
            Upload your customer records and discover which accounts may be at risk.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            type="button"
            onClick={() => onNavigate("ingestion")}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-white shadow-xs transition-all cursor-pointer"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Start Customer Analysis</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <a
            href={getTemplateDownloadUrl("sample")}
            download="sample_customers_cohort.csv"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-semibold bg-[#F6F7FB] hover:bg-white text-[#151827] border border-[#E7E9F0] hover:border-[#D5D9E2] transition-all cursor-pointer"
          >
            <Download className="h-4 w-4 text-[#5146E5]" />
            <span>Download Sample CSV</span>
          </a>
        </div>
      </section>
    </div>
  );
};
