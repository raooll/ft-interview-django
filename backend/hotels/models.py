from django.db import models


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
