from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, SAFE_METHODS

class PublicReadMixin:
    def get_authenticators(self):
        # Don’t attempt auth on read-only requests (avoids token_not_valid)
        if self.request and self.request.method in SAFE_METHODS:
            return []
        return super().get_authenticators()
