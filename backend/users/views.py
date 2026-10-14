from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user, generate an auth token, and set an HTTP-only cookie."""
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        
        response = Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
                "token": token.key,
            },
            status=status.HTTP_201_CREATED,
        )

        # Set HTTP-only cookie for Next.js SSR
        response.set_cookie(
            key="auth_token",
            value=token.key,
            httponly=True,
            samesite="Lax",
            secure=False,  # Set to True in production with HTTPS
        )
        return response

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    """Log in an existing user, return an auth token, and set an HTTP-only cookie."""
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"error": "Both username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(username=username, password=password)

    if not user:
        return Response(
            {"non_field_errors": ["Unable to log in with provided credentials."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    token, _ = Token.objects.get_or_create(user=user)
    
    response = Response(
        {
            "token": token.key,
            "user_id": user.pk,
            "username": user.username,
        },
        status=status.HTTP_200_OK,
    )

    # Set HTTP-only cookie for Next.js SSR
    response.set_cookie(
        key="auth_token",
        value=token.key,
        httponly=True,
        samesite="Lax",
        secure=False,  # Set to True in production with HTTPS
    )
    return response