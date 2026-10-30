"""
Unit and integration tests for the Machine Learning pipeline.
Covers preprocessing, prediction probability ranges, threshold consistency,
handling of unseen categories, and metric calculations.
"""

import pytest
import numpy as np
import pandas as pd

from backend.ml.schema import (
    FEATURE_COLUMNS,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    LABEL_LIKELY_TO_CANCEL,
    LABEL_LIKELY_TO_STAY,
)
from backend.ml.transformers import SafeNumericalTransformer, SafeCategoricalTransformer
from backend.ml.evaluate import evaluate_predictions, find_optimal_threshold
from backend.ml.predict import get_predictor_service


@pytest.fixture
def sample_customer_record():
    return {
        "customerID": "TEST-001",
        "gender": "Female",
        "SeniorCitizen": 0,
        "Partner": "Yes",
        "Dependents": "No",
        "tenure": 12,
        "PhoneService": "Yes",
        "MultipleLines": "No",
        "InternetService": "DSL",
        "OnlineSecurity": "Yes",
        "OnlineBackup": "No",
        "DeviceProtection": "No",
        "TechSupport": "Yes",
        "StreamingTV": "No",
        "StreamingMovies": "No",
        "Contract": "Month-to-month",
        "PaperlessBilling": "Yes",
        "PaymentMethod": "Electronic check",
        "MonthlyCharges": 55.0,
        "TotalCharges": "660.0",
    }


def test_safe_numerical_transformer_handles_whitespace_and_invalid():
    transformer = SafeNumericalTransformer()
    df = pd.DataFrame({
        "a": ["12.5", " ", None, "NaN", "invalid", 99.0]
    })
    transformed = transformer.transform(df)
    assert np.isnan(transformed[1, 0])
    assert np.isnan(transformed[2, 0])
    assert np.isnan(transformed[4, 0])
    assert transformed[0, 0] == 12.5
    assert transformed[5, 0] == 99.0


def test_safe_categorical_transformer_handles_nulls():
    transformer = SafeCategoricalTransformer()
    df = pd.DataFrame({
        "cat": ["DSL", None, np.nan, "Fiber optic"]
    })
    transformed = transformer.transform(df)
    assert transformed[0, 0] == "DSL"
    assert transformed[1, 0] == "missing"
    assert transformed[2, 0] == "missing"
    assert transformed[3, 0] == "Fiber optic"


def test_evaluation_metrics_calculation():
    y_true = np.array([0, 1, 1, 0, 1])
    y_proba = np.array([0.1, 0.8, 0.6, 0.3, 0.9])
    metrics = evaluate_predictions(y_true, y_proba, threshold=0.5)

    assert metrics["accuracy"] == 1.0
    assert metrics["precision"] == 1.0
    assert metrics["recall"] == 1.0
    assert metrics["f1_score"] == 1.0
    assert metrics["roc_auc"] == 1.0
    assert metrics["confusion_matrix"] == [[2, 0], [0, 3]]


def test_find_optimal_threshold():
    y_true = np.array([0, 0, 1, 1, 1])
    y_proba = np.array([0.2, 0.45, 0.48, 0.7, 0.9])
    # At 0.5 threshold, row 2 (proba 0.48) is classified as 0, yielding recall = 2/3
    # At 0.47 threshold, row 2 is classified as 1, yielding 100% recall and precision
    best_t, metrics = find_optimal_threshold(y_true, y_proba, min_threshold=0.3, max_threshold=0.6, steps=31)
    assert 0.45 <= best_t <= 0.48
    assert metrics["f1_score"] == 1.0


def test_predictor_service_batch(sample_customer_record):
    service = get_predictor_service()
    assert service.is_available()

    # Create 3 records with variation
    rec2 = dict(sample_customer_record, customerID="TEST-002", tenure=72, Contract="Two year", MonthlyCharges=20.0, TotalCharges="1440.0")
    rec3 = dict(sample_customer_record, customerID="TEST-003", tenure=1, Contract="Month-to-month", MonthlyCharges=110.0, TotalCharges="110.0")
    df = pd.DataFrame([sample_customer_record, rec2, rec3])

    result = service.predict_dataframe(df)
    assert result["total_customers"] == 3
    assert result["predicted_churn"] + result["predicted_stay"] == 3
    assert len(result["results"]) == 3

    for item in result["results"]:
        assert 0.0 <= item["churn_probability"] <= 1.0
        if item["churn_probability"] >= result["threshold"]:
            assert item["prediction"] == LABEL_LIKELY_TO_CANCEL
        else:
            assert item["prediction"] == LABEL_LIKELY_TO_STAY


def test_predictor_handles_unseen_categories(sample_customer_record):
    service = get_predictor_service()
    # Modify categories to completely unseen values
    rec = dict(sample_customer_record)
    rec["Contract"] = "Super-Enterprise-Ten-Year-Plan"
    rec["InternetService"] = "Satellite-Quantum"
    rec["PaymentMethod"] = "Crypto-Bitcoin"
    rec["gender"] = "NonBinary"
    df = pd.DataFrame([rec])

    # Should safely predict without crashing
    result = service.predict_dataframe(df)
    assert result["total_customers"] == 1
    assert 0.0 <= result["results"][0]["churn_probability"] <= 1.0


def test_predictor_drops_churn_column_to_prevent_leakage(sample_customer_record):
    service = get_predictor_service()
    rec = dict(sample_customer_record)
    rec["Churn"] = "Yes"  # Should be ignored and never passed into model features
    df = pd.DataFrame([rec])

    result = service.predict_dataframe(df)
    assert result["total_customers"] == 1
    assert "prediction" in result["results"][0]


def test_predictor_raises_on_missing_required_features(sample_customer_record):
    service = get_predictor_service()
    rec = dict(sample_customer_record)
    del rec["tenure"]  # Missing required column
    df = pd.DataFrame([rec])

    with pytest.raises(ValueError, match="missing required feature column"):
        service.predict_dataframe(df)
