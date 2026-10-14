from django.db import models
from django.contrib.auth.models import User

class HotelSearch(models.Model):
    """Audit log of hotel searches issued against Amadeus.

    Persisted so candidates have something concrete to extend (history page,
    analytics, caching, etc.).
    """

    city_code = models.CharField(max_length=8)
    check_in_date = models.DateField()
    check_out_date = models.DateField()
    adults = models.PositiveSmallIntegerField(default=1)
    result_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.city_code} {self.check_in_date}→{self.check_out_date} ({self.adults} adult)"


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="favorites")
    hotel_id = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'hotel_id')

    def __str__(self):
        return f"{self.user.username} -> {self.hotel_id}"