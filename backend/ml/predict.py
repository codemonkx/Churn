"""
Inference service for Customer Churn Prediction.
Loads the trusted Joblib pipeline and metadata,
validates feature requirements, prevents target leakage,
and generates calibrated churn probability and class assignments.
"""

import os
import json
import joblib
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

from backend.ml.schema import (
    FEATURE_COLUMNS,
    IDENTIFIER_COLUMN,
    TARGET_COLUMN,
    LABEL_LIKELY_TO_CANCEL,
    LABEL_LIKELY_TO_STAY,
)


class ChurnPredictorService:
    """
    Singleton-style predictor service to load the model artifact once into memory
    and provide high-performance, safe batch inference.
    """

    _instance = None

    def __init__(self, artifacts_dir: Optional[str] = None):
        if artifacts_dir is None:
            # Default to backend/artifacts relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            artifacts_dir = os.path.join(base_dir, "artifacts")

        self.artifacts_dir = artifacts_dir
        self.pipeline_path = os.path.join(artifacts_dir, "churn_pipeline.joblib")
        self.metadata_path = os.path.join(artifacts_dir, "model_metadata.json")
        self.pipeline = None
        self.metadata = {}
        self.threshold = 0.5
        self.model_name = "Unknown"
        self._load_artifacts()

    def _load_artifacts(self):
        if not os.path.exists(self.pipeline_path):
            raise FileNotFoundError(
                f"Model pipeline artifact not found at {self.pipeline_path}. "
                "Please run backend/ml/train.py first."
            )

        self.pipeline = joblib.load(self.pipeline_path)

        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
            self.threshold = float(self.metadata.get("selected_threshold", 0.5))
            self.model_name = self.metadata.get("model_name", "TrainedModel")
        else:
            self.threshold = 0.5
            self.model_name = "LoadedPipeline"

    def is_available(self) -> bool:
        return self.pipeline is not None

    def get_metadata(self) -> Dict[str, Any]:
        return self.metadata

    def predict_dataframe(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Executes batch prediction on an uploaded DataFrame.

        Steps:
        1. Validates presence of required feature columns.
        2. Preserves customerID if available, else generates default identifiers.
        3. Excludes target column 'Churn' if present (data leakage prevention).
        4. Extracts prediction features matching exact model schema.
        5. Computes probabilities and maps to classification labels based on tuned threshold.
        6. Returns structured summary and per-customer records.
        """
        if self.pipeline is None:
            self._load_artifacts()

        # Check for missing required features
        missing_cols = [col for col in FEATURE_COLUMNS if col not in df.columns]
        if missing_cols:
            raise ValueError(
                f"Dataset is missing required feature column(s): {', '.join(missing_cols)}"
            )

        # Preserve customerID
        if IDENTIFIER_COLUMN in df.columns:
            customer_ids = df[IDENTIFIER_COLUMN].astype(str).tolist()
        else:
            customer_ids = [f"CUST-{idx+1:05d}" for idx in range(len(df))]

        # Data leakage protection: explicitly exclude Churn column if present
        features_df = df[FEATURE_COLUMNS].copy()

        # Predict churn probability (class 1: Churn)
        if hasattr(self.pipeline, "predict_proba"):
            probabilities = self.pipeline.predict_proba(features_df)[:, 1]
        else:
            # Fallback if probability not supported
            probabilities = self.pipeline.predict(features_df).astype(float)

        # Vectorized extraction of display columns (fast and guarantees no NaNs in JSON)
        tenure_list = (
            pd.to_numeric(features_df["tenure"], errors="coerce")
            .fillna(0)
            .astype(int)
            .tolist()
            if "tenure" in features_df.columns
            else [0] * len(features_df)
        )
        monthly_list = (
            pd.to_numeric(features_df["MonthlyCharges"], errors="coerce")
            .fillna(0.0)
            .round(2)
            .tolist()
            if "MonthlyCharges" in features_df.columns
            else [0.0] * len(features_df)
        )
        total_list = (
            pd.to_numeric(features_df["TotalCharges"], errors="coerce")
            .fillna(0.0)
            .round(2)
            .tolist()
            if "TotalCharges" in features_df.columns
            else [0.0] * len(features_df)
        )
        contract_list = (
            features_df["Contract"].fillna("N/A").astype(str).tolist()
            if "Contract" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        internet_list = (
            features_df["InternetService"].fillna("N/A").astype(str).tolist()
            if "InternetService" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        payment_list = (
            features_df["PaymentMethod"].fillna("N/A").astype(str).tolist()
            if "PaymentMethod" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        gender_list = (
            features_df["gender"].fillna("N/A").astype(str).tolist()
            if "gender" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        senior_list = (
            pd.to_numeric(features_df["SeniorCitizen"], errors="coerce")
            .fillna(0)
            .astype(int)
            .tolist()
            if "SeniorCitizen" in features_df.columns
            else [0] * len(features_df)
        )
        partner_list = (
            features_df["Partner"].fillna("N/A").astype(str).tolist()
            if "Partner" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        dependents_list = (
            features_df["Dependents"].fillna("N/A").astype(str).tolist()
            if "Dependents" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        phone_list = (
            features_df["PhoneService"].fillna("N/A").astype(str).tolist()
            if "PhoneService" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        lines_list = (
            features_df["MultipleLines"].fillna("N/A").astype(str).tolist()
            if "MultipleLines" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        security_list = (
            features_df["OnlineSecurity"].fillna("N/A").astype(str).tolist()
            if "OnlineSecurity" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        backup_list = (
            features_df["OnlineBackup"].fillna("N/A").astype(str).tolist()
            if "OnlineBackup" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        protection_list = (
            features_df["DeviceProtection"].fillna("N/A").astype(str).tolist()
            if "DeviceProtection" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        support_list = (
            features_df["TechSupport"].fillna("N/A").astype(str).tolist()
            if "TechSupport" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        tv_list = (
            features_df["StreamingTV"].fillna("N/A").astype(str).tolist()
            if "StreamingTV" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        movies_list = (
            features_df["StreamingMovies"].fillna("N/A").astype(str).tolist()
            if "StreamingMovies" in features_df.columns
            else ["N/A"] * len(features_df)
        )
        paperless_list = (
            features_df["PaperlessBilling"].fillna("N/A").astype(str).tolist()
            if "PaperlessBilling" in features_df.columns
            else ["N/A"] * len(features_df)
        )

        predictions = []
        churn_count = 0
        stay_count = 0

        for i, prob in enumerate(probabilities):
            prob_float = round(float(prob), 4)
            is_churn = prob_float >= self.threshold
            label = LABEL_LIKELY_TO_CANCEL if is_churn else LABEL_LIKELY_TO_STAY

            if is_churn:
                churn_count += 1
            else:
                stay_count += 1

            record = {
                "customerID": customer_ids[i],
                "prediction": label,
                "churn_probability": prob_float,
                "tenure": tenure_list[i],
                "MonthlyCharges": monthly_list[i],
                "TotalCharges": total_list[i],
                "Contract": contract_list[i],
                "InternetService": internet_list[i],
                "PaymentMethod": payment_list[i],
                "gender": gender_list[i],
                "SeniorCitizen": senior_list[i],
                "Partner": partner_list[i],
                "Dependents": dependents_list[i],
                "PhoneService": phone_list[i],
                "MultipleLines": lines_list[i],
                "OnlineSecurity": security_list[i],
                "OnlineBackup": backup_list[i],
                "DeviceProtection": protection_list[i],
                "TechSupport": support_list[i],
                "StreamingTV": tv_list[i],
                "StreamingMovies": movies_list[i],
                "PaperlessBilling": paperless_list[i],
            }
            predictions.append(record)

        total = len(predictions)
        churn_rate = round((churn_count / total) * 100, 2) if total > 0 else 0.0

        return {
            "total_customers": total,
            "predicted_churn": churn_count,
            "predicted_stay": stay_count,
            "churn_rate_pct": churn_rate,
            "threshold": self.threshold,
            "model_name": self.model_name,
            "results": predictions,
        }


# Global helper instance
_predictor_instance: Optional[ChurnPredictorService] = None


def get_predictor_service() -> ChurnPredictorService:
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = ChurnPredictorService()
    return _predictor_instance
