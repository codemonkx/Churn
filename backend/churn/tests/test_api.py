"""
Backend API and validation tests for ChurnPredict.
Tests health, schema, prediction, validation edge cases, template, and export endpoints.
"""

import io
import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def valid_csv_bytes():
    return (
        b"customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,"
        b"InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,"
        b"StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges\n"
        b"CUST-001,Female,0,Yes,No,12,Yes,No,DSL,Yes,No,No,Yes,No,No,Month-to-month,Yes,Electronic check,55.0,660.0\n"
        b"CUST-002,Male,0,No,No,48,Yes,Yes,Fiber optic,Yes,Yes,Yes,Yes,Yes,Yes,Two year,No,Credit card (automatic),105.0,5040.0\n"
        b"CUST-003,Female,1,No,No,2,Yes,No,Fiber optic,No,No,No,No,No,No,Month-to-month,Yes,Electronic check,75.0,150.0\n"
    )


@pytest.mark.django_db
def test_health_endpoint(client):
    url = reverse("health")
    response = client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_available"] is True
    assert "threshold" in data
    assert "model_name" in data


@pytest.mark.django_db
def test_schema_endpoint(client):
    url = reverse("schema")
    response = client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert "required_features" in data
    assert "numerical_features" in data
    assert "categorical_features" in data
    assert "upload_constraints" in data
    assert len(data["required_features"]) == 19


@pytest.mark.django_db
def test_model_info_endpoint(client):
    url = reverse("model-info")
    response = client.get(url)
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "final_evaluation_metrics" in data
    assert "model_comparison" in data


@pytest.mark.django_db
def test_template_download_endpoint(client):
    url = reverse("template")
    response = client.get(url)
    assert response.status_code == 200
    assert response["Content-Type"] == "text/csv"
    assert "attachment" in response["Content-Disposition"]
    assert b"customerID" in response.content


@pytest.mark.django_db
def test_predict_success(client, valid_csv_bytes):
    url = reverse("predict")
    uploaded_file = SimpleUploadedFile("customers.csv", valid_csv_bytes, content_type="text/csv")
    response = client.post(url, {"file": uploaded_file}, format="multipart")

    assert response.status_code == 200
    data = response.json()
    assert data["total_customers"] == 3
    assert data["predicted_churn"] + data["predicted_stay"] == 3
    assert len(data["results"]) == 3
    assert data["results"][0]["customerID"] == "CUST-001"
    assert "prediction" in data["results"][0]
    assert "churn_probability" in data["results"][0]


@pytest.mark.django_db
def test_predict_no_file_uploaded(client):
    url = reverse("predict")
    response = client.post(url, {}, format="multipart")
    assert response.status_code == 400
    assert "No file uploaded" in response.json()["error"]


@pytest.mark.django_db
def test_predict_invalid_extension(client):
    url = reverse("predict")
    uploaded_file = SimpleUploadedFile("data.txt", b"some,text,data", content_type="text/plain")
    response = client.post(url, {"file": uploaded_file}, format="multipart")
    assert response.status_code == 400
    assert "Only CSV (.csv) files are supported" in response.json()["error"]


@pytest.mark.django_db
def test_predict_empty_csv(client):
    url = reverse("predict")
    uploaded_file = SimpleUploadedFile("empty.csv", b"", content_type="text/csv")
    response = client.post(url, {"file": uploaded_file}, format="multipart")
    assert response.status_code == 400
    assert "empty" in response.json()["error"].lower()


@pytest.mark.django_db
def test_predict_incomplete_csv_auto_adapts(client):
    url = reverse("predict")
    csv_missing_cols = b"customerID,gender,tenure\nCUST-1,Female,12\n"
    uploaded_file = SimpleUploadedFile("incomplete.csv", csv_missing_cols, content_type="text/csv")
    response = client.post(url, {"file": uploaded_file}, format="multipart")
    assert response.status_code == 200
    data = response.json()
    assert data["total_customers"] == 1
    assert "auto_imputed_columns" in data["file_info"]
    assert "MonthlyCharges" in data["file_info"]["auto_imputed_columns"]



@pytest.mark.django_db
def test_predict_duplicate_columns(client):
    url = reverse("predict")
    csv_dup = (
        b"customerID,gender,gender,tenure\n"
        b"CUST-1,Female,Female,12\n"
    )
    uploaded_file = SimpleUploadedFile("dups.csv", csv_dup, content_type="text/csv")
    response = client.post(url, {"file": uploaded_file}, format="multipart")
    assert response.status_code == 400
    assert "duplicate" in response.json()["error"].lower()


@pytest.mark.django_db
def test_predict_extra_columns_safe(client, valid_csv_bytes):
    # Add an extra metadata column "region" and "notes"
    extra_csv = (
        b"customerID,gender,SeniorCitizen,Partner,Dependents,tenure,PhoneService,MultipleLines,"
        b"InternetService,OnlineSecurity,OnlineBackup,DeviceProtection,TechSupport,StreamingTV,"
        b"StreamingMovies,Contract,PaperlessBilling,PaymentMethod,MonthlyCharges,TotalCharges,region,notes\n"
        b"CUST-001,Female,0,Yes,No,12,Yes,No,DSL,Yes,No,No,Yes,No,No,Month-to-month,Yes,Electronic check,55.0,660.0,North,VIP\n"
    )
    url = reverse("predict")
    uploaded_file = SimpleUploadedFile("with_extra.csv", extra_csv, content_type="text/csv")
    response = client.post(url, {"file": uploaded_file}, format="multipart")
    assert response.status_code == 200
    data = response.json()
    assert data["total_customers"] == 1
    assert "extra_columns_ignored" in data["file_info"]
    assert "region" in data["file_info"]["extra_columns_ignored"]


@pytest.mark.django_db
def test_export_endpoint(client):
    url = reverse("export")
    payload = {
        "results": [
            {
                "customerID": "CUST-001",
                "prediction": "Likely to stay",
                "churn_probability": 0.12,
                "tenure": 36,
                "MonthlyCharges": 45.0,
                "TotalCharges": 1620.0,
                "Contract": "One year",
                "InternetService": "DSL",
                "PaymentMethod": "Credit card (automatic)",
            }
        ]
    }
    response = client.post(url, payload, format="json")
    assert response.status_code == 200
    assert response["Content-Type"] == "text/csv; charset=utf-8"
    assert "attachment" in response["Content-Disposition"]
    assert b"CUST-001" in response.content
    assert b"Likely to stay" in response.content


@pytest.mark.django_db
def test_predict_ecommerce_churn_adaptation(client):
    url = reverse("predict")
    ecommerce_csv = (
        b"security_no,age,gender,membership_category,joining_date,internet_option,avg_transaction_value,preferred_offer_types\n"
        b"SEC-001,25,F,No Membership,2017-01-10,Fiber_Optic,45000.0,Gift Vouchers/Coupons\n"
        b"SEC-002,68,M,Platinum Membership,2015-05-20,Wi-Fi,12000.0,Credit/Debit Card Offers\n"
    )
    uploaded_file = SimpleUploadedFile("ecommerce.csv", ecommerce_csv, content_type="text/csv")
    response = client.post(url, {"file": uploaded_file}, format="multipart")

    assert response.status_code == 200
    data = response.json()
    assert data["total_customers"] == 2
    assert data["results"][0]["customerID"] == "SEC-001"
    assert data["results"][0]["Contract"] == "Month-to-month"
    assert data["results"][1]["customerID"] == "SEC-002"
    assert data["results"][1]["Contract"] == "Two year"
    assert data["results"][0]["churn_probability"] > data["results"][1]["churn_probability"]
