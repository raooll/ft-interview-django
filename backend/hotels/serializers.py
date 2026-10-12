from datetime import timezone as dt_timezone

from rest_framework import serializers

from .models import HotelSearch


class HotelSearchSerializer(serializers.ModelSerializer):
    """Audit-log rows for /api/hotels/history.

    Keys are camelCase to match the Amadeus-shaped search payload this API
    already returns, and to keep the response identical to the Hono stack's.
    """

    cityCode = serializers.CharField(source="city_code", read_only=True)
    checkInDate = serializers.DateField(source="check_in_date", read_only=True)
    checkOutDate = serializers.DateField(source="check_out_date", read_only=True)
    resultCount = serializers.IntegerField(source="result_count", read_only=True)
    createdAt = serializers.SerializerMethodField()

    class Meta:
        model = HotelSearch
        fields = [
            "id",
            "cityCode",
            "checkInDate",
            "checkOutDate",
            "adults",
            "resultCount",
            "createdAt",
        ]
        read_only_fields = fields

    def get_createdAt(self, obj) -> str:
        # Millisecond precision + trailing Z. DRF defaults to microseconds,
        # which would not match JSON.stringify(Date) on the Hono side.
        dt = obj.created_at.astimezone(dt_timezone.utc)
        return f"{dt:%Y-%m-%dT%H:%M:%S}.{dt.microsecond // 1000:03d}Z"
