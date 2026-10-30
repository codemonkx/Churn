import React from "react";
import { Loader2, Database, ShieldCheck, Cog, Sparkles, CheckCircle2, FileText } from "lucide-react";

interface LoadingStateProps {
  stage: string;
  filename?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ stage, filename }) => {
  const steps = [
    {
      id: "reading",
      number: "01",
      title: "Reading Dataset",
      description: "Parsing CSV rows & verifying UTF-8 encoding",
      icon: FileText,
    },
    {
      id: "validating",
      number: "02",
      title: "Validating Features",
      description: "Verifying 19 canonical columns against backend schema",
      icon: ShieldCheck,
    },
    {
      id: "preparing",
      number: "03",
      title: "Preparing Customer Records",
      description: "Applying median continuous imputation & categorical encoding",
      icon: Cog,
    },
    {
      id: "predicting",
      number: "04",
      title: "Running Churn Predictions",
      description: "Scikit-learn Random Forest ensemble inference",
      icon: Sparkles,
    },
    {
      id: "generating",
      number: "05",
      title: "Generating Intelligence Report",
      description: "Calibrated probability scoring at threshold τ = 0.57",
      icon: Database,
    },
  ];

  const getStatus = (stepId: string, idx: number) => {
    const stageOrder = ["reading", "uploading", "validating", "preparing", "predicting", "generating"];
    const currentIdx = stageOrder.indexOf(stage);
    const stepTargetIdx = [0, 2, 3, 4, 5][idx];

    if (currentIdx > stepTargetIdx) return "completed";
    if (currentIdx === stepTargetIdx || (stage === "uploading" && idx === 0)) return "active";
    return "pending";
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E9F0] p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 shadow-2xs space-y-6">
      {/* Animated Center Spinner */}
      <div className="relative mx-auto flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-[#5146E5]/10 animate-ping opacity-75" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5146E5] text-white shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-display font-bold text-[#151827]">
          Executing Inference Pipeline
        </h3>
        <p className="text-xs text-[#777D91]">
          Transforming customer inputs and evaluating decision tree thresholds...
        </p>

        {filename && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#F6F7FB] text-[#151827] border border-[#E7E9F0]">
            <span className="text-[#777D91]">Ingesting:</span>
            <span className="font-semibold">{filename}</span>
          </div>
        )}
      </div>

      {/* 5-Step Process Sequence Requested in Brief */}
      <div className="pt-4 border-t border-[#E7E9F0] space-y-3 text-left">
        {steps.map((step, idx) => {
          const status = getStatus(step.id, idx);
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={`flex items-center gap-3.5 p-3 rounded-xl transition-all ${
                status === "active"
                  ? "bg-[#5146E5]/5 border border-[#5146E5]/20 text-[#151827]"
                  : status === "completed"
                  ? "bg-[#F6F7FB] border border-transparent text-[#151827]"
                  : "opacity-40 text-[#777D91]"
              }`}
            >
              <div
                className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                  status === "active"
                    ? "bg-[#5146E5] text-white"
                    : status === "completed"
                    ? "bg-[#159B70] text-white"
                    : "bg-[#E7E9F0] text-[#777D91]"
                }`}
              >
                {status === "completed" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : status === "active" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-xs font-mono">{step.number}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold leading-none">
                    {step.number} — {step.title}
                  </span>
                  {status === "active" && (
                    <span className="text-[10px] font-mono text-[#5146E5] uppercase tracking-wider">
                      Processing
                    </span>
                  )}
                  {status === "completed" && (
                    <span className="text-[10px] font-mono text-[#159B70] uppercase tracking-wider">
                      Complete
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#777D91] mt-0.5 truncate">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
