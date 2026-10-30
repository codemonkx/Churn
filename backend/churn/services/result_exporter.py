"""
Service for exporting churn prediction results into standardized CSV format.
"""

import io
import csv
from typing import List, Dict, Any


class ResultExporterService:
    """
    Constructs a clean, downloadable CSV byte stream from prediction results.
    """

    DEFAULT_COLUMNS = [
        "customerID",
        "prediction",
        "churn_probability",
        "tenure",
        "Contract",
        "MonthlyCharges",
        "TotalCharges",
        "InternetService",
        "PaymentMethod",
        "gender",
        "SeniorCitizen",
        "Partner",
        "Dependents",
        "PhoneService",
        "MultipleLines",
        "OnlineSecurity",
        "OnlineBackup",
        "DeviceProtection",
        "TechSupport",
        "StreamingTV",
        "StreamingMovies",
        "PaperlessBilling",
    ]

    @classmethod
    def generate_csv(cls, results: List[Dict[str, Any]]) -> str:
        """
        Takes list of prediction records and returns formatted CSV text.
        """
        if not results:
            return ""

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=cls.DEFAULT_COLUMNS, extrasaction="ignore")
        writer.writeheader()

        for row in results:
            writer.writerow(row)

        return output.getvalue()
