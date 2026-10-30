import React from "react";
import {
  X,
  User,
  CreditCard,
  Shield,
  Wifi,
  Clock,
  DollarSign,
  Activity,
  Tv,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  TrendingUp,
} from "lucide-react";
import { PredictionRecord } from "@/types/prediction";
import { PredictionBadge } from "@/components/PredictionBadge";

interface CustomerDetailModalProps {
  customer: PredictionRecord | null;
  onClose: () => void;
  threshold?: number;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  onClose,
  threshold = 0.57,
}) => {
  if (!customer) return null;

  const probPct = (customer.churn_probability * 100).toFixed(1);
  const isCancel = customer.prediction === "Likely to cancel";

  // Identify real contributing factors from actual customer attributes
  const riskFactors: string[] = [];
  const retentionFactors: string[] = [];

  if (customer.Contract === "Month-to-month") {
    riskFactors.push("Month-to-month contract (Flexible churn window)");
  } else if (customer.Contract === "Two year" || customer.Contract === "One year") {
    retentionFactors.push(`Long-term contract commitment (${customer.Contract})`);
  }

  if (customer.tenure !== undefined && customer.tenure < 12) {
    riskFactors.push(`Low tenure tenure (<12 months: ${customer.tenure} mos)`);
  } else if (customer.tenure !== undefined && customer.tenure >= 24) {
    retentionFactors.push(`Established subscriber relationship (${customer.tenure} months)`);
  }

  if (customer.MonthlyCharges !== undefined && customer.MonthlyCharges > 70) {
    riskFactors.push(`High monthly charge tier ($${customer.MonthlyCharges.toFixed(2)}/mo)`);
  }

  if (customer.TechSupport === "No") {
    riskFactors.push("No dedicated tech support add-on subscribed");
  } else if (customer.TechSupport === "Yes") {
    retentionFactors.push("Subscribed to premium tech support");
  }

  if (customer.OnlineSecurity === "No") {
    riskFactors.push("No online security add-on enabled");
  } else if (customer.OnlineSecurity === "Yes") {
    retentionFactors.push("Subscribed to online security service");
  }

  if (customer.PaymentMethod === "Electronic check") {
    riskFactors.push("Manual electronic check payment method (Higher churn correlation)");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#151827]/40 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-detail-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-[#E7E9F0] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#F6F7FB] border-b border-[#E7E9F0] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#5146E5] text-white flex items-center justify-center font-bold text-sm shadow-xs">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 id="customer-detail-title" className="text-base font-display font-bold text-[#151827]">
                  Account Profile: <span className="font-mono text-[#5146E5]">{customer.customerID}</span>
                </h3>
                <PredictionBadge status={customer.prediction} />
              </div>
              <p className="text-xs text-[#777D91] font-mono mt-0.5">
                RETENTION 360° DOSSIER // SCORING TELEMETRY
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="h-8 w-8 rounded-lg text-[#777D91] hover:text-[#151827] hover:bg-[#E7E9F0] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* ML Score & Classification Strip */}
          <div className="rounded-xl border border-[#E7E9F0] p-4 bg-[#F6F7FB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#777D91]">
                Scored Churn Probability
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-display font-bold ${isCancel ? "text-[#F04458]" : "text-[#159B70]"}`}>
                  {probPct}%
                </span>
                <span className="text-xs text-[#777D91] font-mono">
                  (Decision Cutoff τ = {threshold})
                </span>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#777D91]">
                Risk Classification
              </span>
              <div className="text-sm font-semibold text-[#151827]">
                {isCancel ? (
                  <span className="inline-flex items-center gap-1.5 text-[#F04458]">
                    <AlertTriangle className="h-4 w-4" />
                    High Churn Risk — Retention Outreach Recommended
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[#159B70]">
                    <CheckCircle2 className="h-4 w-4" />
                    Low Churn Risk — Stable Account Profile
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Contributing Predictive Indicators (Based on Actual Attributes) */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777D91] block">
              Observed Retention & Risk Indicators
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {riskFactors.length > 0 && (
                <div className="bg-[#F04458]/5 border border-[#F04458]/20 rounded-xl p-3.5 space-y-2">
                  <span className="font-semibold text-[#F04458] flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Elevated Risk Drivers</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-[#151827] list-disc list-inside">
                    {riskFactors.map((rf, idx) => (
                      <li key={idx} className="leading-relaxed">{rf}</li>
                    ))}
                  </ul>
                </div>
              )}

              {retentionFactors.length > 0 && (
                <div className="bg-[#159B70]/5 border border-[#159B70]/20 rounded-xl p-3.5 space-y-2">
                  <span className="font-semibold text-[#159B70] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Retention Anchors</span>
                  </span>
                  <ul className="space-y-1 text-[11px] text-[#151827] list-disc list-inside">
                    {retentionFactors.map((rf, idx) => (
                      <li key={idx} className="leading-relaxed">{rf}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Grid of 4 Structured CRM Intelligence Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Card 1: Contract & Billing */}
            <div className="rounded-xl border border-[#E7E9F0] p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2 font-display font-bold text-[#151827] pb-2 border-b border-[#E7E9F0]">
                <CreditCard className="h-4 w-4 text-[#5146E5]" />
                <span>Contract & Billing</span>
              </div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Contract:</span>
                  <span className="font-semibold text-[#151827]">{customer.Contract || "Month-to-month"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Tenure:</span>
                  <span className="font-semibold text-[#151827]">{customer.tenure ?? 0} Months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Monthly Charges:</span>
                  <span className="font-bold text-[#151827]">${customer.MonthlyCharges?.toFixed(2) ?? "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Total Charges:</span>
                  <span className="font-semibold text-[#151827]">${customer.TotalCharges?.toFixed(2) ?? "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Paperless Billing:</span>
                  <span className="text-[#151827]">{customer.PaperlessBilling || "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Payment Method:</span>
                  <span className="text-[#151827] truncate max-w-[120px]" title={customer.PaymentMethod}>
                    {customer.PaymentMethod || "Electronic check"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Connectivity & Phone */}
            <div className="rounded-xl border border-[#E7E9F0] p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2 font-display font-bold text-[#151827] pb-2 border-b border-[#E7E9F0]">
                <Wifi className="h-4 w-4 text-[#5146E5]" />
                <span>Connectivity & Telecom</span>
              </div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Internet Service:</span>
                  <span className="font-semibold text-[#151827]">{customer.InternetService || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Phone Service:</span>
                  <span className="text-[#151827]">{customer.PhoneService || "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Multiple Lines:</span>
                  <span className="text-[#151827]">{customer.MultipleLines || "No"}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Security & Support Add-ons */}
            <div className="rounded-xl border border-[#E7E9F0] p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2 font-display font-bold text-[#151827] pb-2 border-b border-[#E7E9F0]">
                <Shield className="h-4 w-4 text-[#5146E5]" />
                <span>Security & Support Add-ons</span>
              </div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Online Security:</span>
                  <span className="text-[#151827]">{customer.OnlineSecurity || "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Tech Support:</span>
                  <span className="text-[#151827]">{customer.TechSupport || "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Online Backup:</span>
                  <span className="text-[#151827]">{customer.OnlineBackup || "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Device Protection:</span>
                  <span className="text-[#151827]">{customer.DeviceProtection || "No"}</span>
                </div>
              </div>
            </div>

            {/* Card 4: Entertainment & Demographics */}
            <div className="rounded-xl border border-[#E7E9F0] p-4 space-y-3 bg-white">
              <div className="flex items-center gap-2 font-display font-bold text-[#151827] pb-2 border-b border-[#E7E9F0]">
                <Tv className="h-4 w-4 text-[#5146E5]" />
                <span>Streaming & Demographics</span>
              </div>
              <div className="space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Streaming TV:</span>
                  <span className="text-[#151827]">{customer.StreamingTV || "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Streaming Movies:</span>
                  <span className="text-[#151827]">{customer.StreamingMovies || "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Gender:</span>
                  <span className="text-[#151827]">{customer.gender || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Senior Citizen:</span>
                  <span className="text-[#151827]">{customer.SeniorCitizen === 1 ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Partner:</span>
                  <span className="text-[#151827]">{customer.Partner || "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#777D91]">Dependents:</span>
                  <span className="text-[#151827]">{customer.Dependents || "No"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F6F7FB] border-t border-[#E7E9F0] flex items-center justify-between shrink-0">
          <span className="text-xs text-[#777D91] font-mono">
            EVALUATED BY PREDICTION ENGINE (τ = {threshold})
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#151827] hover:bg-[#2A2E3D] text-white transition-colors cursor-pointer"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
