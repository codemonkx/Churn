"""
Serializers for ChurnPredict REST API.
"""

from rest_framework import serializers


class PredictionRecordSerializer(serializers.Serializer):
    customerID = serializers.CharField()
    prediction = serializers.CharField()
    churn_probability = serializers.FloatField()
    tenure = serializers.IntegerField(required=False, default=0)
    MonthlyCharges = serializers.FloatField(required=False, default=0.0)
    TotalCharges = serializers.FloatField(required=False, default=0.0)
    Contract = serializers.CharField(required=False, default="N/A")
    InternetService = serializers.CharField(required=False, default="N/A")
    PaymentMethod = serializers.CharField(required=False, default="N/A")
    gender = serializers.CharField(required=False, default="N/A")
    SeniorCitizen = serializers.IntegerField(required=False, default=0)
    Partner = serializers.CharField(required=False, default="N/A")
    Dependents = serializers.CharField(required=False, default="N/A")
    PhoneService = serializers.CharField(required=False, default="N/A")
    MultipleLines = serializers.CharField(required=False, default="N/A")
    OnlineSecurity = serializers.CharField(required=False, default="N/A")
    OnlineBackup = serializers.CharField(required=False, default="N/A")
    DeviceProtection = serializers.CharField(required=False, default="N/A")
    TechSupport = serializers.CharField(required=False, default="N/A")
    StreamingTV = serializers.CharField(required=False, default="N/A")
    StreamingMovies = serializers.CharField(required=False, default="N/A")
    PaperlessBilling = serializers.CharField(required=False, default="N/A")


class PredictionResponseSerializer(serializers.Serializer):
    total_customers = serializers.IntegerField()
    predicted_churn = serializers.IntegerField()
    predicted_stay = serializers.IntegerField()
    churn_rate_pct = serializers.FloatField()
    threshold = serializers.FloatField()
    model_name = serializers.CharField()
    results = PredictionRecordSerializer(many=True)


class ExportRequestSerializer(serializers.Serializer):
    results = PredictionRecordSerializer(many=True)
