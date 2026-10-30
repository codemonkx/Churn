import {
  Users,
  UserCheck,
  UserX,
  RotateCcw,
  DollarSign,
  BarChart3,
  AlertTriangle,
} from "lucide-react";
import { PredictionResponse } from "@/types/prediction";

interface ResultsSummaryProps {
  data: PredictionResponse;
  onReset: () => void;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ data, onReset }) => {
  const stayPct = ((data.predicted_stay / (data.total_customers || 1)) * 100).toFixed(1);
  const churnPct = ((data.predicted_churn / (data.total_customers || 1)) * 100).toFixed(1);

  const revenueAtRisk = data.results
    .filter((r) => r.prediction === "Likely to cancel")
    .reduce((sum, r) => sum + (Number(r.MonthlyCharges) || 0), 0);

  const imputedCount = data.file_info?.auto_imputed_columns?.length ?? 0;

  return (
    <div className="space-y-4">
      {/* Action Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Analysis Complete
            </span>
            <span className="text-xs font-mono text-slate-500 font-medium">
              {data.model_name || "GradientBoostingClassifier"} · τ = {data.threshold ?? 0.57}
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Batch Evaluation Summary
          </h2>
        </div>

        <button
          id="new-analysis-btn"
          onClick={onReset}
          title="Upload and evaluate another cohort"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs hover:border-slate-400 transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
          <span>Upload Another File</span>
        </button>
      </div>

      {/* Schema Imputation Warning if uploaded file was missing domain features */}
      {imputedCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-2xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-amber-950 text-sm">
              Notice: {imputedCount} Columns Were Missing and Auto-Imputed
            </h4>
            <p className="text-amber-800 leading-relaxed">
              This ML model is specialized for subscription and telecom services (requiring features like{" "}
              <code>Contract</code>, <code>MonthlyCharges</code>, <code>InternetService</code>, <code>PaymentMethod</code>).
              Because missing contract types default to annual commitments, customer churn risk is evaluated as very low (&quot;Likely to stay&quot;).
            </p>
            {data.file_info?.auto_imputed_columns && (
              <p className="text-amber-700 font-mono text-[11px]">
                Imputed columns: {data.file_info.auto_imputed_columns.slice(0, 6).join(", ")}
                {data.file_info.auto_imputed_columns.length > 6 ? ` (+${data.file_info.auto_imputed_columns.length - 6} more)` : ""}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Total Evaluated
            </span>
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-slate-900">
              {data.total_customers.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">accounts</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Validated against 19 features
          </p>
        </div>

        {/* Retained / Safe */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Likely to Stay
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-emerald-700">
              {data.predicted_stay.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {stayPct}%
            </span>
          </div>
          <div className="mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stayPct}%` }}
            />
          </div>
        </div>

        {/* Churn Risk */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">
              High Churn Risk
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-display text-rose-600">
              {data.predicted_churn.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {churnPct}%
            </span>
          </div>
          <div className="mt-3 bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${churnPct}%` }}
            />
          </div>
        </div>

        {/* Revenue at Risk */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Monthly Exposure
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold font-display text-amber-700">
              ${revenueAtRisk.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ mo</span>
          </div>
          <p className="mt-2 text-xs font-semibold text-amber-700">
            Portfolio churn rate: <strong>{data.churn_rate_pct.toFixed(1)}%</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
