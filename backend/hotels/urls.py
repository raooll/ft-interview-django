from django.urls import path

from .views import search_history, search_hotels, get_hotel

urlpatterns = [
    path("search", search_hotels, name="hotel-search"),
    path("history", search_history, name="hotel-search-history"),
    path("<str:hotel_id>/", get_hotel, name="hotel-detail"), 
]
