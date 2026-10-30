import React from "react";
import {
  Target,
  DollarSign,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

export const RetentionPlaybook: React.FC = () => {
  const playbooks = [
    {
      tier: "Critical Risk Tier",
      threshold: "Score > 57%",
      color: "rose" as const,
      urgency: "Immediate (48 Hours)",
      action: "Contract Transition Incentive",
      strategy:
        "Trigger an automated promotion offering 15% off for 6 months upon upgrading from Month-to-Month to an Annual Agreement.",
      targetAudience: "Monthly charges > $75 on Month-to-Month contract with tenure < 12 months.",
      expectedImpact: "38% reduction in 30-day cancellation rate",
    },
    {
      tier: "Moderate Watchlist Tier",
      threshold: "Score 30%–57%",
      color: "amber" as const,
      urgency: "Proactive (7 Days)",
      action: "Complimentary Support Bundle",
      strategy:
        "Provision a free 90-day trial of 24/7 Tech Support and Device Protection to eliminate technical friction.",
      targetAudience: "Fiber optic subscribers lacking active technical support add-ons.",
      expectedImpact: "24% reduction in service dissatisfaction churn",
    },
    {
      tier: "Low Risk Loyalty Tier",
      threshold: "Score < 30%",
      color: "emerald" as const,
      urgency: "Next Billing Cycle",
      action: "Auto-Pay Enrollment Bonus",
      strategy:
        "Offer a one-time $10 account credit to transition from manual paper/electronic check to automated bank billing.",
      targetAudience: "Tenure > 24 months paying via manual Electronic Check.",
      expectedImpact: "18% reduction in involuntary billing lapse churn",
    },
  ];

  const colorStyles = {
    rose: {
      cardBorder: "border-slate-200 border-t-4 border-t-rose-500",
      badge: "bg-rose-50 text-rose-800 border-rose-200",
      scoreBox: "bg-rose-50 border border-rose-200 text-rose-800",
      impactBox: "bg-rose-50/80 border border-rose-200 text-rose-900",
      urgencyText: "text-rose-700 font-bold",
    },
    amber: {
      cardBorder: "border-slate-200 border-t-4 border-t-amber-500",
      badge: "bg-amber-50 text-amber-800 border-amber-200",
      scoreBox: "bg-amber-50 border border-amber-200 text-amber-800",
      impactBox: "bg-amber-50/80 border border-amber-200 text-amber-900",
      urgencyText: "text-amber-700 font-bold",
    },
    emerald: {
      cardBorder: "border-slate-200 border-t-4 border-t-emerald-500",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
      scoreBox: "bg-emerald-50 border border-emerald-200 text-emerald-800",
      impactBox: "bg-emerald-50/80 border border-emerald-200 text-emerald-900",
      urgencyText: "text-emerald-700 font-bold",
    },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Strategic Intervention
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Revenue Defense
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              <Target className="h-6 w-6 text-indigo-600" />
              Automated Retention Playbook
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-xl">
              Segment-specific intervention workflows designed to intercept churn signals and preserve monthly recurring revenue (MRR) before contract cancellation.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex items-center gap-3.5 flex-shrink-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-indigo-700">
                Projected Impact
              </span>
              <span className="font-display text-2xl font-extrabold text-slate-900">
                +32.4% MRR Saved
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Tier Playbook Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {playbooks.map((p, idx) => {
          const style = colorStyles[p.color];
          return (
            <div
              key={idx}
              className={`bg-white rounded-2xl border p-6 shadow-2xs flex flex-col justify-between ${style.cardBorder}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.badge}`}>
                      {p.tier}
                    </span>
                    <h3 className="mt-2 text-lg font-bold font-display text-slate-900">
                      {p.action}
                    </h3>
                  </div>
                  <div className={`rounded-lg px-2.5 py-1 text-center flex-shrink-0 ${style.scoreBox}`}>
                    <span className="text-[10px] uppercase font-bold block">Cutoff</span>
                    <span className="text-xs font-bold">{p.threshold}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-5">{p.strategy}</p>

                <div className="space-y-3.5 pt-4 border-t border-slate-100">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" /> Target Profile
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.targetAudience}</p>
                  </div>

                  <div className={`rounded-xl p-3.5 ${style.impactBox}`}>
                    <span className="text-xs font-bold block mb-0.5 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" /> Expected Outcome
                    </span>
                    <span className="text-xs font-bold">{p.expectedImpact}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Recommended SLA
                </span>
                <span className={`text-xs ${style.urgencyText}`}>{p.urgency}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
