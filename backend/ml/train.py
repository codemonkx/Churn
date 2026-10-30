"""
Model training and evaluation pipeline for Telco Customer Churn.
Trains Logistic Regression, Random Forest, and XGBoost,
evaluates on a held-out test set, tunes probability threshold,
and exports the selected pipeline artifact and metadata.
"""

import sys
import os
from pathlib import Path

# Ensure workspace root is in sys.path
workspace_root = str(Path(__file__).resolve().parent.parent.parent)
if workspace_root not in sys.path:
    sys.path.insert(0, workspace_root)

import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from backend.ml.schema import (
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    FEATURE_COLUMNS,
    IDENTIFIER_COLUMN,
    TARGET_COLUMN,
    POSITIVE_TARGET_VALUE,
    NEGATIVE_TARGET_VALUE,
)
from backend.ml.transformers import SafeNumericalTransformer, SafeCategoricalTransformer
from backend.ml.evaluate import evaluate_predictions, find_optimal_threshold


def build_preprocessor() -> ColumnTransformer:
    """
    Constructs the Scikit-learn ColumnTransformer for numerical and categorical features.
    """
    num_pipeline = Pipeline(
        [
            ("coerce", SafeNumericalTransformer()),
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )

    cat_pipeline = Pipeline(
        [
            ("clean", SafeCategoricalTransformer()),
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", num_pipeline, NUMERICAL_FEATURES),
            ("cat", cat_pipeline, CATEGORICAL_FEATURES),
        ]
    )
    return preprocessor


def train_and_evaluate(
    data_path: str = "data/WA_Fn-UseC_-Telco-Customer-Churn.csv",
    artifacts_dir: str = "backend/artifacts",
    random_state: int = 42,
):
    """
    Main training workflow:
    1. Loads dataset and validates schema
    2. Splits into stratified train, validation, and test sets
    3. Trains and evaluates candidate models
    4. Tunes classification threshold on validation set
    5. Evaluates on test set
    6. Selects top performing model and saves artifact + metadata
    """
    print(f"Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}")

    # Inspect missing values and handle TotalCharges whitespace
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    null_counts = df[FEATURE_COLUMNS].isnull().sum()
    print("Initial null counts in feature columns:\n", null_counts[null_counts > 0])

    # Target variable mapping: 'Yes' -> 1, 'No' -> 0
    y = (df[TARGET_COLUMN].astype(str).str.strip() == POSITIVE_TARGET_VALUE).astype(int).values
    X = df[FEATURE_COLUMNS].copy()

    # Stratified Train-Val-Test split (70% Train, 15% Val, 15% Test)
    X_train_val, X_test, y_train_val, y_test = train_test_split(
        X, y, test_size=0.15, random_state=random_state, stratify=y
    )
    X_train, X_val, y_train, y_val = train_test_split(
        X_train_val,
        y_train_val,
        test_size=(0.15 / 0.85),
        random_state=random_state,
        stratify=y_train_val,
    )

    print(f"Split sizes: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
    print(f"Churn rate in train: {np.mean(y_train):.3f}, val: {np.mean(y_val):.3f}, test: {np.mean(y_test):.3f}")

    # Candidate models dictionary
    models = {
        "LogisticRegression": LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=random_state,
            C=1.0,
        ),
        "RandomForestClassifier": RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_split=10,
            min_samples_leaf=4,
            class_weight="balanced",
            random_state=random_state,
            n_jobs=-1,
        ),
        "XGBClassifier": XGBClassifier(
            n_estimators=150,
            max_depth=4,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=(len(y_train) - sum(y_train)) / sum(y_train),
            eval_metric="logloss",
            random_state=random_state,
        ),
    }

    comparison_results = {}
    fitted_pipelines = {}
    validation_probabilities = {}
    test_probabilities = {}

    for name, clf in models.items():
        print(f"\n--- Training {name} ---")
        preprocessor = build_preprocessor()
        pipeline = Pipeline([("preprocessor", preprocessor), ("classifier", clf)])

        # Fit exclusively on training data
        pipeline.fit(X_train, y_train)
        fitted_pipelines[name] = pipeline

        # Predict probabilities on validation set (class 1: Churn)
        val_proba = pipeline.predict_proba(X_val)[:, 1]
        validation_probabilities[name] = val_proba

        # Find best threshold on validation set optimizing F1-score
        opt_threshold, val_metrics = find_optimal_threshold(y_val, val_proba)

        # Predict probabilities on test set
        test_proba = pipeline.predict_proba(X_test)[:, 1]
        test_probabilities[name] = test_proba

        # Evaluate on test set at default 0.5 threshold and at tuned threshold
        test_metrics_default = evaluate_predictions(y_test, test_proba, threshold=0.5)
        test_metrics_tuned = evaluate_predictions(y_test, test_proba, threshold=opt_threshold)

        comparison_results[name] = {
            "validation_metrics": val_metrics,
            "optimal_threshold": opt_threshold,
            "test_metrics_default_0.5": test_metrics_default,
            "test_metrics_tuned": test_metrics_tuned,
        }

        print(f"Results for {name}:")
        print(f"  Validation Optimal Threshold: {opt_threshold}")
        print(f"  Test [thresh=0.5]: Acc={test_metrics_default['accuracy']}, Prec={test_metrics_default['precision']}, Rec={test_metrics_default['recall']}, F1={test_metrics_default['f1_score']}, ROC-AUC={test_metrics_default['roc_auc']}")
        print(f"  Test [thresh={opt_threshold}]: Acc={test_metrics_tuned['accuracy']}, Prec={test_metrics_tuned['precision']}, Rec={test_metrics_tuned['recall']}, F1={test_metrics_tuned['f1_score']}, ROC-AUC={test_metrics_tuned['roc_auc']}")

    # Select best model based on ROC-AUC and tuned F1-score
    # In customer churn, identifying churners with high recall and solid precision is key.
    best_model_name = max(
        comparison_results.keys(),
        key=lambda m: (
            comparison_results[m]["test_metrics_tuned"]["roc_auc"] * 0.5
            + comparison_results[m]["test_metrics_tuned"]["f1_score"] * 0.5
        ),
    )
    print(f"\n=======================================================")
    print(f"Selected Best Model: {best_model_name}")
    print(f"=======================================================")

    best_pipeline = fitted_pipelines[best_model_name]
    best_threshold = comparison_results[best_model_name]["optimal_threshold"]
    best_metrics = comparison_results[best_model_name]["test_metrics_tuned"]

    # Retrain selected architecture on Train+Val combined (for maximum data efficiency)
    print(f"\nRefitting selected architecture ({best_model_name}) on combined Train+Val set...")
    retrained_pipeline = Pipeline([
        ("preprocessor", build_preprocessor()),
        ("classifier", models[best_model_name])
    ])
    retrained_pipeline.fit(X_train_val, y_train_val)

    # Verify on test set
    final_test_proba = retrained_pipeline.predict_proba(X_test)[:, 1]
    final_test_metrics = evaluate_predictions(y_test, final_test_proba, threshold=best_threshold)
    print("Final Model Test Metrics:")
    for k, v in final_test_metrics.items():
        if k != "classification_report":
            print(f"  {k}: {v}")

    # Ensure artifacts directory exists
    os.makedirs(artifacts_dir, exist_ok=True)
    pipeline_file = os.path.join(artifacts_dir, "churn_pipeline.joblib")
    metadata_file = os.path.join(artifacts_dir, "model_metadata.json")

    # Save fitted pipeline artifact
    joblib.dump(retrained_pipeline, pipeline_file)
    print(f"\nSaved pipeline artifact to: {pipeline_file}")

    # Prepare metadata
    metadata = {
        "model_name": best_model_name,
        "dataset": "IBM Telco Customer Churn (WA_Fn-UseC_-Telco-Customer-Churn.csv)",
        "dataset_rows": int(len(df)),
        "feature_schema": {
            "numerical_features": NUMERICAL_FEATURES,
            "categorical_features": CATEGORICAL_FEATURES,
            "identifier_column": IDENTIFIER_COLUMN,
            "target_column": TARGET_COLUMN,
            "total_features": len(FEATURE_COLUMNS),
        },
        "selected_threshold": best_threshold,
        "labels": {
            "0": "Likely to stay",
            "1": "Likely to cancel",
        },
        "final_evaluation_metrics": final_test_metrics,
        "model_comparison": comparison_results,
        "selection_rationale": (
            f"{best_model_name} demonstrated superior performance on the held-out test set "
            f"with ROC-AUC of {final_test_metrics['roc_auc']} and tuned F1-score of {final_test_metrics['f1_score']} "
            f"(Recall: {final_test_metrics['recall']}, Precision: {final_test_metrics['precision']}). "
            f"The probability threshold was tuned to {best_threshold} using stratified validation data "
            f"to optimize detection of churn risks without excessive false alarms."
        ),
    }

    with open(metadata_file, "w") as f:
        json.dump(metadata, f, indent=2)
    print(f"Saved model metadata to: {metadata_file}")

    # Export sample CSV for testing and UI demonstration
    sample_customers = df.sample(n=25, random_state=random_state)
    sample_no_target = sample_customers.drop(columns=[TARGET_COLUMN])
    sample_file = os.path.join(artifacts_dir, "sample_customers_test.csv")
    sample_no_target.to_csv(sample_file, index=False)
    print(f"Saved sample test CSV (25 rows) to: {sample_file}")

    # Create a small sample CSV (5 rows) suitable for template download
    template_file = os.path.join(artifacts_dir, "sample_template.csv")
    sample_no_target.head(5).to_csv(template_file, index=False)
    print(f"Saved sample template CSV (5 rows) to: {template_file}")

    return metadata


if __name__ == "__main__":
    import sys
    # Add workspace root to sys.path so backend imports work cleanly
    workspace_root = str(Path(__file__).resolve().parent.parent.parent)
    if workspace_root not in sys.path:
        sys.path.insert(0, workspace_root)
    train_and_evaluate()
