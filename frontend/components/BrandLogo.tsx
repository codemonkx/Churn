import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = "md",
  showWordmark = false,
  className = "",
  onClick,
}) => {
  // Dimensions mapping
  const dimensions = {
    sm: { box: "h-8 w-8", icon: 20, text: "text-sm", sub: "text-[9px]" },
    md: { box: "h-10 w-10", icon: 24, text: "text-base", sub: "text-[10px]" },
    lg: { box: "h-12 w-12", icon: 28, text: "text-lg", sub: "text-[11px]" },
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 select-none ${
        onClick ? "cursor-pointer group" : ""
      } ${className}`}
    >
      {/* ── CUSTOM AI RETENTION EMBLEM ── */}
      <div
        className={`relative ${dimensions.box} rounded-xl bg-gradient-to-br from-[#5146E5] to-[#3730A3] p-1.5 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-105 group-hover:shadow`}
        aria-hidden="true"
      >
        {/* Fine SVG Brand Geometry */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Linear Glow for Retention Track */}
            <linearGradient id="cp-arc-grad" x1="6" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#C7D2FE" />
            </linearGradient>

            {/* Lime Glow Filter */}
            <filter id="cp-lime-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#A3E635" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Protective Customer Retention Arc (Continuous Lifecycle) */}
          <path
            d="M 16 6.5 C 10.75 6.5 6.5 10.75 6.5 16 C 6.5 21.25 10.75 25.5 16 25.5 C 21.25 25.5 25.5 21.25 25.5 16"
            stroke="url(#cp-arc-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Upward Predictive Trajectory (Interlocking Vector) */}
          <path
            d="M 12 20 L 16 16 L 20 12"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.75"
          />

          {/* Central AI Node */}
          <circle cx="16" cy="16" r="2" fill="#FFFFFF" />

          {/* Active Retention Beacon (Lime Spark) */}
          <circle
            cx="23"
            cy="9"
            r="3"
            fill="#A3E635"
            filter="url(#cp-lime-glow)"
          />
        </svg>

        {/* Floating Active Heartbeat Ping */}
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A3E635] opacity-60" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#A3E635] border-2 border-white" />
        </span>
      </div>

      {/* ── OPTIONAL TYPOGRAPHIC WORDMARK ── */}
      {showWordmark && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`${dimensions.text} font-display font-bold text-[#151827] tracking-tight`}>
              Churn<span className="text-[#5146E5]">Predict</span>
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[#A3E635]" />
          </div>
          <span className={`${dimensions.sub} font-mono uppercase tracking-wider text-[#777D91] mt-0.5`}>
            Retention Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
