# backend/users/authentication.py
from rest_framework.authentication import TokenAuthentication

class CookieTokenAuthentication(TokenAuthentication):
    """
    Custom authentication class that checks the Authorization header first,
    then falls back to checking the 'auth_token' cookie.
    """
    def authenticate(self, request):
        # 1. Try default behavior (Authorization header)
        result = super().authenticate(request)
        if result is not None:
            return result

        # 2. Fallback to checking cookies
        token_key = request.COOKIES.get("auth_token")
        if not token_key:
            return None

        return self.authenticate_credentials(token_key)