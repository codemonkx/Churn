from django.apps import AppConfig


class ChurnConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "churn"

    def ready(self):
        # Warm up the model predictor on app start to ensure artifact readiness
        try:
            from backend.ml.predict import get_predictor_service
            get_predictor_service()
        except Exception as e:
            # Keep startup resilient; predictor will report availability status in health endpoint
            pass
