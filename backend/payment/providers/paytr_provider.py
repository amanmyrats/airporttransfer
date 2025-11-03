from __future__ import annotations

from dataclasses import dataclass

from .base import BaseProvider, ConfirmIntentResult, CreateIntentResult, ProviderCustomer, ProviderEvent, ProviderIntentDetails, RefundResult
from ..enums import ProviderSlug


@dataclass(slots=True)
class PayTRProvider(BaseProvider):  # pragma: no cover - stub
    merchant_id: str = ""
    merchant_key: str = ""
    merchant_salt: str = ""
    slug: str = ProviderSlug.PAYTR.value

    def create_intent(self, *args, **kwargs) -> CreateIntentResult:
        raise NotImplementedError("PayTR integration is not implemented yet.")

    def confirm_intent(self, *args, **kwargs) -> ConfirmIntentResult:
        raise NotImplementedError("PayTR integration is not implemented yet.")

    def retrieve_intent(self, *args, **kwargs) -> ProviderIntentDetails:
        raise NotImplementedError("PayTR integration is not implemented yet.")

    def refund(self, *args, **kwargs) -> RefundResult:
        raise NotImplementedError("PayTR integration is not implemented yet.")

    def webhook_is_valid(self, request) -> bool:
        raise NotImplementedError("PayTR integration is not implemented yet.")

    def parse_webhook_event(self, request) -> ProviderEvent:
        raise NotImplementedError("PayTR integration is not implemented yet.")

