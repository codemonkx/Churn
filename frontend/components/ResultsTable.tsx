import React, { useState, useMemo } from "react";
import {
  Search,
  BarChart3,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PieChart,
  LineChart,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  Info,
} from "lucide-react";
import { PredictionRecord } from "@/types/prediction";
import { PredictionBadge } from "@/components/PredictionBadge";
import { DownloadButton } from "@/components/DownloadButton";

interface ResultsTableProps {
  results: PredictionRecord[];
  threshold?: number;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({
  results,
  threshold = 0.57,
}) => {
  const [activeTab, setActiveTab] = useState<"table" | "analytics" | "visuals">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Stay" | "Cancel">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const pageSize = 15;

  const filteredResults = useMemo(() => {
    return results.filter((record) => {
      const matchesSearch =
        !searchTerm ||
        record.customerID.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "All"
          ? true
          : statusFilter === "Stay"
          ? record.prediction === "Likely to stay"
          : record.prediction === "Likely to cancel";
      return matchesSearch && matchesStatus;
    });
  }, [results, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage]);

  const stayCount = results.filter((r) => r.prediction === "Likely to stay").length;
  const cancelCount = results.filter((r) => r.prediction === "Likely to cancel").length;
  const totalCount = results.length || 1;

  const lowRiskCount = results.filter((r) => r.churn_probability < 0.3).length;
  const medRiskCount = results.filter(
    (r) => r.churn_probability >= 0.3 && r.churn_probability <= threshold
  ).length;
  const highRiskCount = results.filter((r) => r.churn_probability > threshold).length;

  const lowRiskPct = ((lowRiskCount / totalCount) * 100).toFixed(1);
  const medRiskPct = ((medRiskCount / totalCount) * 100).toFixed(1);
  const highRiskPct = ((highRiskCount / totalCount) * 100).toFixed(1);

  const m2mRecords = results.filter((r) => (r.Contract || "").toLowerCase().includes("month"));
  const m2mChurn = m2mRecords.filter((r) => r.prediction === "Likely to cancel").length;
  const m2mChurnPct = m2mRecords.length > 0 ? ((m2mChurn / m2mRecords.length) * 100).toFixed(1) : "0.0";

  const oneYearRecords = results.filter((r) => (r.Contract || "").toLowerCase().includes("one"));
  const oneYearChurn = oneYearRecords.filter((r) => r.prediction === "Likely to cancel").length;
  const oneYearChurnPct = oneYearRecords.length > 0 ? ((oneYearChurn / oneYearRecords.length) * 100).toFixed(1) : "0.0";

  const twoYearRecords = results.filter((r) => (r.Contract || "").toLowerCase().includes("two"));
  const twoYearChurn = twoYearRecords.filter((r) => r.prediction === "Likely to cancel").length;
  const twoYearChurnPct = twoYearRecords.length > 0 ? ((twoYearChurn / twoYearRecords.length) * 100).toFixed(1) : "0.0";

  // Visuals: Computations for Charts
  const visualStats = useMemo(() => {
    // 1. Revenue
    const totalRev = results.reduce((acc, r) => acc + (Number(r.MonthlyCharges) || 0), 0);
    const riskRev = results
      .filter((r) => r.prediction === "Likely to cancel")
      .reduce((acc, r) => acc + (Number(r.MonthlyCharges) || 0), 0);
    const safeRev = totalRev - riskRev;

    // 2. Tenure Cohorts
    const cohorts = [
      { label: "0–12 mos (New)", min: 0, max: 12 },
      { label: "13–24 mos (Early)", min: 13, max: 24 },
      { label: "25–48 mos (Mid)", min: 25, max: 48 },
      { label: "49–72 mos (Veteran)", min: 49, max: 100 },
    ].map((b) => {
      const cohortList = results.filter(
        (r) => (r.tenure ?? 0) >= b.min && (r.tenure ?? 0) <= b.max
      );
      const churnNum = cohortList.filter((r) => r.prediction === "Likely to cancel").length;
      const rate = cohortList.length > 0 ? (churnNum / cohortList.length) * 100 : 0;
      return {
        ...b,
        count: cohortList.length,
        churnCount: churnNum,
        churnRate: rate,
      };
    });

    // 3. Probability Histogram (10 Bins)
    const bins = [
      { label: "0-10%", min: 0, max: 0.1 },
      { label: "10-20%", min: 0.1, max: 0.2 },
      { label: "20-30%", min: 0.2, max: 0.3 },
      { label: "30-40%", min: 0.3, max: 0.4 },
      { label: "40-50%", min: 0.4, max: 0.5 },
      { label: "50-60%", min: 0.5, max: 0.6 },
      { label: "60-70%", min: 0.6, max: 0.7 },
      { label: "70-80%", min: 0.7, max: 0.8 },
      { label: "80-90%", min: 0.8, max: 0.9 },
      { label: "90-100%", min: 0.9, max: 1.01 },
    ].map((bin) => {
      const inBin = results.filter(
        (r) => r.churn_probability >= bin.min && r.churn_probability < bin.max
      );
      return {
        ...bin,
        count: inBin.length,
        pct: (inBin.length / totalCount) * 100,
        isAboveThreshold: bin.min >= 0.5,
      };
    });

    // Max count for histogram scaling
    const maxBinCount = Math.max(...bins.map((b) => b.count), 1);

    // 4. Monthly Charges Pricing Tiers
    const pricingBands = [
      { label: "Basic (< $35)", filter: (mc: number) => mc < 35 },
      { label: "Standard ($35–$70)", filter: (mc: number) => mc >= 35 && mc < 70 },
      { label: "High Tier ($70–$95)", filter: (mc: number) => mc >= 70 && mc < 95 },
      { label: "Premium (>$95)", filter: (mc: number) => mc >= 95 },
    ].map((tier) => {
      const match = results.filter((r) => tier.filter(Number(r.MonthlyCharges) || 0));
      const churnNum = match.filter((r) => r.prediction === "Likely to cancel").length;
      const rate = match.length > 0 ? (churnNum / match.length) * 100 : 0;
      const tierMrrRisk = match
        .filter((r) => r.prediction === "Likely to cancel")
        .reduce((sum, r) => sum + (Number(r.MonthlyCharges) || 0), 0);
      return {
        label: tier.label,
        count: match.length,
        churnCount: churnNum,
        churnRate: rate,
        atRiskMrr: tierMrrRisk,
      };
    });

    // 5. Payment Methods
    const paymentMethods = [
      "Electronic check",
      "Mailed check",
      "Bank transfer (automatic)",
      "Credit card (automatic)",
    ].map((pm) => {
      const match = results.filter((r) => (r.PaymentMethod || "").toLowerCase().includes(pm.toLowerCase().split(" ")[0]));
      const churnNum = match.filter((r) => r.prediction === "Likely to cancel").length;
      const rate = match.length > 0 ? (churnNum / match.length) * 100 : 0;
      return {
        method: pm,
        count: match.length,
        churnCount: churnNum,
        churnRate: rate,
        isAuto: pm.includes("automatic"),
      };
    });

    return {
      totalRev,
      riskRev,
      safeRev,
      cohorts,
      bins,
      maxBinCount,
      pricingBands,
      paymentMethods,
    };
  }, [results, totalCount]);

  const stayPct = ((stayCount / totalCount) * 100).toFixed(1);
  const churnPct = ((cancelCount / totalCount) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
      {/* Switcher & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 w-fit">
          <button
            id="tab-table-view"
            onClick={() => setActiveTab("table")}
            className={`inline-flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "table"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <TableIcon className="h-3.5 w-3.5 text-indigo-600" />
            <span>Customer Roster</span>
          </button>

          <button
            id="tab-analytics-view"
            onClick={() => setActiveTab("analytics")}
            className={`inline-flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Risk Breakdown</span>
          </button>

          <button
            id="tab-visuals-view"
            onClick={() => setActiveTab("visuals")}
            className={`inline-flex items-center gap-2 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "visuals"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <LineChart className="h-3.5 w-3.5 text-indigo-600" />
            <span>Visuals</span>
          </button>
        </div>

        <DownloadButton results={results} />
      </div>

      {/* VIEW 1: DATA TABLE */}
      {activeTab === "table" && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="customer-search"
                type="text"
                placeholder="Search by Customer ID (e.g., 7590-VHVEG)..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {[
                { key: "All" as const, label: `All (${results.length})`, cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
                { key: "Stay" as const, label: `Stay (${stayCount})`, cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                { key: "Cancel" as const, label: `At Risk (${cancelCount})`, cls: "bg-rose-50 text-rose-700 border-rose-200" },
              ].map((f) => (
                <button
                  key={f.key}
                  id={`filter-${f.key.toLowerCase()}`}
                  onClick={() => { setStatusFilter(f.key); setCurrentPage(1); }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                    statusFilter === f.key
                      ? f.cls
                      : "border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4">Prediction</th>
                    <th className="py-3 px-4">Risk Score</th>
                    <th className="py-3 px-4">Tenure</th>
                    <th className="py-3 px-4">Contract</th>
                    <th className="py-3 px-4">Internet</th>
                    <th className="py-3 px-4 text-right">Monthly Spend</th>
                    <th className="py-3 px-4 text-center">360° Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map((record, idx) => {
                      const probPct = (record.churn_probability * 100).toFixed(1);
                      const isHighRisk = record.churn_probability > threshold;
                      const isExpanded = expandedRow === record.customerID;

                      return (
                        <React.Fragment key={record.customerID || idx}>
                          <tr
                            onClick={() => setExpandedRow(isExpanded ? null : record.customerID)}
                            className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                              isExpanded ? "bg-indigo-50/30" : ""
                            }`}
                          >
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              {record.customerID}
                            </td>
                            <td className="py-3.5 px-4">
                              <PredictionBadge status={record.prediction} />
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <span className={`font-mono text-xs font-bold ${
                                  isHighRisk ? "text-rose-600" : "text-emerald-600"
                                }`}>
                                  {probPct}%
                                </span>
                                <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${isHighRisk ? "bg-rose-500" : "bg-emerald-500"}`}
                                    style={{ width: `${probPct}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-700 text-xs">
                              {record.tenure != null ? `${record.tenure} mos` : "—"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                              {record.Contract || "—"}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium text-xs">
                              {record.InternetService || "—"}
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                              ${Number(record.MonthlyCharges || 0).toFixed(2)}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRow(isExpanded ? null : record.customerID);
                                }}
                                className={`p-1 rounded-md transition-colors ${
                                  isExpanded
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                }`}
                                title={isExpanded ? "Collapse attributes" : "View all 21 customer attributes"}
                              >
                                {isExpanded ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Customer 360 Feature Profile */}
                          {isExpanded && (
                            <tr className="bg-slate-50/70">
                              <td colSpan={8} className="p-4 sm:p-5 border-y border-slate-200">
                                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                      <span className="font-mono font-bold text-slate-900 text-sm">
                                        Account Details: {record.customerID}
                                      </span>
                                      <PredictionBadge status={record.prediction} />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs">
                                      <span className="text-slate-500">
                                        Calculated Churn Probability: <strong className={isHighRisk ? "text-rose-600" : "text-emerald-700"}>{probPct}%</strong>
                                      </span>
                                      <span className="text-slate-400">|</span>
                                      <span className="text-slate-500">
                                        Decision Cutoff: <strong className="font-mono">τ = {threshold}</strong>
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                    {/* 1. Contract & Billing */}
                                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                                      <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] block">
                                        Contract & Billing
                                      </span>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Contract:</span>
                                        <strong className="text-slate-900">{record.Contract || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Monthly Bill:</span>
                                        <strong className="text-slate-900 font-mono">${Number(record.MonthlyCharges || 0).toFixed(2)}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Total Charges:</span>
                                        <strong className="text-slate-900 font-mono">${Number(record.TotalCharges || 0).toFixed(2)}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Payment:</span>
                                        <strong className="text-slate-900">{record.PaymentMethod || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Paperless:</span>
                                        <strong className="text-slate-900">{record.PaperlessBilling || "N/A"}</strong>
                                      </div>
                                    </div>

                                    {/* 2. Service Package */}
                                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                                      <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] block">
                                        Service Package
                                      </span>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Tenure:</span>
                                        <strong className="text-slate-900 font-mono">{record.tenure ?? "N/A"} months</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Internet:</span>
                                        <strong className="text-slate-900">{record.InternetService || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Phone Service:</span>
                                        <strong className="text-slate-900">{record.PhoneService || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Multiple Lines:</span>
                                        <strong className="text-slate-900">{record.MultipleLines || "N/A"}</strong>
                                      </div>
                                    </div>

                                    {/* 3. Security & Add-ons */}
                                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                                      <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] block">
                                        Security & Add-ons
                                      </span>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Online Security:</span>
                                        <strong className="text-slate-900">{record.OnlineSecurity || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Tech Support:</span>
                                        <strong className="text-slate-900">{record.TechSupport || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Online Backup:</span>
                                        <strong className="text-slate-900">{record.OnlineBackup || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Device Protection:</span>
                                        <strong className="text-slate-900">{record.DeviceProtection || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Streaming TV:</span>
                                        <strong className="text-slate-900">{record.StreamingTV || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Streaming Movies:</span>
                                        <strong className="text-slate-900">{record.StreamingMovies || "N/A"}</strong>
                                      </div>
                                    </div>

                                    {/* 4. Demographics */}
                                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 space-y-2">
                                      <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] block">
                                        Demographics
                                      </span>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Gender:</span>
                                        <strong className="text-slate-900">{record.gender || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Senior Citizen:</span>
                                        <strong className="text-slate-900">{record.SeniorCitizen ? "Yes" : "No"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Partner:</span>
                                        <strong className="text-slate-900">{record.Partner || "N/A"}</strong>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-slate-500">Dependents:</span>
                                        <strong className="text-slate-900">{record.Dependents || "N/A"}</strong>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500 text-sm">
                        No customer records match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
              <span>
                Showing {filteredResults.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredResults.length)} of {filteredResults.length} accounts
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="prev-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-indigo-700 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-mono font-bold text-slate-800 px-1">
                  {currentPage} of {totalPages}
                </span>
                <button
                  id="next-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-indigo-700 hover:border-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Risk Distribution Cards */}
          <div>
            <h3 className="text-sm font-bold font-display text-slate-900 mb-4 flex items-center gap-2">
              <PieChart className="h-4 w-4 text-indigo-600" />
              Risk Bracket Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Low Risk (&lt; 30%)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">Safe</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-display text-emerald-700">
                    {lowRiskCount}
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {lowRiskPct}%
                  </span>
                </div>
                <div className="mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${lowRiskPct}%` }} />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Established subscribers with high retention signals and minimal cancellation likelihood.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                    Moderate (30%–{Math.round(threshold * 100)}%)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Watchlist</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-display text-amber-700">
                    {medRiskCount}
                  </span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {medRiskPct}%
                  </span>
                </div>
                <div className="mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${medRiskPct}%` }} />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Subscribers nearing critical risk threshold; proactive loyalty perks preserve these accounts.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
                    Critical Risk (&gt; {Math.round(threshold * 100)}%)
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">High Churn</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold font-display text-rose-700">
                    {highRiskCount}
                  </span>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    {highRiskPct}%
                  </span>
                </div>
                <div className="mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${highRiskPct}%` }} />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Accounts projected for imminent cancellation. Automated playbook intervention recommended.
                </p>
              </div>
            </div>
          </div>

          {/* Churn Rate by Contract Duration */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Churn Exposure by Contract Duration
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4">
                <span className="text-xs font-bold text-rose-900 block">Month-to-Month</span>
                <span className="text-2xl font-extrabold font-display text-rose-700 mt-1 block">
                  {m2mChurnPct}%
                </span>
                <p className="text-xs text-rose-800/90 mt-1">
                  {m2mChurn} of {m2mRecords.length} accounts at risk
                </p>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <span className="text-xs font-bold text-amber-900 block">One-Year Contract</span>
                <span className="text-2xl font-extrabold font-display text-amber-700 mt-1 block">
                  {oneYearChurnPct}%
                </span>
                <p className="text-xs text-amber-800/90 mt-1">
                  {oneYearChurn} of {oneYearRecords.length} accounts at risk
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="text-xs font-bold text-emerald-900 block">Two-Year Contract</span>
                <span className="text-2xl font-extrabold font-display text-emerald-700 mt-1 block">
                  {twoYearChurnPct}%
                </span>
                <p className="text-xs text-emerald-800/90 mt-1">
                  {twoYearChurn} of {twoYearRecords.length} accounts at risk
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: VISUALS (INTERACTIVE CHARTS & DATA GRAPHS) */}
      {activeTab === "visuals" && (
        <div className="space-y-6">
          {/* Top Charts Grid: Donut Breakdown + Probability Histogram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. Donut Chart: Portfolio Ratio */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-indigo-600" />
                    Portfolio Retention Split
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">N = {totalCount}</span>
                </div>

                {/* SVG Donut Visualizer */}
                <div className="relative mx-auto w-44 h-44 my-4 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#f1f5f9"
                      strokeWidth="14"
                    />
                    {/* Likely to Stay (Emerald) Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#059669"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset={238.76 - (238.76 * (Number(stayPct) / 100))}
                      strokeLinecap="round"
                    />
                    {/* Churn Risk (Rose) Arc */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#e11d48"
                      strokeWidth="14"
                      strokeDasharray="238.76"
                      strokeDashoffset={238.76 - (238.76 * (Number(churnPct) / 100))}
                      style={{
                        transformOrigin: "center",
                        transform: `rotate(${(Number(stayPct) / 100) * 360}deg)`,
                      }}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Center Donut Metrics */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-extrabold font-display text-slate-900 leading-none">
                      {churnPct}%
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 mt-1">
                      Churn Rate
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend & Summary */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950">Likely to Stay</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-extrabold text-emerald-800">{stayCount}</span>
                    <span className="text-xs font-bold text-emerald-700">{stayPct}%</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">
                    ${visualStats.safeRev.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo safe
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                    <span className="text-xs font-bold text-rose-950">At Risk</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-extrabold text-rose-700">{cancelCount}</span>
                    <span className="text-xs font-bold text-rose-700">{churnPct}%</span>
                  </div>
                  <span className="text-[10px] text-rose-700 block mt-0.5">
                    ${visualStats.riskRev.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo exposed
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Probability Distribution Histogram */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Activity className="h-4 w-4 text-indigo-600" />
                      Prediction Score Density Distribution
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Customer density binned by 10% risk brackets</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 w-fit">
                    Cutoff τ = 0.57
                  </span>
                </div>

                {/* Histogram Visual Bars */}
                <div className="h-48 flex items-end gap-2 pt-6 pb-2 px-1">
                  {visualStats.bins.map((bin, i) => {
                    const heightPercent = Math.max(8, Math.round((bin.count / visualStats.maxBinCount) * 100));
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                        {/* Tooltip on Hover */}
                        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-mono py-0.5 px-2 rounded-md pointer-events-none whitespace-nowrap z-10 shadow-xs">
                          {bin.count} accounts ({bin.pct.toFixed(1)}%)
                        </div>

                        {/* Bar */}
                        <div
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            bin.isAboveThreshold
                              ? "bg-rose-500 group-hover:bg-rose-600"
                              : "bg-indigo-500 group-hover:bg-indigo-600"
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        />

                        {/* Bar Value on top */}
                        <span className="text-[10px] font-mono text-slate-500 mt-1.5 block">
                          {bin.count}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* X-Axis Labels */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                  <span>0% (Safe)</span>
                  <span>30%</span>
                  <span className="text-rose-600 font-bold">57% (Threshold)</span>
                  <span>80%</span>
                  <span>100% (High)</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-indigo-500" />
                  Below Threshold (Predict: Stay)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-sm bg-rose-500" />
                  Above Threshold (Predict: Churn)
                </span>
              </div>
            </div>
          </div>

          {/* Lower Grid: Tenure Cohorts + Pricing Tiers + Payment Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 3. Tenure Cohort Risk Bar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <TrendingDown className="h-4 w-4 text-indigo-600" />
                  Churn Rate by Tenure Cohort
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Attrition likelihood decreases with longevity</p>
              </div>

              <div className="space-y-4">
                {visualStats.cohorts.map((c, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{c.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">{c.count} accts</span>
                        <span className={`font-mono font-bold ${c.churnRate > 40 ? "text-rose-600" : "text-emerald-600"}`}>
                          {c.churnRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          c.churnRate > 40 ? "bg-rose-500" : c.churnRate > 20 ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, c.churnRate))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Monthly Bill Pricing Tier Impact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  Monthly Spend vs Churn Risk
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Revenue exposure per monthly billing bracket</p>
              </div>

              <div className="space-y-4">
                {visualStats.pricingBands.map((tier, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{tier.label}</span>
                      <span className={`font-mono font-bold ${tier.churnRate > 35 ? "text-rose-600" : "text-slate-700"}`}>
                        {tier.churnRate.toFixed(1)}% churn
                      </span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          tier.churnRate > 40 ? "bg-rose-500" : "bg-indigo-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, tier.churnRate))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{tier.count} accounts</span>
                      <span className="font-mono text-rose-600 font-semibold">
                        ${tier.atRiskMrr.toLocaleString("en-US", { maximumFractionDigits: 0 })}/mo at risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Payment Method Churn Risk */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  Billing Channel Vulnerability
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated payments demonstrate 2.5x lower churn</p>
              </div>

              <div className="space-y-4">
                {visualStats.paymentMethods.map((pm, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[170px]" title={pm.method}>
                        {pm.method}
                      </span>
                      <span className={`font-mono font-bold ${pm.churnRate > 40 ? "text-rose-600" : "text-emerald-700"}`}>
                        {pm.churnRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pm.churnRate > 40 ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, pm.churnRate))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{pm.count} accounts</span>
                      <span className={`font-semibold ${pm.isAuto ? "text-emerald-700" : "text-amber-700"}`}>
                        {pm.isAuto ? "Low Risk Auto-Pay" : "Manual Involuntary Risk"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
