from django.apps import AppConfig


class PaymentConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "payment"
    verbose_name = "Payments"

    def ready(self) -> None:
        # Import signals on app ready without polluting module scope.
        from . import signals  # noqa: F401

