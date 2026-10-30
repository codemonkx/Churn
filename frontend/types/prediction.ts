export type PredictionStatus = "Likely to stay" | "Likely to cancel";

export interface PredictionRecord {
  customerID: string;
  prediction: PredictionStatus;
  churn_probability: number;
  tenure?: number;
  MonthlyCharges?: number;
  TotalCharges?: number;
  Contract?: string;
  InternetService?: string;
  PaymentMethod?: string;
  gender?: string;
  SeniorCitizen?: number;
  Partner?: string;
  Dependents?: string;
  PhoneService?: string;
  MultipleLines?: string;
  OnlineSecurity?: string;
  OnlineBackup?: string;
  DeviceProtection?: string;
  TechSupport?: string;
  StreamingTV?: string;
  StreamingMovies?: string;
  PaperlessBilling?: string;
}

export interface FileInfo {
  filename: string;
  row_count: number;
  has_customer_id: boolean;
  has_target_column: boolean;
  auto_imputed_columns?: string[];
  extra_columns_ignored?: string[];
}

export interface PredictionResponse {
  total_customers: number;
  predicted_churn: number;
  predicted_stay: number;
  churn_rate_pct: number;
  threshold: number;
  model_name: string;
  results: PredictionRecord[];
  file_info?: FileInfo;
}

export interface ModelMetadata {
  model_name: string;
  dataset: string;
  dataset_rows: number;
  selected_threshold: number;
  labels: Record<string, string>;
  final_evaluation_metrics: {
    threshold: number;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
    classification_report: Record<string, any>;
  };
  model_comparison: Record<
    string,
    {
      optimal_threshold: number;
      "test_metrics_default_0.5": {
        accuracy: number;
        precision: number;
        recall: number;
        f1_score: number;
        roc_auc: number;
      };
      test_metrics_tuned: {
        accuracy: number;
        precision: number;
        recall: number;
        f1_score: number;
        roc_auc: number;
      };
    }
  >;
  selection_rationale: string;
}

export interface ApiHealthStatus {
  status: "healthy" | "degraded";
  service: string;
  version: string;
  model_available: boolean;
  model_name: string;
  threshold: number;
}

export interface SchemaInfo {
  identifier_column: string;
  target_column: string;
  total_required_features: number;
  required_features: string[];
  numerical_features: string[];
  categorical_features: string[];
  accepted_categories: Record<string, any[]>;
  upload_constraints: {
    max_file_size_bytes: number;
    max_file_size_mb: number;
    max_row_count: number;
    allowed_extensions: string[];
  };
  sample_row: Record<string, any>;
}

export interface ApiError {
  error?: string;
  missing_columns?: string[];
  duplicate_columns?: string[];
  [key: string]: any;
}
