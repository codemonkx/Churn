import React from "react";
import { PredictionStatus } from "@/types/prediction";

interface PredictionBadgeProps {
  status: PredictionStatus;
}

export const PredictionBadge: React.FC<PredictionBadgeProps> = ({ status }) => {
  const isStay = status === "Likely to stay";

  return (
    <span
      role="status"
      className={`chip ${
        isStay
          ? "chip-emerald text-emerald-800"
          : "chip-rose text-rose-800"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
          isStay ? "bg-emerald-600" : "bg-rose-600"
        }`}
      />
      <span>{status}</span>
    </span>
  );
};
