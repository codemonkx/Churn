"""
CSV validation and schema adaptation service for Customer Churn file uploads.
Supports smart delimiter detection, case-insensitive column aliasing,
and adaptive default imputation so any customer CSV can be evaluated.
"""

import io
import re
import csv
from typing import Tuple, List, Dict, Any, Optional
import pandas as pd
from rest_framework.exceptions import ValidationError

from backend.ml.schema import (
    FEATURE_COLUMNS,
    IDENTIFIER_COLUMN,
    TARGET_COLUMN,
    MAX_FILE_SIZE_BYTES,
    MAX_ROW_COUNT,
)

# Comprehensive column aliasing dictionary
COLUMN_ALIASES: Dict[str, List[str]] = {
    "tenure": [
        "tenure",
        "tenuremonths",
        "tenuremonth",
        "months",
        "monthsactive",
        "duration",
        "tenureinmonths",
        "period",
        "tenure_months",
    ],
    "MonthlyCharges": [
        "monthlycharges",
        "monthlycharge",
        "monthlybill",
        "monthlybilling",
        "charge",
        "monthlyfee",
        "charges",
        "monthly",
        "bill",
        "mrr",
        "amount",
        "monthly_charges",
        "monthly_charge",
        "avg_transaction_value",
        "avgtransactionvalue",
        "transaction_value",
    ],
    "TotalCharges": [
        "totalcharges",
        "totalcharge",
        "totalbill",
        "totalamount",
        "total",
        "lifetimevalue",
        "clv",
        "revenue",
        "cumulativecharges",
        "total_charges",
        "total_charge",
    ],
    "gender": ["gender", "sex"],
    "SeniorCitizen": [
        "seniorcitizen",
        "senior",
        "issenior",
        "agegroup",
        "is_senior",
        "senior_citizen",
        "age",
    ],
    "Partner": [
        "partner",
        "haspartner",
        "married",
        "maritalstatus",
        "joined_through_referral",
        "joinedthroughreferral",
    ],
    "Dependents": [
        "dependents",
        "hasdependents",
        "children",
        "haschildren",
        "used_special_discount",
        "usedspecialdiscount",
    ],
    "PhoneService": ["phoneservice", "hasphone", "phone", "voice", "telephone"],
    "MultipleLines": ["multiplelines", "additionallines", "multiline"],
    "InternetService": [
        "internetservice",
        "internet",
        "connectiontype",
        "plantype",
        "isp",
        "broadband",
        "internetservices",
        "internet_option",
        "internetoption",
    ],
    "OnlineSecurity": ["onlinesecurity", "security", "antivirus", "cybersecurity"],
    "OnlineBackup": ["onlinebackup", "backup", "cloudbackup"],
    "DeviceProtection": ["deviceprotection", "protection", "insurance", "warranty"],
    "TechSupport": ["techsupport", "support", "prioritysupport"],
    "StreamingTV": ["streamingtv", "tv", "cable", "iptv", "television"],
    "StreamingMovies": ["streamingmovies", "movies", "vod", "cinema"],
    "Contract": [
        "contract",
        "contracttype",
        "term",
        "plan",
        "subscriptiontype",
        "billingcycle",
        "commitment",
        "agreement",
        "membership_category",
        "membershipcategory",
        "membership",
    ],
    "PaperlessBilling": [
        "paperlessbilling",
        "paperless",
        "ebill",
        "digitalbilling",
        "offer_application_preference",
        "offerapplicationpreference",
    ],
    "PaymentMethod": [
        "paymentmethod",
        "payment",
        "paymenttype",
        "method",
        "billingmethod",
        "payment_method",
        "preferred_offer_types",
        "preferredoffertypes",
        "offertype",
    ],
    "customerID": [
        "customerid",
        "custid",
        "id",
        "clientid",
        "userid",
        "accountid",
        "subscriberid",
        "accountnumber",
        "customer_id",
        "cust_id",
        "security_no",
        "securityno",
        "referral_id",
        "referralid",
    ],
    "Churn": [
        "churn",
        "churned",
        "churnstatus",
        "cancelled",
        "is_churn",
        "churn_risk_score",
        "churnriskscore",
        "churn_risk",
        "exited",
    ],
}

# Standard balanced baseline defaults when features are omitted in an uploaded file
DEFAULT_FEATURE_VALUES: Dict[str, Any] = {
    "tenure": 29,
    "MonthlyCharges": 64.0,
    "TotalCharges": 1400.0,
    "gender": "Male",
    "SeniorCitizen": 0,
    "Partner": "No",
    "Dependents": "No",
    "PhoneService": "Yes",
    "MultipleLines": "No",
    "InternetService": "DSL",
    "OnlineSecurity": "No",
    "OnlineBackup": "No",
    "DeviceProtection": "No",
    "TechSupport": "No",
    "StreamingTV": "No",
    "StreamingMovies": "No",
    "Contract": "One year",
    "PaperlessBilling": "No",
    "PaymentMethod": "Bank transfer (automatic)",
}

