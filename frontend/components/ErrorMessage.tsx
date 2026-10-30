import React from "react";
import { AlertCircle, XCircle } from "lucide-react";
import { ApiError } from "@/types/prediction";

interface ErrorMessageProps {
  error: string | ApiError | null;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onDismiss,
}) => {
  if (!error) return null;

  let message = "An error occurred while processing your request.";
  let missingColumns: string[] = [];
  let duplicateColumns: string[] = [];

  if (typeof error === "string") {
    message = error;
  } else if (typeof error === "object") {
    if (error.error) message = error.error;
    if (Array.isArray(error.missing_columns)) missingColumns = error.missing_columns;
    if (Array.isArray(error.duplicate_columns)) duplicateColumns = error.duplicate_columns;
  }

  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50/90 p-5 shadow-xs"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold font-display text-rose-900 text-sm mb-1">
              Dataset Validation Error
            </h4>
            <p className="text-rose-800 text-xs leading-relaxed font-mono">{message}</p>

            {missingColumns.length > 0 && (
              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1.5">
                  Missing Required Columns ({missingColumns.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {missingColumns.map((col) => (
                    <code key={col} className="text-xs bg-white border border-rose-200 text-rose-800 px-2 py-0.5 rounded shadow-2xs font-mono">
                      {col}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {duplicateColumns.length > 0 && (
              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1.5">
                  Duplicate Column Headers:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {duplicateColumns.map((col) => (
                    <code key={col} className="text-xs bg-white border border-rose-200 text-rose-800 px-2 py-0.5 rounded shadow-2xs font-mono">
                      {col}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-lg p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer flex-shrink-0"
            aria-label="Dismiss error"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};
