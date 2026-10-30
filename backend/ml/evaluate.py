"""
Model evaluation module for the Customer Churn prediction pipeline.
Provides standardized calculation of classification metrics, ROC-AUC,
confusion matrices, and threshold tuning.
"""

from typing import Dict, Any, Tuple
import numpy as np
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)


def evaluate_predictions(
    y_true: np.ndarray,
    y_pred_proba: np.ndarray,
    threshold: float = 0.5,
) -> Dict[str, Any]:
    """
    Compute full evaluation metrics given ground truth and predicted probabilities.
    """
    y_pred = (y_pred_proba >= threshold).astype(int)

    acc = float(accuracy_score(y_true, y_pred))
    prec = float(precision_score(y_true, y_pred, zero_division=0))
    rec = float(recall_score(y_true, y_pred, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, zero_division=0))
    try:
        auc = float(roc_auc_score(y_true, y_pred_proba))
    except ValueError:
        auc = 0.0

    cm = confusion_matrix(y_true, y_pred).tolist()
    # tn, fp, fn, tp = confusion_matrix(y_true, y_pred).ravel()
    report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)

    return {
        "threshold": round(threshold, 4),
        "accuracy": round(acc, 4),
        "precision": round(prec, 4),
        "recall": round(rec, 4),
        "f1_score": round(f1, 4),
        "roc_auc": round(auc, 4),
        "confusion_matrix": cm,
        "classification_report": report,
    }


def find_optimal_threshold(
    y_true: np.ndarray,
    y_pred_proba: np.ndarray,
    min_threshold: float = 0.20,
    max_threshold: float = 0.80,
    steps: int = 61,
) -> Tuple[float, Dict[str, Any]]:
    """
    Search for threshold that optimizes F1-score for the positive (churn) class
    while ensuring balanced recall and precision.
    """
    best_threshold = 0.5
    best_f1 = -1.0
    best_metrics = {}

    thresholds = np.linspace(min_threshold, max_threshold, steps)
    for t in thresholds:
        metrics = evaluate_predictions(y_true, y_pred_proba, threshold=float(t))
        if metrics["f1_score"] > best_f1:
            best_f1 = metrics["f1_score"]
            best_threshold = float(t)
            best_metrics = metrics

    return round(best_threshold, 3), best_metrics
