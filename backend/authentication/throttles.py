from rest_framework.throttling import ScopedRateThrottle


class AuthBurstRateThrottle(ScopedRateThrottle):
    scope = 'auth_burst'


class AuthSensitiveRateThrottle(ScopedRateThrottle):
    scope = 'auth_sensitive'
