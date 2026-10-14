# users/urls.py
from django.urls import path
from .views import register_user, login_user

urlpatterns = [
    path("register/", register_user, name="auth-register"),
    path("login/", login_user, name="auth-login"),
]