VALUE_NORMALIZATIONS: Dict[str, Dict[str, str]] = {
    "Contract": {
        "month-to-month": "Month-to-month",
        "month to month": "Month-to-month",
        "monthly": "Month-to-month",
        "m2m": "Month-to-month",
        "month": "Month-to-month",
        "no membership": "Month-to-month",
        "basic membership": "Month-to-month",
        "one year": "One year",
        "1 year": "One year",
        "1year": "One year",
        "1 yr": "One year",
        "one-year": "One year",
        "annual": "One year",
        "yearly": "One year",
        "silver membership": "One year",
        "two year": "Two year",
        "2 year": "Two year",
        "2year": "Two year",
        "2 yr": "Two year",
        "two-year": "Two year",
        "biennial": "Two year",
        "gold membership": "Two year",
        "platinum membership": "Two year",
        "premium membership": "Two year",
    },
    "InternetService": {
        "dsl": "DSL",
        "fiber optic": "Fiber optic",
        "fiber": "Fiber optic",
        "fiberoptic": "Fiber optic",
        "fibre": "Fiber optic",
        "fiber_optic": "Fiber optic",
        "wi-fi": "DSL",
        "wifi": "DSL",
        "mobile_data": "DSL",
        "mobile data": "DSL",
        "none": "No",
        "no": "No",
        "no internet": "No",
    },
    "PaymentMethod": {
        "electronic check": "Electronic check",
        "e-check": "Electronic check",
        "echeck": "Electronic check",
        "mailed check": "Mailed check",
        "check": "Mailed check",
        "cheque": "Mailed check",
        "bank transfer": "Bank transfer (automatic)",
        "bank transfer (automatic)": "Bank transfer (automatic)",
        "bank": "Bank transfer (automatic)",
        "ach": "Bank transfer (automatic)",
        "credit card": "Credit card (automatic)",
        "credit card (automatic)": "Credit card (automatic)",
        "credit": "Credit card (automatic)",
        "card": "Credit card (automatic)",
        "auto": "Credit card (automatic)",
        "credit/debit card offers": "Credit card (automatic)",
        "gift vouchers/coupons": "Electronic check",
        "without offers": "Mailed check",
    },
    "gender": {
        "female": "Female",
        "f": "Female",
        "woman": "Female",
        "male": "Male",
        "m": "Male",
        "man": "Male",
    },
}


def _clean_key(s: Any) -> str:
    """Normalize string for fuzzy header matching."""
    return re.sub(r"[^a-zA-Z0-9]", "", str(s)).lower()


