"""Thin Amadeus self-service API client.

Implements only what the hotel-search demo needs:
  1. OAuth2 token (client_credentials)
  2. List hotel IDs by city
  3. Fetch hotel offers for those IDs

Docs:
  https://developers.amadeus.com/self-service/category/hotels

NOTE: Amadeus is announcing the self-service portal shutdown for July 2026.
The default mode for this boilerplate is ``mock`` — see
``hotels/mock_amadeus.py``. Set ``AMADEUS_MODE=live`` in ``.env`` if you have
credentials for a working provider with an Amadeus-compatible response shape.
"""
from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Any, Protocol

import requests
from django.conf import settings

from .mock_amadeus import MockAmadeusClient


class HotelSearchClient(Protocol):
    def hotels_by_city(self, city_code: str, limit: int = 20) -> list[dict[str, Any]]: ...
    def hotel_offers(
        self,
        hotel_ids: list[str],
        check_in_date: str,
        check_out_date: str,
        adults: int = 1,
    ) -> list[dict[str, Any]]: ...


class AmadeusError(Exception):
    """Raised when the Amadeus API returns an error we cannot recover from."""


@dataclass
class _Token:
    value: str
    expires_at: float  # epoch seconds


class AmadeusClient:
    """Minimal Amadeus client. Caches the access token on the instance.

    Not thread-safe. Fine for the dev server — candidates can swap in a
    cache-backed implementation if they want.
    """

    def __init__(
        self,
        client_id: str | None = None,
        client_secret: str | None = None,
        base_url: str | None = None,
        timeout: float = 10.0,
    ) -> None:
        self.client_id = client_id or settings.AMADEUS_CLIENT_ID
        self.client_secret = client_secret or settings.AMADEUS_CLIENT_SECRET
        self.base_url = (base_url or settings.AMADEUS_BASE_URL).rstrip("/")
        self.timeout = timeout
        self._token: _Token | None = None

    def _is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)

    def _get_token(self) -> str:
        if not self._is_configured():
            raise AmadeusError(
                "Amadeus credentials are not configured. Set AMADEUS_CLIENT_ID "
                "and AMADEUS_CLIENT_SECRET in your .env file."
            )

        now = time.time()
        if self._token and self._token.expires_at - 60 > now:
            return self._token.value

        resp = requests.post(
            f"{self.base_url}/v1/security/oauth2/token",
            data={
                "grant_type": "client_credentials",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=self.timeout,
        )
        if not resp.ok:
            raise AmadeusError(f"Token request failed: {resp.status_code} {resp.text}")
        body = resp.json()
        self._token = _Token(
            value=body["access_token"],
            expires_at=now + int(body.get("expires_in", 1800)),
        )
        return self._token.value

    def _get(self, path: str, params: dict[str, Any]) -> dict[str, Any]:
        token = self._get_token()
        resp = requests.get(
            f"{self.base_url}{path}",
            params=params,
            headers={"Authorization": f"Bearer {token}"},
            timeout=self.timeout,
        )
        if not resp.ok:
            raise AmadeusError(f"GET {path} failed: {resp.status_code} {resp.text}")
        return resp.json()

    def hotels_by_city(self, city_code: str, limit: int = 20) -> list[dict[str, Any]]:
        """List hotels in a given IATA city code (e.g. 'PAR', 'NYC')."""
        data = self._get(
            "/v1/reference-data/locations/hotels/by-city",
            {"cityCode": city_code.upper()},
        )
        hotels = data.get("data", []) or []
        return hotels[:limit]

    def hotel_offers(
        self,
        hotel_ids: list[str],
        check_in_date: str,
        check_out_date: str,
        adults: int = 1,
    ) -> list[dict[str, Any]]:
        """Search availability+pricing for the given hotel IDs.

        Amadeus caps the number of hotelIds per request; we batch in groups of 20.
        """
        if not hotel_ids:
            return []
        results: list[dict[str, Any]] = []
        for i in range(0, len(hotel_ids), 20):
            batch = hotel_ids[i : i + 20]
            try:
                data = self._get(
                    "/v3/shopping/hotel-offers",
                    {
                        "hotelIds": ",".join(batch),
                        "checkInDate": check_in_date,
                        "checkOutDate": check_out_date,
                        "adults": adults,
                        "bestRateOnly": "true",
                    },
                )
            except AmadeusError:
                # Skip an unavailable batch rather than failing the whole search.
                continue
            results.extend(data.get("data", []) or [])
        return results


def get_client() -> HotelSearchClient:
    """Return the configured hotel-search client.

    ``AMADEUS_MODE=mock`` (default) → fixtures in ``mock_amadeus.py``.
    ``AMADEUS_MODE=live`` → real Amadeus client (requires credentials).
    """
    if settings.AMADEUS_MODE == "live":
        return AmadeusClient()
    return MockAmadeusClient()
