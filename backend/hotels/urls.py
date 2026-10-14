from django.urls import path

from .views import search_history, search_hotels, get_hotel, favorites_list_create, favorite_delete

urlpatterns = [
    path("search", search_hotels, name="hotel-search"),
    path("history", search_history, name="hotel-search-history"),

    path("favorites/", favorites_list_create, name="favorites-list-create"),
    path("favorites/<str:hotel_id>/", favorite_delete, name="favorite-delete"),

    path("<str:hotel_id>/", get_hotel, name="hotel-detail"), 
]
