from __future__ import annotations

from dataclasses import dataclass

from .base import BaseProvider, ConfirmIntentResult, CreateIntentResult, ProviderCustomer, ProviderEvent, ProviderIntentDetails, RefundResult
from ..enums import ProviderSlug


@dataclass(slots=True)
class IyziCoProvider(BaseProvider):  # pragma: no cover - stub
    api_key: str = ""
    secret_key: str = ""
    slug: str = ProviderSlug.IYZICO.value

    def create_intent(self, *args, **kwargs) -> CreateIntentResult:
        raise NotImplementedError("IyziCo integration is not implemented yet.")

    def confirm_intent(self, *args, **kwargs) -> ConfirmIntentResult:
        raise NotImplementedError("IyziCo integration is not implemented yet.")

    def retrieve_intent(self, *args, **kwargs) -> ProviderIntentDetails:
        raise NotImplementedError("IyziCo integration is not implemented yet.")

    def refund(self, *args, **kwargs) -> RefundResult:
        raise NotImplementedError("IyziCo integration is not implemented yet.")

    def webhook_is_valid(self, request) -> bool:
        raise NotImplementedError("IyziCo integration is not implemented yet.")

    def parse_webhook_event(self, request) -> ProviderEvent:
        raise NotImplementedError("IyziCo integration is not implemented yet.")

