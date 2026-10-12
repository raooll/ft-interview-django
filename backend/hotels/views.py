from datetime import date

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .amadeus import AmadeusError, get_client
from .models import HotelSearch
from .serializers import HotelSearchSerializer


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
