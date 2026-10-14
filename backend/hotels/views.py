from datetime import date

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .amadeus import AmadeusError, get_client
from .models import HotelSearch, Favorite
from .serializers import HotelSearchSerializer, FavoriteSerializer
from rest_framework.permissions import IsAuthenticated



def _parse_date(value: str | None) -> date | None:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


@api_view(["GET"])
def search_hotels(request):
    """Search hotel offers via Amadeus.

    Query params:
      cityCode       IATA city code (required, e.g. 'PAR')
      checkInDate    YYYY-MM-DD (required)
      checkOutDate   YYYY-MM-DD (required)
      adults         integer, default 1
      limit          max hotels to query offers for (default 20)
    """
    city_code = (request.query_params.get("cityCode") or "").strip().upper()
    check_in = _parse_date(request.query_params.get("checkInDate"))
    check_out = _parse_date(request.query_params.get("checkOutDate"))
    try:
        adults = max(1, int(request.query_params.get("adults", "1")))
    except ValueError:
        adults = 1
    try:
        limit = max(1, min(50, int(request.query_params.get("limit", "20"))))
    except ValueError:
        limit = 20

    errors: dict[str, str] = {}
    if not city_code:
        errors["cityCode"] = "Required IATA city code (e.g. 'PAR')."
    if not check_in:
        errors["checkInDate"] = "Required date in YYYY-MM-DD."
    if not check_out:
        errors["checkOutDate"] = "Required date in YYYY-MM-DD."
    if check_in and check_out and check_out <= check_in:
        errors["checkOutDate"] = "checkOutDate must be after checkInDate."
    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    client = get_client()
    try:
        hotels = client.hotels_by_city(city_code, limit=limit)
        hotel_ids = [h["hotelId"] for h in hotels if h.get("hotelId")]
        offers = client.hotel_offers(
            hotel_ids,
            check_in_date=check_in.isoformat(),
            check_out_date=check_out.isoformat(),
            adults=adults,
        )
    except AmadeusError as exc:
        return Response(
            {"error": "amadeus_error", "detail": str(exc)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    print(request.user)

    # Check favorites for authenticated users in a single efficient query
    user_favorites = set()
    if request.user and request.user.is_authenticated:
        # Extract hotel IDs present in the returned offers
        offer_hotel_ids = [
            offer.get("hotel", {}).get("hotelId")
            for offer in offers
            if offer.get("hotel", {}).get("hotelId")
        ]

        if offer_hotel_ids:
            user_favorites = set(
                Favorite.objects.filter(
                    user=request.user, hotel_id__in=offer_hotel_ids
                ).values_list("hotel_id", flat=True)
            )

    # Inject is_favorite status into each offer's hotel object
    for offer in offers:
        hotel_data = offer.get("hotel")
        if isinstance(hotel_data, dict):
            h_id = hotel_data.get("hotelId")
            hotel_data["favorite"] = h_id in user_favorites if h_id else False

    HotelSearch.objects.create(
        city_code=city_code,
        check_in_date=check_in,
        check_out_date=check_out,
        adults=adults,
        result_count=len(offers),
    )

    return Response(
        {
            "query": {
                "cityCode": city_code,
                "checkInDate": check_in.isoformat(),
                "checkOutDate": check_out.isoformat(),
                "adults": adults,
            },
            "count": len(offers),
            "results": offers,
        }
    )


@api_view(["GET"])
def search_history(_request):
    """Most recent hotel searches. Useful as a built-in 'something to extend'."""
    qs = HotelSearch.objects.all()[:20]
    return Response(HotelSearchSerializer(qs, many=True).data)

@api_view(["GET"])
def get_hotel(request, hotel_id: str):
    """Get hotel details and offers by hotel ID.

    Path param:
      hotel_id       Amadeus hotel ID (required)
    """

    errors: dict[str, str] = {}
    if not hotel_id:
        errors["hotelId"] = "Required hotel ID."

    if errors:
        return Response({"errors": errors}, status=status.HTTP_400_BAD_REQUEST)

    client = get_client()
    try:
        hotel = client.get_hotel_by_id(
            hotel_id
        )
    except AmadeusError as exc:
        return Response(
            {"error": "amadeus_error", "detail": str(exc)},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    if not hotel:
        return Response(
            {"error": "Hotel not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    is_favorite = False
    if request.user and request.user.is_authenticated:
        is_favorite = Favorite.objects.filter(user=request.user, hotel_id=hotel_id).exists()

    if isinstance(hotel, dict):
        hotel["favorite"] = is_favorite
    else:
        try:
            hotel["favorite"] = is_favorite
        except (TypeError, KeyError):
            pass

    return Response(hotel)


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def favorites_list_create(request):
    """List all favorites for the authenticated user, or add a new favorite."""
    if request.method == "GET":
        favorites = Favorite.objects.filter(user=request.user)
        serializer = FavoriteSerializer(favorites, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = FavoriteSerializer(data=request.data)
        if serializer.is_valid():
            hotel_id = serializer.validated_data.get("hotel_id")
            
            # Prevent duplicate favorites for the same user
            if Favorite.objects.filter(user=request.user, hotel_id=hotel_id).exists():
                return Response(
                    {"error": "Hotel is already in favorites."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def favorite_delete(request, hotel_id: str):
    """Remove a hotel from the authenticated user's favorites by hotel_id."""
    try:
        favorite = Favorite.objects.get(user=request.user, hotel_id=hotel_id)
        favorite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Favorite.DoesNotExist:
        return Response(
            {"error": "Favorite not found."},
            status=status.HTTP_404_NOT_FOUND
        )