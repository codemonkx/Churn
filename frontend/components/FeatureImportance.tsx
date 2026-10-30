import React from "react";
import {
  Brain,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
} from "lucide-react";

export const FeatureImportance: React.FC = () => {
  const featureWeights = [
    { name: "Tenure", weight: 31.4, category: "Numerical", desc: "Longer tenure strongly lowers churn probability; loyal subscribers exhibit high retention inertia." },
    { name: "TotalCharges", weight: 18.2, category: "Numerical", desc: "Cumulative lifetime spend reflects ongoing investment in the service ecosystem." },
    { name: "MonthlyCharges", weight: 16.8, category: "Numerical", desc: "High monthly billing without bundled support correlates strongly with cancellation." },
    { name: "Contract: Month-to-Month", weight: 12.5, category: "Categorical", desc: "Primary driver of churn (+34% elevated risk vs multi-year contract locks)." },
    { name: "OnlineSecurity: No", weight: 4.8, category: "Categorical", desc: "Absence of digital security add-ons increases vulnerability and churn intent." },
    { name: "TechSupport: No", weight: 4.2, category: "Categorical", desc: "Lack of direct support channels leads to unresolved technical friction." },
    { name: "InternetService: Fiber Optic", weight: 3.9, category: "Categorical", desc: "Premium tier customers exhibit higher expectations and price sensitivity." },
    { name: "PaymentMethod: Electronic Check", weight: 3.1, category: "Categorical", desc: "Manual payment channels show 2.4x higher involuntary and voluntary churn." },
    { name: "Contract: Two Year", weight: 2.8, category: "Categorical", desc: "Strongest protective factor against customer cancellation (-28% risk)." },
    { name: "PaperlessBilling: Yes", weight: 2.3, category: "Categorical", desc: "Slight positive correlation with customer review of monthly line-item expenses." },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Tree Attribution
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                100 Estimators
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              <Brain className="h-6 w-6 text-indigo-600" />
              Feature Importance & Model Attribution
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
              Mean Gini Impurity reduction computed across all decision trees in the Gradient Boosting ensemble, showing which features drive customer churn predictions.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center min-w-[100px] shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />
              <span className="block text-xs font-bold uppercase tracking-wider text-indigo-700">ROC-AUC</span>
              <span className="font-display text-2xl font-extrabold text-slate-900 mt-0.5 block">85.0%</span>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4 text-center min-w-[100px] shadow-2xs relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
              <span className="block text-xs font-bold uppercase tracking-wider text-rose-700">Recall</span>
              <span className="font-display text-2xl font-extrabold text-slate-900 mt-0.5 block">73.9%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Weights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Chart Column (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600" />
              Top 10 Churn Drivers (Relative Importance)
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">Mean Gini Impurity</span>
          </div>

          <div className="space-y-4">
            {featureWeights.map((f, i) => {
              const barWidth = (f.weight / 35) * 100;
              const isTop3 = i < 3;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono text-slate-400 font-bold text-xs flex-shrink-0">
                        #{String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-bold text-slate-900 font-display truncate text-sm">{f.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        f.category === "Numerical"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {f.category}
                      </span>
                    </div>
                    <span className={`font-mono font-extrabold flex-shrink-0 ml-2 text-sm ${
                      isTop3 ? "text-indigo-700" : "text-slate-700"
                    }`}>
                      {f.weight}%
                    </span>
                  </div>

                  <div className="bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isTop3
                          ? "bg-indigo-600"
                          : "bg-indigo-400"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guarantees Column (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              Engineering Guarantees
            </h4>

            <div className="space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                <span className="font-bold text-emerald-950 text-xs flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Zero Target Leakage
                </span>
                <p className="text-xs text-emerald-900/80 leading-relaxed">
                  The ground-truth <code>Churn</code> column is excluded from the inference matrix. Models operate blind to actual outcomes.
                </p>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-4">
                <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5 mb-1">
                  <Lock className="h-3.5 w-3.5 text-indigo-600" />
                  Identifier Decoupling
                </span>
                <p className="text-xs text-indigo-900/80 leading-relaxed">
                  <code>customerID</code> is isolated strictly for cohort reassembly and is never fed into feature vectors.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 mb-1">
                  <Layers className="h-3.5 w-3.5 text-slate-600" />
                  Pre-Fitted Preprocessing
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Encoders and scaling transformers are frozen at training time, preventing distribution drift.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
