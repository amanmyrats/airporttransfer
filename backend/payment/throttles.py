from __future__ import annotations

from rest_framework.throttling import SimpleRateThrottle


class PaymentIntentCreateThrottle(SimpleRateThrottle):
    scope = "payment_intent_create"

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = str(request.user.pk)
        else:
            ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


class PaymentIntentConfirmThrottle(SimpleRateThrottle):
    scope = "payment_intent_confirm"

    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = str(request.user.pk)
        else:
            ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}

