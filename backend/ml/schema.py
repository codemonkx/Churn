"""
Schema definitions for the Telco Customer Churn dataset and inference pipeline.
"""

from typing import List, Dict, Any

# Identifier column - retained for customer reference, but excluded from features
IDENTIFIER_COLUMN = "customerID"

# Target column - indicates historical churn ("Yes" / "No")
TARGET_COLUMN = "Churn"

# Positive and negative class labels in raw data
POSITIVE_TARGET_VALUE = "Yes"
NEGATIVE_TARGET_VALUE = "No"

# Prediction display labels
LABEL_LIKELY_TO_CANCEL = "Likely to cancel"
LABEL_LIKELY_TO_STAY = "Likely to stay"

# Numerical feature columns
NUMERICAL_FEATURES: List[str] = [
    "tenure",
    "MonthlyCharges",
    "TotalCharges",
]

# Categorical feature columns
CATEGORICAL_FEATURES: List[str] = [
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
]

# Complete set of required model features (excluding identifier and target)
FEATURE_COLUMNS: List[str] = NUMERICAL_FEATURES + CATEGORICAL_FEATURES

# Accepted values for categorical features for schema documentation and validation
ACCEPTED_CATEGORIES: Dict[str, List[Any]] = {
    "gender": ["Female", "Male"],
    "SeniorCitizen": [0, 1, "0", "1"],
    "Partner": ["Yes", "No"],
    "Dependents": ["Yes", "No"],
    "PhoneService": ["Yes", "No"],
    "MultipleLines": ["No", "Yes", "No phone service"],
    "InternetService": ["DSL", "Fiber optic", "No"],
    "OnlineSecurity": ["Yes", "No", "No internet service"],
    "OnlineBackup": ["Yes", "No", "No internet service"],
    "DeviceProtection": ["Yes", "No", "No internet service"],
    "TechSupport": ["Yes", "No", "No internet service"],
    "StreamingTV": ["Yes", "No", "No internet service"],
    "StreamingMovies": ["Yes", "No", "No internet service"],
    "Contract": ["Month-to-month", "One year", "Two year"],
    "PaperlessBilling": ["Yes", "No"],
    "PaymentMethod": [
        "Electronic check",
        "Mailed check",
        "Bank transfer (automatic)",
        "Credit card (automatic)",
    ],
}

# Upload constraints (Unlimited)
MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024  # 500 MB virtually unlimited
MAX_ROW_COUNT = 10_000_000  # Virtually unlimited (up to 10M rows)
ALLOWED_EXTENSIONS = [".csv"]
