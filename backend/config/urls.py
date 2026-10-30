"""
URL configuration for ChurnPredict project.
"""

from django.urls import path, include

urlpatterns = [
    path("api/", include("churn.api.urls")),
]