class CSVValidationService:
    """
    Validates and adapts uploaded CSV files against structural, security,
    and machine learning schema constraints.
    """

    @classmethod
    def validate_and_parse(
        cls,
        uploaded_file,
    ) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        # 1. Existence check
        if uploaded_file is None:
            raise ValidationError({"error": "No file was provided in the request."})

        # 2. Filename check
        filename = getattr(uploaded_file, "name", "")
        if not filename.lower().endswith(".csv"):
            raise ValidationError({
                "error": "Invalid file type. Only CSV (.csv) files are supported.",
                "provided_file": filename,
            })

        # 3. File size check
        size = getattr(uploaded_file, "size", 0)
        if size == 0:
            raise ValidationError({"error": "Uploaded CSV file is empty (0 bytes)."})

        # 4. Safe read & decoding
        try:
            sample_bytes = uploaded_file.read(4096)
            uploaded_file.seek(0)
            if b"\x00" in sample_bytes:
                raise ValidationError({"error": "Uploaded file appears to be binary, not a valid plain-text CSV."})

            content = uploaded_file.read()
            uploaded_file.seek(0)
            text_content = content.decode("utf-8-sig", errors="replace")
        except Exception as e:
            raise ValidationError({"error": f"Failed to read file encoding: {str(e)}"})

        # 5. Safe delimiter sniffing
        first_line = text_content.splitlines()[0] if text_content.splitlines() else ""
        if not first_line.strip():
            raise ValidationError({"error": "Uploaded CSV file has no content or headers."})

        delimiter = ","
        for d in [",", ";", "\t", "|"]:
            if d in first_line:
                delimiter = d
                break

        # Check duplicate column headers
        raw_headers = [h.strip() for h in first_line.split(delimiter)]
        if len(raw_headers) != len(set(raw_headers)):
            duplicates = [h for h in raw_headers if raw_headers.count(h) > 1]
            raise ValidationError({
                "error": "Uploaded CSV contains duplicate column headers.",
                "duplicate_columns": list(set(duplicates)),
            })

        try:
            df = pd.read_csv(io.StringIO(text_content), sep=delimiter)
        except ValidationError:
            raise
        except Exception as e:
            raise ValidationError({"error": f"Malformed CSV structure: {str(e)}"})

        # Check row count
        row_count = len(df)
        if row_count == 0:
            raise ValidationError({"error": "The uploaded CSV contains 0 customer records."})

        # 6. Smart Column Name Aliasing (guarantees unique canonical mapping)
        renames = {}
        mapped_canonicals = set()
        for col in df.columns:
            cleaned_col = _clean_key(col)
            for canonical, aliases in COLUMN_ALIASES.items():
                if canonical in mapped_canonicals:
                    continue
                alias_clean = [_clean_key(a) for a in aliases]
                if cleaned_col in alias_clean:
                    renames[col] = canonical
                    mapped_canonicals.add(canonical)
                    break

        df.rename(columns=renames, inplace=True)

        # Value normalizations (case-insensitive & synonym mapping)
        for col_name, val_map in VALUE_NORMALIZATIONS.items():
            if col_name in df.columns:
                df[col_name] = (
                    df[col_name]
                    .astype(str)
                    .str.strip()
                    .apply(lambda v: val_map.get(v.lower(), v) if isinstance(v, str) else v)
                )

        # Normalize binary Yes/No columns
        binary_cols = [
            "Partner",
            "Dependents",
            "PhoneService",
            "PaperlessBilling",
            "OnlineSecurity",
            "OnlineBackup",
            "DeviceProtection",
            "TechSupport",
            "StreamingTV",
            "StreamingMovies",
        ]
        for bcol in binary_cols:
            if bcol in df.columns:
                df[bcol] = (
                    df[bcol]
                    .astype(str)
                    .str.strip()
                    .apply(
                        lambda v: "Yes"
                        if v.lower() in ["1", "true", "yes", "y"]
                        else ("No" if v.lower() in ["0", "false", "no", "n"] else v)
                    )
                )

        # Check customerID
        has_customer_id = IDENTIFIER_COLUMN in df.columns
        if not has_customer_id:
            df[IDENTIFIER_COLUMN] = [f"CUST-{idx+1:05d}" for idx in range(row_count)]

        # Derive tenure from joining_date if tenure column is missing
        if "tenure" not in df.columns:
            for date_col in ["joining_date", "joiningdate", "join_date", "created_at", "signup_date"]:
                if date_col in df.columns:
                    try:
                        j_dates = pd.to_datetime(df[date_col], errors="coerce")
                        ref_date = j_dates.max() if not j_dates.isna().all() else pd.Timestamp.now()
                        df["tenure"] = ((ref_date - j_dates).dt.days / 30.4).clip(lower=1, upper=72).fillna(12).astype(int)
                        break
                    except Exception:
                        pass

        # Handle age -> SeniorCitizen conversion if age numbers were supplied
        if "SeniorCitizen" in df.columns:
            sc_series = pd.to_numeric(df["SeniorCitizen"], errors="coerce").fillna(35)
            if sc_series.max() > 1:
                df["SeniorCitizen"] = (sc_series >= 60).astype(int)

        # Rescale MonthlyCharges if raw values are high total transaction amounts
        if "MonthlyCharges" in df.columns:
            m_series = pd.to_numeric(df["MonthlyCharges"], errors="coerce").fillna(64.0)
            if m_series.mean() > 500:
                df["MonthlyCharges"] = (20.0 + (m_series / 100000.0) * 95.0).clip(lower=20.0, upper=118.0).round(2)

        # 7. Adaptive Schema Completion:
        # Check if any required feature columns are missing
        missing_columns = [col for col in FEATURE_COLUMNS if col not in df.columns]
        auto_imputed_columns = []

        if missing_columns:
            # Auto-fill missing columns with default baseline values so any customer dataset can be evaluated
            for missing_col in missing_columns:
                default_val = DEFAULT_FEATURE_VALUES.get(missing_col, 0)
                # If tenure and MonthlyCharges are present, calculate estimated TotalCharges
                if missing_col == "TotalCharges" and "tenure" in df.columns and "MonthlyCharges" in df.columns:
                    t_num = pd.to_numeric(df["tenure"], errors="coerce").fillna(24)
                    m_num = pd.to_numeric(df["MonthlyCharges"], errors="coerce").fillna(65.0)
                    df["TotalCharges"] = (t_num * m_num).round(2)
                else:
                    df[missing_col] = default_val
                auto_imputed_columns.append(missing_col)

        # 8. Extra columns metadata
        extra_columns = [
            col for col in df.columns
            if col not in FEATURE_COLUMNS and col not in [IDENTIFIER_COLUMN, TARGET_COLUMN]
        ]

        metadata = {
            "filename": filename,
            "row_count": row_count,
            "has_customer_id": has_customer_id,
            "has_target_column": TARGET_COLUMN in df.columns,
            "auto_imputed_columns": auto_imputed_columns,
            "extra_columns_ignored": extra_columns,
        }

        return df, metadata
