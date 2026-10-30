import React, { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  X,
  ArrowRight,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Table,
  Lock,
  Layers,
  RotateCcw,
} from "lucide-react";
import { formatFileSize } from "@/lib/csv";
import { getTemplateDownloadUrl, getSchemaInfo } from "@/lib/api";
import { SchemaInfo } from "@/types/prediction";

// The 19 canonical features + customerID required by the IBM Telco model
const CANONICAL_FEATURES = [
  "customerID",
  "tenure",
  "MonthlyCharges",
  "TotalCharges",
  "gender",
  "SeniorCitizen",
  "Partner",
  "Dependents",
  "PhoneService",
  "MultipleLines",
  "InternetService",
  "OnlineSecurity",
  "OnlineBackup",
  "DeviceProtection",
  "TechSupport",
  "StreamingTV",
  "StreamingMovies",
  "Contract",
  "PaperlessBilling",
  "PaymentMethod",
];

const NUMERICAL_FEATURES = ["tenure", "MonthlyCharges", "TotalCharges"];

interface CsvUploaderProps {
  onPredict: (file: File) => void;
  isLoading: boolean;
  onLoadDemo?: () => void;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onPredict,
  isLoading,
  onLoadDemo,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Client-side inspection state
  const [detectedColumns, setDetectedColumns] = useState<string[]>([]);
  const [validColumns, setValidColumns] = useState<string[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [unexpectedColumns, setUnexpectedColumns] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Array<Record<string, string>>>([]);
  const [estimatedRows, setEstimatedRows] = useState<number>(0);
  const [schemaInfo, setSchemaInfo] = useState<SchemaInfo | null>(null);

  // Fetch backend schema specifications on mount
  useEffect(() => {
    getSchemaInfo()
      .then((schema) => setSchemaInfo(schema))
      .catch((err) => console.warn("Could not fetch schema specifications:", err));
  }, []);

  // Inspect the selected CSV file client-side
  const inspectFile = async (file: File) => {
    try {
      // Read first 64KB slice for header and preview
      const slice = file.slice(0, 65536);
      const text = await slice.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      if (lines.length === 0) {
        setFileError("The uploaded CSV file is empty (0 records).");
        return;
      }

      // Parse headers
      const rawHeaders = lines[0].split(",").map((h) => h.replace(/^["']|["']$/g, "").trim());
      setDetectedColumns(rawHeaders);

      // Normalize comparison (case-insensitive)
      const lowerDetected = rawHeaders.map((h) => h.toLowerCase());
      const lowerCanonical = CANONICAL_FEATURES.map((f) => f.toLowerCase());

      const foundValid: string[] = [];
      const notFound: string[] = [];

      CANONICAL_FEATURES.forEach((canonical) => {
        const idx = lowerDetected.indexOf(canonical.toLowerCase());
        if (idx !== -1) {
          foundValid.push(rawHeaders[idx]);
        } else if (canonical !== "customerID") {
          // customerID is optional as backend auto-generates IDs if absent
          notFound.push(canonical);
        }
      });

      const extras = rawHeaders.filter((h) => !lowerCanonical.includes(h.toLowerCase()));

      setValidColumns(foundValid);
      setMissingColumns(notFound);
      setUnexpectedColumns(extras);

      // Parse up to 5 preview rows
      const parsedPreview: Array<Record<string, string>> = [];
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        const values = lines[i].split(",").map((v) => v.replace(/^["']|["']$/g, "").trim());
        const rowObj: Record<string, string> = {};
        rawHeaders.slice(0, 8).forEach((h, colIdx) => {
          rowObj[h] = values[colIdx] || "";
        });
        parsedPreview.push(rowObj);
      }
      setPreviewRows(parsedPreview);

      // Estimate total row count from file size and sample line length
      const avgLineLength = lines.slice(0, 5).reduce((acc, l) => acc + l.length, 0) / Math.min(lines.length, 5);
      const estimated = Math.max(lines.length - 1, Math.round(file.size / (avgLineLength || 100)));
      setEstimatedRows(estimated);
    } catch (err) {
      console.error("Error inspecting CSV:", err);
    }
  };

  const handleFileChange = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setSelectedFile(null);
      setDetectedColumns([]);
      setPreviewRows([]);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileError("Unsupported file format. Please upload a plain-text .csv dataset.");
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setFileError("The selected file is empty (0 bytes). Please select a valid CSV.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    inspectFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    setDetectedColumns([]);
    setValidColumns([]);
    setMissingColumns([]);
    setUnexpectedColumns([]);
    setPreviewRows([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isLoading) return;
    onPredict(selectedFile);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* ── LEFT / MAIN INGESTION AREA (7 cols) ── */}
      <div className="lg:col-span-7 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Large Distinctive Ingestion Zone */}
          <div
            id="csv-dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isLoading) setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onClick={() => {
              if (!isLoading && fileInputRef.current) fileInputRef.current.click();
            }}
            className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
              isDragOver
                ? "border-[#5146E5] bg-[#5146E5]/5"
                : "border-[#E7E9F0] hover:border-[#5146E5] bg-white hover:bg-[#F6F7FB]"
            } ${isLoading ? "pointer-events-none opacity-60" : ""}`}
          >
            <input
              ref={fileInputRef}
              id="csv-file-input"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center gap-3.5">
              <div className="h-14 w-14 rounded-2xl bg-[#5146E5]/10 text-[#5146E5] flex items-center justify-center">
                <UploadCloud className="h-7 w-7" />
              </div>

              <div className="space-y-1">
                <p className="text-base font-display font-bold text-[#151827]">
                  Drag and drop your customer CSV here, or{" "}
                  <span className="text-[#5146E5] hover:underline">browse files</span>
                </p>
                <p className="text-xs text-[#777D91]">
                  Supported format: .csv (UTF-8 encoded, up to 500MB)
                </p>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-[#777D91] pt-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F6F7FB] border border-[#E7E9F0]">
                  IBM Telco 19-Feature Schema
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F6F7FB] border border-[#E7E9F0]">
                  Automatic Imputation
                </span>
              </div>
            </div>
          </div>

          {/* Validation Error Message */}
          {fileError && (
            <div className="rounded-xl border border-[#F04458]/30 bg-[#F04458]/5 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#F04458] shrink-0 mt-0.5" />
              <div className="text-xs text-[#151827]">
                <span className="font-bold">File Inspection Error: </span>
                {fileError}
              </div>
            </div>
          )}

          {/* ── SELECTED FILE INSPECTOR & PREVIEW TABLE ── */}
          {selectedFile && (
            <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 shadow-2xs space-y-5">
              {/* File Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E9F0]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-[#5146E5]/10 text-[#5146E5] flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-display font-bold text-[#151827] truncate">
                      {selectedFile.name}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-[#777D91] mt-0.5">
                      <span>{formatFileSize(selectedFile.size)}</span>
                      <span>•</span>
                      <span>~{estimatedRows.toLocaleString()} Records</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-mono text-[#5146E5] hover:underline px-2 py-1"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    id="remove-file-btn"
                    onClick={handleRemoveFile}
                    disabled={isLoading}
                    className="rounded-lg p-2 text-[#777D91] hover:text-[#151827] hover:bg-[#F6F7FB] transition-colors cursor-pointer"
                    title="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Visual Schema Recognition Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-[#777D91] uppercase tracking-wider">
                    Schema Recognition Telemetry
                  </span>
                  <span className="font-mono font-bold text-[#151827]">
                    {detectedColumns.length} Columns Detected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {/* Valid Columns Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-semibold bg-[#159B70]/10 text-[#159B70] border border-[#159B70]/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{validColumns.length} Required Features Recognized</span>
                  </span>

                  {/* Missing Columns Badge */}
                  {missingColumns.length > 0 ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-semibold bg-[#F04458]/10 text-[#F04458] border border-[#F04458]/20">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{missingColumns.length} Missing: {missingColumns.slice(0, 2).join(", ")}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-semibold bg-[#159B70]/10 text-[#159B70]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>All Required Features Present</span>
                    </span>
                  )}

                  {/* Unexpected Columns */}
                  {unexpectedColumns.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] font-medium bg-[#F6F7FB] text-[#777D91] border border-[#E7E9F0]">
                      <span>{unexpectedColumns.length} Extra Columns ({unexpectedColumns.slice(0, 2).join(", ")})</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Sophisticated Dataset Preview Table (First 5 records) */}
              {previewRows.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs font-mono text-[#777D91]">
                    <div className="flex items-center gap-1.5">
                      <Table className="h-3.5 w-3.5 text-[#5146E5]" />
                      <span>Dataset Preview (First {previewRows.length} Records)</span>
                    </div>
                    <span>Showing sample columns</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-[#E7E9F0] bg-[#F6F7FB]/50">
                    <table className="w-full text-left border-collapse text-[11px] font-mono">
                      <thead>
                        <tr className="border-b border-[#E7E9F0] bg-white text-[#777D91]">
                          {Object.keys(previewRows[0]).map((col) => (
                            <th key={col} className="p-2.5 font-semibold whitespace-nowrap">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E7E9F0] text-[#151827]">
                        {previewRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-white">
                            {Object.values(row).map((val, cIdx) => (
                              <td key={cIdx} className="p-2.5 whitespace-nowrap">
                                {val || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2 text-xs text-[#777D91]">
                <Info className="h-4 w-4 text-[#5146E5] shrink-0" />
                <span>
                  Your customer data is processed using our trained churn prediction engine.
                </span>
              </div>
            </div>
          )}

          {/* Primary Prediction Action Button */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <span className="text-xs text-[#777D91] font-mono">
              STATUS: {selectedFile ? "COHORT READY FOR SCORING" : "AWAITING FILE SELECTION"}
            </span>

            <button
              id="predict-btn"
              type="submit"
              disabled={!selectedFile || isLoading || missingColumns.length > 5}
              className={`inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-xs font-semibold bg-[#5146E5] hover:bg-[#4338CA] text-white shadow-xs transition-all cursor-pointer ${
                !selectedFile || isLoading || missingColumns.length > 5
                  ? "opacity-40 cursor-not-allowed"
                  : ""
              }`}
            >
              <span>Analyze Customer Cohort</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* ── SECONDARY AREA: SCHEMA & BENCHMARK RESOURCES (5 cols) ── */}
      <div className="lg:col-span-5 space-y-6">
        {/* Schema Blueprint Card */}
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E9F0]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-[#5146E5]/10 text-[#5146E5] flex items-center justify-center">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-[#151827]">
                  Supported Schema Blueprint
                </h3>
                <p className="text-[11px] font-mono text-[#777D91]">IBM Telco Customer Churn (19 Features)</p>
              </div>
            </div>

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#A3E635] text-[#151827]">
              19 FEATURES
            </span>
          </div>

          {/* Numerical Features */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777D91] block">
              Continuous Numerical Features (3)
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-xs">
              {NUMERICAL_FEATURES.map((f) => (
                <span
                  key={f}
                  className="px-2.5 py-1 rounded-md bg-[#F6F7FB] border border-[#E7E9F0] font-semibold text-[#151827]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Categorical Features */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#777D91] block">
              Subscription & Categorical Features (16)
            </span>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {[
                "Contract",
                "InternetService",
                "PaymentMethod",
                "PaperlessBilling",
                "OnlineSecurity",
                "TechSupport",
                "OnlineBackup",
                "DeviceProtection",
                "StreamingTV",
                "StreamingMovies",
                "PhoneService",
                "MultipleLines",
                "SeniorCitizen",
                "Partner",
                "Dependents",
                "gender",
              ].map((f) => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-md bg-[#F6F7FB] border border-[#E7E9F0] text-[#777D91]"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Imputation & Privacy notices */}
          <div className="pt-3 border-t border-[#E7E9F0] space-y-2 text-xs text-[#777D91]">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-[#159B70] shrink-0 mt-0.5" />
              <span>
                <strong>Data Imputation:</strong> Missing numerical fields are automatically imputed with training medians; missing categoricals with mode classes.
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 text-[#5146E5] shrink-0 mt-0.5" />
              <span>
                <strong>Privacy Guaranteed:</strong> Dataset ingestion executes in-memory. No subscriber PII is stored permanently on disk.
              </span>
            </div>
          </div>
        </div>

        {/* Quick Sample Downloads & Benchmark Launcher */}
        <div className="bg-white rounded-2xl border border-[#E7E9F0] p-6 shadow-2xs space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-[#777D91] block">
            Sample Resources & Benchmarks
          </span>

          <div className="grid grid-cols-2 gap-3">
            <a
              href={getTemplateDownloadUrl("sample")}
              download="sample_customers_cohort.csv"
              className="flex flex-col gap-1 p-3.5 rounded-xl border border-[#E7E9F0] bg-[#F6F7FB] hover:bg-white hover:border-[#5146E5] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#151827]">
                <Download className="h-3.5 w-3.5 text-[#5146E5]" />
                <span>Sample CSV</span>
              </div>
              <span className="text-[10px] text-[#777D91] font-mono">25 Verified Records</span>
            </a>

            <a
              href={getTemplateDownloadUrl("blank")}
              download="blank_churn_template.csv"
              className="flex flex-col gap-1 p-3.5 rounded-xl border border-[#E7E9F0] bg-[#F6F7FB] hover:bg-white hover:border-[#5146E5] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-1.5 font-semibold text-xs text-[#151827]">
                <Download className="h-3.5 w-3.5 text-[#5146E5]" />
                <span>Blank Schema</span>
              </div>
              <span className="text-[10px] text-[#777D91] font-mono">Headers Only</span>
            </a>
          </div>

          {onLoadDemo && (
            <button
              type="button"
              onClick={onLoadDemo}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#F6F7FB] hover:bg-white text-[#151827] border border-[#E7E9F0] hover:border-[#D5D9E2] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#5146E5]" />
              <span>Load Telco Demo Benchmark File</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
