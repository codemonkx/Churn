"""
URL routing for ChurnPredict REST API endpoints.
"""

from django.urls import path
from backend.churn.api.views import (
    HealthView,
    SchemaView,
    ModelInfoView,
    PredictView,
    TemplateView,
    ExportView,
)

urlpatterns = [
    path("health/", HealthView.as_view(), name="health"),
    path("schema/", SchemaView.as_view(), name="schema"),
    path("model-info/", ModelInfoView.as_view(), name="model-info"),
    path("predict/", PredictView.as_view(), name="predict"),
    path("template/", TemplateView.as_view(), name="template"),
    path("export/", ExportView.as_view(), name="export"),
]
