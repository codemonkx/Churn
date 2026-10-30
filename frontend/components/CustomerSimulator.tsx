"use client";
import React, { useState } from "react";
import {
  Sliders,
  TrendingUp,
  Lightbulb,
  Zap,
} from "lucide-react";
import { PredictionBadge } from "@/components/PredictionBadge";
import { uploadAndPredict } from "@/lib/api";

export const CustomerSimulator: React.FC = () => {
  const [tenure, setTenure] = useState(6);
  const [monthlyCharges, setMonthlyCharges] = useState(85.0);
  const [contract, setContract] = useState("Month-to-month");
  const [internetService, setInternetService] = useState("Fiber optic");
  const [techSupport, setTechSupport] = useState("No");
  const [onlineSecurity, setOnlineSecurity] = useState("No");
  const [paymentMethod, setPaymentMethod] = useState("Electronic check");
  const [paperlessBilling, setPaperlessBilling] = useState("Yes");
  const [seniorCitizen, setSeniorCitizen] = useState(0);
  const [partner, setPartner] = useState("No");
  const [dependents, setDependents] = useState("No");
  const [phoneService, setPhoneService] = useState("Yes");
  const [multipleLines, setMultipleLines] = useState("Yes");
  const [onlineBackup, setOnlineBackup] = useState("No");
  const [deviceProtection, setDeviceProtection] = useState("No");
  const [streamingTV, setStreamingTV] = useState("Yes");
  const [streamingMovies, setStreamingMovies] = useState("Yes");

  const [isSimulating, setIsSimulating] = useState(false);
  const [predictionResult, setPredictionResult] = useState<{
    prediction: "Likely to stay" | "Likely to cancel";
    probability: number;
    drivers: { factor: string; impact: string; isRisk: boolean }[];
    recommendation: string;
  } | null>(() => calculateLocalRisk({
    tenure: 6,
    monthlyCharges: 85.0,
    contract: "Month-to-month",
    internetService: "Fiber optic",
    techSupport: "No",
    paymentMethod: "Electronic check",
  }));

  const loadArchetype = (type: "flight_risk" | "loyal_veteran" | "moderate") => {
    if (type === "flight_risk") {
      setTenure(3); setMonthlyCharges(92.5); setContract("Month-to-month");
      setInternetService("Fiber optic"); setTechSupport("No");
      setOnlineSecurity("No"); setPaymentMethod("Electronic check"); setPaperlessBilling("Yes");
      recalc(3, 92.5, "Month-to-month", "Fiber optic", "No", "Electronic check");
    } else if (type === "loyal_veteran") {
      setTenure(62); setMonthlyCharges(54.0); setContract("Two year");
      setInternetService("DSL"); setTechSupport("Yes");
      setOnlineSecurity("Yes"); setPaymentMethod("Credit card (automatic)"); setPaperlessBilling("No");
      recalc(62, 54.0, "Two year", "DSL", "Yes", "Credit card (automatic)");
    } else {
      setTenure(24); setMonthlyCharges(74.0); setContract("One year");
      setInternetService("Fiber optic"); setTechSupport("No");
      setOnlineSecurity("Yes"); setPaymentMethod("Bank transfer (automatic)"); setPaperlessBilling("Yes");
      recalc(24, 74.0, "One year", "Fiber optic", "No", "Bank transfer (automatic)");
    }
  };

  function calculateLocalRisk(params: {
    tenure: number;
    monthlyCharges: number;
    contract: string;
    internetService: string;
    techSupport: string;
    paymentMethod: string;
  }) {
    let logOdds = -0.7;

    if (params.tenure <= 6) logOdds += 1.35;
    else if (params.tenure <= 12) logOdds += 0.85;
    else if (params.tenure <= 24) logOdds += 0.25;
    else if (params.tenure >= 48) logOdds -= 1.15;

    if (params.contract === "Month-to-month") logOdds += 1.45;
    else if (params.contract === "Two year") logOdds -= 1.65;
    else if (params.contract === "One year") logOdds -= 0.65;

    if (params.internetService === "Fiber optic") logOdds += 0.75;
    else if (params.internetService === "No") logOdds -= 0.95;

    if (params.techSupport === "No") logOdds += 0.55;
    else if (params.techSupport === "Yes") logOdds -= 0.45;

    if (params.paymentMethod === "Electronic check") logOdds += 0.60;
    else if (params.paymentMethod.includes("automatic")) logOdds -= 0.35;

    if (params.monthlyCharges > 80) logOdds += 0.50;
    else if (params.monthlyCharges < 40) logOdds -= 0.40;

    const prob = Math.min(0.97, Math.max(0.03, 1 / (1 + Math.exp(-logOdds))));
    const threshold = 0.57;
    const isCancel = prob >= threshold;

    const drivers: { factor: string; impact: string; isRisk: boolean }[] = [];

    if (params.contract === "Month-to-month") {
      drivers.push({ factor: "Month-to-month contract commitment", impact: "+34% risk", isRisk: true });
    } else {
      drivers.push({ factor: `${params.contract} contract lock-in`, impact: "-28% risk", isRisk: false });
    }

    if (params.tenure <= 12) {
      drivers.push({ factor: `Low account tenure (${params.tenure} mos)`, impact: "+26% risk", isRisk: true });
    } else if (params.tenure >= 36) {
      drivers.push({ factor: `Established subscriber loyalty (${params.tenure} mos)`, impact: "-24% risk", isRisk: false });
    }

    if (params.internetService === "Fiber optic" && params.techSupport === "No") {
      drivers.push({ factor: "High-speed Fiber without dedicated Tech Support", impact: "+18% risk", isRisk: true });
    }

    if (params.paymentMethod === "Electronic check") {
      drivers.push({ factor: "Manual Electronic Check payment", impact: "+14% risk", isRisk: true });
    } else if (params.paymentMethod.includes("automatic")) {
      drivers.push({ factor: "Automated billing enrollment", impact: "-12% risk", isRisk: false });
    }

    let recommendation = "Maintain proactive check-ins and monitor usage metrics for satisfaction.";
    if (isCancel) {
      if (params.contract === "Month-to-month") {
        recommendation = "Offer a 15% incentive for transitioning to an annual contract commitment.";
      } else {
        recommendation = "Assign a Customer Success manager and conduct an immediate service health review.";
      }
    } else if (prob > 0.35) {
      recommendation = "Proactively offer a free Tech Support trial and encourage automatic payment enrollment.";
    }

    return {
      prediction: isCancel ? ("Likely to cancel" as const) : ("Likely to stay" as const),
      probability: prob,
      drivers,
      recommendation,
    };
  }

  function recalc(
    t = tenure, mc = monthlyCharges, c = contract,
    is = internetService, ts = techSupport, pm = paymentMethod
  ) {
    setPredictionResult(calculateLocalRisk({ tenure: t, monthlyCharges: mc, contract: c, internetService: is, techSupport: ts, paymentMethod: pm }));
  }

  const handleLiveBackendSimulate = async () => {
    setIsSimulating(true);
    try {
      const totalCharges = (tenure * monthlyCharges).toFixed(2);
      const csvContent =
        `customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges\n` +
        `SIM-001,Female,${seniorCitizen},${partner},${dependents},${tenure},${phoneService},${multipleLines},${internetService},${onlineSecurity},${onlineBackup},${deviceProtection},${techSupport},${streamingTV},${streamingMovies},${contract},${paperlessBilling},${paymentMethod},${monthlyCharges},${totalCharges}\n`;

      const blob = new Blob([csvContent], { type: "text/csv" });
      const file = new File([blob], "simulator_customer.csv", { type: "text/csv" });

      const response = await uploadAndPredict(file);
      if (response && response.results.length > 0) {
        const item = response.results[0];
        setPredictionResult((prev) => ({
          prediction: item.prediction,
          probability: item.churn_probability,
          drivers: prev ? prev.drivers : [],
          recommendation: prev ? prev.recommendation : "",
        }));
      }
    } catch (err) {
      console.warn("Backend simulator call failed, using local engine", err);
    } finally {
      setIsSimulating(false);
    }
  };

  const probPercent = predictionResult ? Math.round(predictionResult.probability * 100) : 50;
  const isHighRisk = predictionResult?.probability ? predictionResult.probability >= 0.57 : false;

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="saas-card p-6 sm:p-8 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="chip chip-indigo">What-If Simulation</span>
              <span className="chip chip-emerald">Real-Time ML</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
              <Sliders className="h-6 w-6 text-indigo-600" />
              Customer Risk Simulator
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Modulate account parameters dynamically to evaluate churn probability shifts and risk elasticity.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Presets:</span>
            <button
              id="preset-flight-risk"
              onClick={() => loadArchetype("flight_risk")}
              className="chip chip-rose text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              Flight Risk
            </button>
            <button
              id="preset-loyal-veteran"
              onClick={() => loadArchetype("loyal_veteran")}
              className="chip chip-emerald text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              Loyal Veteran
            </button>
            <button
              id="preset-borderline"
              onClick={() => loadArchetype("moderate")}
              className="chip chip-amber text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Borderline Case
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 saas-card p-6 sm:p-7 bg-white space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold font-display text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600" />
              Account & Subscription Parameters
            </h3>
            <span className="text-xs text-slate-500 font-mono font-medium">Decision Boundary τ = 0.57</span>
          </div>

          {/* Continuous Range Sliders */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Account Tenure</label>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md shadow-2xs">
                  {tenure} {tenure === 1 ? "month" : "months"}
                </span>
              </div>
              <input
                id="tenure-slider"
                type="range" min="1" max="72" value={tenure}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setTenure(val);
                  recalc(val, monthlyCharges, contract, internetService, techSupport, paymentMethod);
                }}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                <span>1 month (New)</span>
                <span>36 mos</span>
                <span>72 mos (Veteran)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Monthly Recurring Charges</label>
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md shadow-2xs">
                  ${monthlyCharges.toFixed(2)}/mo
                </span>
              </div>
              <input
                id="monthly-charges-slider"
                type="range" min="18" max="120" step="0.5" value={monthlyCharges}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMonthlyCharges(val);
                  recalc(tenure, val, contract, internetService, techSupport, paymentMethod);
                }}
                className="w-full cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5">
                <span>$18.00 (Basic)</span>
                <span>$70.00</span>
                <span>$120.00 (Premium)</span>
              </div>
            </div>
          </div>

          {/* Categorical Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {[
              {
                id: "contract-select",
                label: "Contract Commitment",
                value: contract,
                onChange: (val: string) => { setContract(val); recalc(tenure, monthlyCharges, val, internetService, techSupport, paymentMethod); },
                options: [
                  { value: "Month-to-month", label: "Month-to-Month (High Risk)" },
                  { value: "One year", label: "One Year Contract" },
                  { value: "Two year", label: "Two Year Contract (Stable)" },
                ],
              },
              {
                id: "internet-select",
                label: "Internet Connection",
                value: internetService,
                onChange: (val: string) => { setInternetService(val); recalc(tenure, monthlyCharges, contract, val, techSupport, paymentMethod); },
                options: [
                  { value: "Fiber optic", label: "Fiber Optic" },
                  { value: "DSL", label: "DSL Broadband" },
                  { value: "No", label: "No Internet Service" },
                ],
              },
              {
                id: "tech-support-select",
                label: "Tech Support Addon",
                value: techSupport,
                onChange: (val: string) => { setTechSupport(val); recalc(tenure, monthlyCharges, contract, internetService, val, paymentMethod); },
                options: [
                  { value: "Yes", label: "Active Tech Support" },
                  { value: "No", label: "No Tech Support" },
                  { value: "No internet service", label: "No Internet Service" },
                ],
              },
              {
                id: "payment-select",
                label: "Billing Method",
                value: paymentMethod,
                onChange: (val: string) => { setPaymentMethod(val); recalc(tenure, monthlyCharges, contract, internetService, techSupport, val); },
                options: [
                  { value: "Electronic check", label: "Electronic Check (Manual)" },
                  { value: "Credit card (automatic)", label: "Credit Card (Auto-Pay)" },
                  { value: "Bank transfer (automatic)", label: "Bank Transfer (Auto-Pay)" },
                  { value: "Mailed check", label: "Mailed Check" },
                ],
              },
            ].map((field) => (
              <div key={field.id}>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  {field.label}
                </label>
                <select
                  id={field.id}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full text-xs font-medium"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Interactive local inference with live server validation
            </span>
            <button
              id="live-backend-btn"
              onClick={handleLiveBackendSimulate}
              disabled={isSimulating}
              className="btn-outline px-4 py-2 text-xs font-semibold rounded-lg disabled:opacity-50"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{isSimulating ? "Scoring with Server API..." : "Validate via Server API"}</span>
            </button>
          </div>
        </div>

        {/* Prediction Results Gauge & Insights (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Gauge Card */}
          <div className="saas-card p-6 sm:p-7 bg-white text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${isHighRisk ? "bg-rose-500" : "bg-emerald-500"}`} />
            
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Calculated Churn Probability
            </h4>

            {/* Gauge SVG */}
            <div className="relative mx-auto w-48 h-28 mb-3">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 115">
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke={isHighRisk ? "#e11d48" : probPercent > 35 ? "#d97706" : "#059669"}
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * (probPercent / 100))}
                  style={{
                    transition: "stroke-dashoffset 0.4s ease-out, stroke 0.3s ease",
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <span className={`font-display text-4xl font-extrabold tracking-tight ${
                  isHighRisk ? "text-rose-600" : probPercent > 35 ? "text-amber-600" : "text-emerald-600"
                }`}>
                  {probPercent}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Risk Score</span>
              </div>
            </div>

            <div className="flex justify-center mb-4">
              <PredictionBadge status={predictionResult?.prediction || "Likely to stay"} />
            </div>

            <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between text-slate-600">
                <span>Decision Cutoff:</span>
                <span className="font-mono font-bold text-slate-900">τ = 0.57 (57%)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Account Assessment:</span>
                <span className={`font-bold ${isHighRisk ? "text-rose-600" : "text-emerald-600"}`}>
                  {isHighRisk ? "At-Risk Account" : "Safe Retention"}
                </span>
              </div>
            </div>
          </div>

          {/* Risk Factors Card */}
          <div className="saas-card p-6 bg-white space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Primary Risk Drivers
            </h4>

            <div className="space-y-2">
              {predictionResult?.drivers.map((d, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-3 border text-xs flex items-center justify-between ${
                    d.isRisk
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <span className="font-medium">{d.factor}</span>
                  <span className="font-mono font-bold ml-2 whitespace-nowrap">{d.impact}</span>
                </div>
              ))}
            </div>

            {predictionResult?.recommendation && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-start gap-3 rounded-xl bg-indigo-50 border border-indigo-200 p-3.5 text-xs">
                  <Lightbulb className="h-4 w-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-indigo-900 block mb-0.5">Recommended Intervention</span>
                    <p className="text-indigo-800 leading-relaxed">{predictionResult.recommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
