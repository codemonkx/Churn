import React, { useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { PredictionRecord } from "@/types/prediction";
import { downloadExportedCsv } from "@/lib/api";
import { exportResultsToClientCsv } from "@/lib/csv";

interface DownloadButtonProps {
  results: PredictionRecord[];
  filename?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  results,
  filename = "churn_predictions_export.csv",
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleDownload = async () => {
    if (results.length === 0 || isExporting) return;
    setIsExporting(true);

    try {
      await downloadExportedCsv(results);
    } catch (err) {
      console.warn("Backend export failed, falling back to client CSV generation:", err);
      exportResultsToClientCsv(results, filename);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={results.length === 0 || isExporting}
      className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      title="Download complete enriched predictions cohort as CSV"
    >
      {isExporting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-3.5 w-3.5" />
      )}
      <span>{isExporting ? "Generating CSV..." : "Export Enriched CSV"}</span>
    </button>
  );
};
