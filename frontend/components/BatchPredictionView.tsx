import React from "react";
import { CsvUploader } from "@/components/CsvUploader";
import { LoadingState } from "@/components/LoadingState";

interface BatchPredictionViewProps {
  onPredict: (file: File) => void;
  isLoading: boolean;
  loadingStage: string | null;
  activeFilename: string;
  onLoadDemo: () => void;
}

export const BatchPredictionView: React.FC<BatchPredictionViewProps> = ({
  onPredict,
  isLoading,
  loadingStage,
  activeFilename,
  onLoadDemo,
}) => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777D91]">
            DATA INGESTION WORKSPACE // INFERENCE INGESTION
          </span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-display font-bold text-[#151827] tracking-tight">
          Bring your customer data.
        </h2>
        <p className="text-sm text-[#777D91] font-sans">
          Upload a customer cohort and let the prediction engine identify accounts at risk.
        </p>
      </div>

      {/* Upload Component or Loading Pipeline */}
      {loadingStage ? (
        <LoadingState stage={loadingStage} filename={activeFilename} />
      ) : (
        <CsvUploader
          onPredict={onPredict}
          isLoading={isLoading}
          onLoadDemo={onLoadDemo}
        />
      )}
    </div>
  );
};
