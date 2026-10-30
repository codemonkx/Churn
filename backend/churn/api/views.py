"""
API Views for ChurnPredict full-stack application.
Provides endpoints for health checks, schema discovery, model metadata,
batch prediction via CSV, template download, and CSV export.
"""

import os
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.exceptions import ValidationError

from backend.ml.schema import (
    FEATURE_COLUMNS,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    ACCEPTED_CATEGORIES,
    IDENTIFIER_COLUMN,
    TARGET_COLUMN,
    MAX_FILE_SIZE_BYTES,
    MAX_ROW_COUNT,
)
from backend.ml.predict import get_predictor_service
from backend.churn.services.csv_validator import CSVValidationService
from backend.churn.services.result_exporter import ResultExporterService
from backend.churn.api.serializers import (
    PredictionResponseSerializer,
    ExportRequestSerializer,
)


class HealthView(APIView):
    """
    Health check endpoint returning API status and model availability.
    """

    def get(self, request):
        try:
            predictor = get_predictor_service()
            model_available = predictor.is_available()
            model_name = predictor.model_name
            threshold = predictor.threshold
        except Exception:
            model_available = False
            model_name = "Unavailable"
            threshold = 0.5

        return Response(
            {
                "status": "healthy" if model_available else "degraded",
                "service": "ChurnPredict API",
                "version": "1.0.0",
                "model_available": model_available,
                "model_name": model_name,
                "threshold": threshold,
            },
            status=status.HTTP_200_OK if model_available else status.HTTP_503_SERVICE_UNAVAILABLE,
        )


class SchemaView(APIView):
    """
    Returns required CSV schema, column types, category specifications, and upload limits.
    """

    def get(self, request):
        return Response(
            {
                "identifier_column": IDENTIFIER_COLUMN,
                "target_column": TARGET_COLUMN,
                "total_required_features": len(FEATURE_COLUMNS),
                "required_features": FEATURE_COLUMNS,
                "numerical_features": NUMERICAL_FEATURES,
                "categorical_features": CATEGORICAL_FEATURES,
                "accepted_categories": ACCEPTED_CATEGORIES,
                "upload_constraints": {
                    "max_file_size_bytes": MAX_FILE_SIZE_BYTES,
                    "max_file_size_mb": MAX_FILE_SIZE_BYTES / (1024 * 1024),
                    "max_row_count": MAX_ROW_COUNT,
                    "allowed_extensions": [".csv"],
                },
                "sample_row": {
                    "customerID": "DEMO-001",
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
                    "TotalCharges": 660.0,
                },
            },
            status=status.HTTP_200_OK,
        )


class ModelInfoView(APIView):
    """
    Returns trained model comparison metrics, confusion matrix, and selection rationale.
    """

    def get(self, request):
        predictor = get_predictor_service()
        metadata = predictor.get_metadata()
        return Response(metadata, status=status.HTTP_200_OK)


class PredictView(APIView):
    """
    Primary prediction endpoint: accepts multipart CSV file upload,
    validates schema, executes ML pipeline inference, and returns predictions.
    """

    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response(
                {"error": "No file uploaded. Please supply a CSV file in the 'file' field."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # 1. Validate and parse CSV
            df, metadata = CSVValidationService.validate_and_parse(uploaded_file)

            # 2. Execute ML inference pipeline
            predictor = get_predictor_service()
            prediction_response = predictor.predict_dataframe(df)

            # 3. Add file metadata
            prediction_response["file_info"] = metadata

            return Response(prediction_response, status=status.HTTP_200_OK)

        except ValidationError as ve:
            return Response(ve.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Secure handling: do not expose internal stack traces
            return Response(
                {"error": f"An error occurred while processing predictions: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class TemplateView(APIView):
    """
    Provides downloadable sample CSV datasets for testing.
    Supports ?type=sample (25 customer diverse cohort with churners)
    and ?type=blank (minimal starter template).
    """

    def get(self, request):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        req_type = request.GET.get("type", "sample")

        if req_type == "blank":
            filename = "sample_template.csv"
            download_name = "sample_customers_template.csv"
        else:
            filename = "sample_customers_test.csv"
            download_name = "sample_customers_cohort.csv"

        template_path = os.path.join(base_dir, "artifacts", filename)
        if not os.path.exists(template_path):
            template_path = os.path.join(base_dir, "artifacts", "sample_template.csv")
            download_name = "sample_customers_template.csv"

        if os.path.exists(template_path):
            with open(template_path, "r", encoding="utf-8") as f:
                content = f.read()
        else:
            # Fallback inline template
            content = (
                "customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,"
                "InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,"
                "StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges\n"
                "CUST-001,Female,0,Yes,No,12,Yes,No,DSL,Yes,No,No,Yes,No,No,Month-to-month,Yes,Electronic check,55.0,660.0\n"
                "CUST-002,Male,0,No,No,48,Yes,Yes,Fiber optic,Yes,Yes,Yes,Yes,Yes,Yes,Two year,No,Credit card (automatic),105.0,5040.0\n"
            )

        response = HttpResponse(content, content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{download_name}"'
        return response


class ExportView(APIView):
    """
    Generates downloadable CSV containing prediction outputs.
    """

    parser_classes = [JSONParser]

    def post(self, request):
        serializer = ExportRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        results = serializer.validated_data.get("results", [])
        csv_data = ResultExporterService.generate_csv(results)

        response = HttpResponse(csv_data, content_type="text/csv; charset=utf-8")
        response["Content-Disposition"] = 'attachment; filename="churn_predictions_export.csv"'
        return response
