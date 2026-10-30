import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Database,
  SearchCheck,
  Activity,
  Sliders,
} from "lucide-react";
import { PredictionResponse, PredictionRecord } from "@/types/prediction";
import { PredictionBadge } from "@/components/PredictionBadge";
import { CustomerDetailModal } from "@/components/CustomerDetailModal";
import { downloadExportedCsv } from "@/lib/api";
import { NavPage } from "@/components/Sidebar";

interface PredictionResultsViewProps {
  predictionData: PredictionResponse | null;
  onNavigate: (page: NavPage) => void;
  onReset: () => void;
  onLoadDemo?: () => void;
  isLoadingDemo?: boolean;
}

type SortField = "churn_probability" | "MonthlyCharges" | "tenure" | "customerID";
type SortDirection = "asc" | "desc";
type RiskTierFilter = "all" | "critical" | "watchlist" | "low";

export const PredictionResultsView: React.FC<PredictionResultsViewProps> = ({
  predictionData,
  onNavigate,
  onReset,
  onLoadDemo,
  isLoadingDemo,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Stay" | "Cancel">("All");
  const [riskFilter, setRiskFilter] = useState<RiskTierFilter>("all");
  const [sortField, setSortField] = useState<SortField>("churn_probability");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [selectedCustomer, setSelectedCustomer] = useState<PredictionRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const results = predictionData?.results || [];
  const threshold = predictionData?.threshold || 0.57;

  // Filter and Sort records
  const filteredAndSortedRecords = useMemo(() => {
    let list = results.filter((record) => {
      // Search by Customer ID
      if (
        searchTerm.trim() &&
        !record.customerID.toLowerCase().includes(searchTerm.toLowerCase().trim())
      ) {
        return false;
      }

      // Status filter
      if (statusFilter === "Stay" && record.prediction !== "Likely to stay") {
        return false;
      }
      if (statusFilter === "Cancel" && record.prediction !== "Likely to cancel") {
        return false;
      }

      // Risk Tier filter
      if (riskFilter === "critical" && record.churn_probability <= threshold) {
        return false;
      }
      if (
        riskFilter === "watchlist" &&
        (record.churn_probability <= 0.35 || record.churn_probability > threshold)
      ) {
        return false;
      }
      if (riskFilter === "low" && record.churn_probability > 0.35) {
        return false;
      }

      return true;
    });

    // Sort
    list.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (valA === undefined || valA === null) valA = 0;
      if (valB === undefined || valB === null) valB = 0;

      if (typeof valA === "string") {
        return sortDirection === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [results, searchTerm, statusFilter, riskFilter, sortField, sortDirection, threshold]);

  // Pagination calculation
  const totalRecords = filteredAndSortedRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRecords.slice(start, start + pageSize);
  }, [filteredAndSortedRecords, currentPage, pageSize]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleExport = async () => {
    if (!results || results.length === 0 || isExporting) return;
    setIsExporting(true);
    try {
      await downloadExportedCsv(results);
    } catch (err) {
      console.error("Export failed:", err);
      // Fallback client-side CSV download
      const headers = Object.keys(results[0]).join(",");
      const rows = results.map((r) => Object.values(r).join(",")).join("\n");
      const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "churn_prediction_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  // ── REDESIGNED ENGAGING ONBOARDING EMPTY STATE (WHEN NO PREDICTIONS EXIST) ──
  if (!predictionData || results.length === 0) {
    return (
      <div className="space-y-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777D91]">
              CUSTOMER INTELLIGENCE // AWAITING COHORT DATA
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#151827] tracking-tight">
            Customer Intelligence
          </h2>
          <p className="text-sm text-[#777D91]">
            Discover customers at risk and understand their predicted subscription outcomes.
          </p>
        </div>

        {/* Full-Width Onboarding Hero Card */}
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-8 sm:p-12 shadow-2xs space-y-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#F6F7FB] border border-[#E7E9F0] text-[#151827]">
              <span className="h-2 w-2 rounded-full bg-[#D97706]" />
              <span>Awaiting Customer Records</span>
            </div>

            <h3 className="text-2xl font-display font-bold text-[#151827]">
              No Customer Prediction Records Available
            </h3>
            <p className="text-sm text-[#777D91] leading-relaxed">
              To unlock customer intelligence, upload a CSV dataset containing subscriber records. The prediction engine will score each account, quantify churn risk, and categorize customers into actionable retention tiers.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => onNavigate("ingestion")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-white shadow-xs transition-all cursor-pointer"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Ingest Customer Dataset</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {onLoadDemo && (
                <button
                  type="button"
                  onClick={onLoadDemo}
                  disabled={isLoadingDemo}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-[#F6F7FB] hover:bg-white text-[#151827] border border-[#E7E9F0] hover:border-[#D5D9E2] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-[#5146E5]" />
                  <span>{isLoadingDemo ? "Evaluating Demo..." : "Explore Demo Dataset (25 Accounts)"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Workflow to get started */}
          <div className="pt-6 border-t border-[#E7E9F0] space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777D91] block">
              Workflow to Generate Customer Intelligence
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#F6F7FB] rounded-xl p-4 border border-[#E7E9F0] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#5146E5]">
                  <Database className="h-4 w-4" />
                  <span>01 // Ingest CSV</span>
                </div>
                <p className="text-xs text-[#777D91] leading-relaxed">
                  Upload subscriber records with standard contract, billing, and service fields.
                </p>
              </div>

              <div className="bg-[#F6F7FB] rounded-xl p-4 border border-[#E7E9F0] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#5146E5]">
                  <SearchCheck className="h-4 w-4" />
                  <span>02 // Validate Schema</span>
                </div>
                <p className="text-xs text-[#777D91] leading-relaxed">
                  Automatic client-side column verification and median/mode imputation.
                </p>
              </div>

              <div className="bg-[#F6F7FB] rounded-xl p-4 border border-[#E7E9F0] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#5146E5]">
                  <Activity className="h-4 w-4" />
                  <span>03 // Calibrated Scoring</span>
                </div>
                <p className="text-xs text-[#777D91] leading-relaxed">
                  Ensemble trees calculate per-account churn probabilities at threshold τ = 0.57.
                </p>
              </div>

              <div className="bg-[#F6F7FB] rounded-xl p-4 border border-[#E7E9F0] space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#5146E5]">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>04 // Actionable Report</span>
                </div>
                <p className="text-xs text-[#777D91] leading-relaxed">
                  Filter at-risk cohorts, inspect 360 customer profiles, and export CSV reports.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stayPct = ((predictionData.predicted_stay / (predictionData.total_customers || 1)) * 100).toFixed(1);
  const churnPct = ((predictionData.predicted_churn / (predictionData.total_customers || 1)) * 100).toFixed(1);

  // Risk Segmentation counts
  const lowRiskAccounts = results.filter((r) => r.churn_probability <= 0.35).length;
  const mediumRiskAccounts = results.filter(
    (r) => r.churn_probability > 0.35 && r.churn_probability <= threshold
  ).length;
  const highRiskAccounts = results.filter((r) => r.churn_probability > threshold).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777D91]">
              CUSTOMER INTELLIGENCE WORKSPACE // SCORED COHORT
            </span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#151827] tracking-tight">
            Customer Intelligence
          </h2>
          <p className="text-sm text-[#777D91]">
            Discover customers at risk and understand their predicted subscription outcomes.
          </p>
        </div>

        {/* Global Export & Reset Actions */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-[#777D91] hover:text-[#151827] bg-white border border-[#E7E9F0] hover:bg-[#F6F7FB] transition-all cursor-pointer"
            title="Upload and evaluate another cohort"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          <button
            id="export-csv-btn"
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExporting ? "Exporting Report..." : "Export Prediction Report"}</span>
          </button>
        </div>
      </div>

      {/* ── CUSTOMER RISK OVERVIEW (INTEGRATED INTELLIGENCE STRIP) ── */}
      <div className="bg-white rounded-2xl border border-[#E7E9F0] p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E7E9F0]">
          {/* Total Customers */}
          <div className="space-y-1 pt-2 md:pt-0">
            <span className="text-[11px] font-mono text-[#777D91] uppercase tracking-wider block">
              Total Customers Analyzed
            </span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#151827]">
              {predictionData.total_customers.toLocaleString()}
            </div>
            <span className="text-[11px] font-mono text-[#777D91] block">
              100% Cohort Ingested
            </span>
          </div>

          {/* Likely to Stay */}
          <div className="space-y-1 pt-2 md:pt-0 md:pl-6">
            <span className="text-[11px] font-mono text-[#777D91] uppercase tracking-wider block">
              Likely to Stay
            </span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#159B70]">
              {predictionData.predicted_stay.toLocaleString()}
            </div>
            <span className="text-[11px] font-mono text-[#159B70] block">
              {stayPct}% Retained
            </span>
          </div>

          {/* Likely to Cancel */}
          <div className="space-y-1 pt-2 md:pt-0 md:pl-6">
            <span className="text-[11px] font-mono text-[#777D91] uppercase tracking-wider block">
              Likely to Cancel
            </span>
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#F04458]">
              {predictionData.predicted_churn.toLocaleString()}
            </div>
            <span className="text-[11px] font-mono text-[#F04458] block">
              {churnPct}% Churn Risk
            </span>
          </div>

          {/* Predicted Churn Percentage with progress indicator */}
          <div className="space-y-1 pt-2 md:pt-0 md:pl-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#777D91] uppercase tracking-wider">
                Predicted Churn Rate
              </span>
              <span className="text-[10px] font-mono text-[#777D91]">
                Cutoff τ={threshold}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-display font-bold text-[#151827]">
              {churnPct}%
            </div>
            <div className="w-full h-1.5 bg-[#F6F7FB] rounded-full overflow-hidden border border-[#E7E9F0]">
              <div
                style={{ width: `${churnPct}%` }}
                className="h-full bg-[#F04458] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── RISK SEGMENTATION TIERS & ML PROBABILITY DISCLAIMER ── */}
      <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-display font-bold text-[#151827]">
              Customer Risk Segmentation Tiers
            </h3>
            <p className="text-xs text-[#777D91]">
              Categorized into defined risk probability bands for targeted retention workflows
            </p>
          </div>
          <span className="text-[11px] font-mono text-[#5146E5] bg-[#5146E5]/10 px-2.5 py-1 rounded-full self-start sm:self-auto">
            Configured Cutoff τ = {threshold}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Low Risk */}
          <div className="bg-[#F6F7FB] rounded-xl p-4 border border-[#E7E9F0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#159B70] font-bold">LOW RISK</span>
              <span className="text-[10px] font-mono text-[#777D91]">&le; 35% probability</span>
            </div>
            <div className="text-2xl font-display font-bold text-[#151827]">
              {lowRiskAccounts.toLocaleString()}{" "}
              <span className="text-xs font-sans text-[#777D91] font-normal">
                ({((lowRiskAccounts / (results.length || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-[11px] text-[#777D91]">
              Healthy subscribers; standard relationship maintenance
            </p>
          </div>

          {/* Medium Risk */}
          <div className="bg-[#F6F7FB] rounded-xl p-4 border border-[#E7E9F0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#D97706] font-bold">MEDIUM RISK</span>
              <span className="text-[10px] font-mono text-[#777D91]">35% - 57% probability</span>
            </div>
            <div className="text-2xl font-display font-bold text-[#151827]">
              {mediumRiskAccounts.toLocaleString()}{" "}
              <span className="text-xs font-sans text-[#777D91] font-normal">
                ({((mediumRiskAccounts / (results.length || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-[11px] text-[#777D91]">
              Watchlist accounts showing early risk markers
            </p>
          </div>

          {/* High Risk */}
          <div className="bg-[#F6F7FB] rounded-xl p-4 border border-[#E7E9F0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#F04458] font-bold">HIGH RISK</span>
              <span className="text-[10px] font-mono text-[#777D91]">&gt; 57% cutoff</span>
            </div>
            <div className="text-2xl font-display font-bold text-[#151827]">
              {highRiskAccounts.toLocaleString()}{" "}
              <span className="text-xs font-sans text-[#777D91] font-normal">
                ({((highRiskAccounts / (results.length || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
            <p className="text-[11px] text-[#777D91]">
              Accounts flagged for immediate proactive outreach
            </p>
          </div>
        </div>

        {/* Clear Disclaimer: Probability as Prediction, Not Certainty */}
        <div className="p-3 bg-[#F6F7FB] rounded-xl border border-[#E7E9F0] flex items-start gap-2.5 text-xs text-[#777D91]">
          <Info className="h-4 w-4 text-[#5146E5] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Predictive Model Notice:</strong> These classifications represent model-estimated likelihoods based on subscriber tenure, contract types, charges, and services. They indicate statistical risk rather than confirmed cancellations.
          </p>
        </div>
      </div>

      {/* ── FILTER & CONTROLS TOOLBAR ── */}
      <div className="bg-white rounded-2xl border border-[#E7E9F0] p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="h-4 w-4 text-[#777D91] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Customer ID (e.g. 7590-VHVEG)..."
              className="w-full pl-9 pr-4 py-2 bg-[#F6F7FB] border border-[#E7E9F0] rounded-xl text-xs font-mono text-[#151827] placeholder:text-[#777D91] focus:outline-none focus:border-[#5146E5] focus:bg-white transition-all"
            />
          </div>

          {/* Outcome Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F6F7FB] p-1 rounded-xl border border-[#E7E9F0] self-start md:self-auto">
            {(["All", "Stay", "Cancel"] as const).map((tab) => {
              const count =
                tab === "All"
                  ? results.length
                  : tab === "Stay"
                  ? predictionData.predicted_stay
                  : predictionData.predicted_churn;
              const isActive = statusFilter === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setStatusFilter(tab);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    isActive
                      ? "bg-white font-bold text-[#151827] shadow-xs"
                      : "text-[#777D91] hover:text-[#151827]"
                  }`}
                >
                  <span>{tab === "All" ? "All" : tab === "Stay" ? "Stay" : "Cancel"}</span>
                  <span className="ml-1.5 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Risk Tier Filter */}
          <div className="flex items-center gap-2">
            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value as RiskTierFilter);
                setCurrentPage(1);
              }}
              className="bg-[#F6F7FB] border border-[#E7E9F0] rounded-xl px-3 py-1.5 text-xs font-mono text-[#151827] focus:outline-none focus:border-[#5146E5]"
            >
              <option value="all">All Risk Tiers</option>
              <option value="critical">High Risk (&gt;57%)</option>
              <option value="watchlist">Medium Risk (35% - 57%)</option>
              <option value="low">Low Risk (&le;35%)</option>
            </select>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#F6F7FB] border border-[#E7E9F0] rounded-xl px-2.5 py-1.5 text-xs font-mono text-[#151827] focus:outline-none focus:border-[#5146E5]"
            >
              <option value={10}>10 / page</option>
              <option value={15}>15 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── CUSTOMER INTELLIGENCE DATA TABLE ── */}
      <div className="bg-white rounded-2xl border border-[#E7E9F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E7E9F0] bg-[#F6F7FB] text-xs font-mono text-[#777D91] uppercase tracking-wider">
                <th
                  onClick={() => handleSortToggle("customerID")}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#151827]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Customer ID</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle("tenure")}
                  className="py-3.5 px-3 font-semibold cursor-pointer hover:text-[#151827]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Tenure</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-3 font-semibold">Contract</th>
                <th
                  onClick={() => handleSortToggle("MonthlyCharges")}
                  className="py-3.5 px-3 font-semibold cursor-pointer hover:text-[#151827]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Monthly Charges</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSortToggle("churn_probability")}
                  className="py-3.5 px-4 font-semibold cursor-pointer hover:text-[#151827]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Churn Probability (τ={threshold})</span>
                    <ArrowUpDown className="h-3 w-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3.5 px-3 font-semibold">Predicted Outcome</th>
                <th className="py-3.5 px-4 text-right font-semibold">Details</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E7E9F0] text-xs">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#777D91]">
                    No accounts match the selected filters or search criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  const prob = record.churn_probability;
                  const probPct = (prob * 100).toFixed(1);
                  const isCancel = record.prediction === "Likely to cancel";

                  return (
                    <tr
                      key={record.customerID}
                      onClick={() => setSelectedCustomer(record)}
                      className="hover:bg-[#F6F7FB] transition-colors cursor-pointer group"
                    >
                      {/* Customer ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#151827] group-hover:text-[#5146E5]">
                        {record.customerID}
                      </td>

                      {/* Tenure */}
                      <td className="py-3 px-3 font-mono text-[#151827]">
                        <span>{record.tenure ?? "-"} mos</span>
                      </td>

                      {/* Contract */}
                      <td className="py-3 px-3 text-[#777D91]">
                        <span className="inline-flex px-2 py-0.5 rounded-md bg-[#F6F7FB] border border-[#E7E9F0] text-[11px] font-mono text-[#151827]">
                          {record.Contract || "Month-to-month"}
                        </span>
                      </td>

                      {/* Monthly Charges */}
                      <td className="py-3 px-3 font-mono font-semibold text-[#151827]">
                        ${record.MonthlyCharges ? record.MonthlyCharges.toFixed(2) : "0.00"}
                      </td>

                      {/* Churn Probability Gauge with Decision Threshold Marker */}
                      <td className="py-3 px-4 min-w-[190px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className={`font-bold ${isCancel ? "text-[#F04458]" : "text-[#159B70]"}`}>
                              {probPct}%
                            </span>
                            <span className="text-[#777D91]">
                              {isCancel ? "Above Cutoff" : "Safe Zone"}
                            </span>
                          </div>

                          <div className="relative h-2 w-full bg-[#E7E9F0] rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(100, Math.max(0, prob * 100))}%` }}
                              className={`h-full rounded-full transition-all duration-300 ${
                                isCancel ? "bg-[#F04458]" : "bg-[#159B70]"
                              }`}
                            />
                            {/* Vertical Cutoff Marker */}
                            <div
                              style={{ left: `${threshold * 100}%` }}
                              className="absolute top-0 bottom-0 w-0.5 bg-[#151827] z-10"
                              title={`Decision Cutoff τ = ${threshold}`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Predicted Status */}
                      <td className="py-3 px-3">
                        <PredictionBadge status={record.prediction} />
                      </td>

                      {/* View Profile Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(record);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium text-[#5146E5] hover:bg-[#5146E5]/10 transition-colors cursor-pointer"
                        >
                          <span>Profile</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION CONTROLS ── */}
        <div className="px-6 py-4 bg-[#F6F7FB] border-t border-[#E7E9F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-[#777D91]">
          <div>
            Showing{" "}
            <span className="font-bold text-[#151827]">
              {totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-[#151827]">
              {Math.min(currentPage * pageSize, totalRecords)}
            </span>{" "}
            of <span className="font-bold text-[#151827]">{totalRecords}</span> filtered accounts
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 w-8 rounded-lg border border-[#E7E9F0] bg-white flex items-center justify-center text-[#151827] hover:bg-[#F6F7FB] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 w-8 rounded-lg border border-[#E7E9F0] bg-white flex items-center justify-center text-[#151827] hover:bg-[#F6F7FB] disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Customer 360 Detail Drawer / Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        threshold={threshold}
      />
    </div>
  );
};
