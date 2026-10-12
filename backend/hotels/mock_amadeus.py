"""In-process mock of AmadeusClient.

Returns Amadeus-shaped offer payloads so the frontend and any downstream code
can be developed without any third-party credentials.

The structure matches the `/v3/shopping/hotel-offers` response (a subset of
fields, but consistent and realistic). Swap in a real provider by changing
``AMADEUS_MODE=live`` in your ``.env``.
"""
from __future__ import annotations

import hashlib
from datetime import date
from typing import Any

from .mock_data import MOCK_HOTELS_BY_CITY


def _nights(check_in: str, check_out: str) -> int:
    delta = date.fromisoformat(check_out) - date.fromisoformat(check_in)
    return max(1, delta.days)


def _stable_offset(seed: str) -> float:
    """Deterministic ±15% jitter from a seed string (no random module)."""
    digest = hashlib.sha256(seed.encode()).digest()
    # Map first byte into [-0.15, 0.15].
    return (digest[0] / 255.0 - 0.5) * 0.30


def _format_price(amount: float) -> str:
    return f"{amount:.2f}"


class MockAmadeusClient:
    """Drop-in replacement for AmadeusClient — same public surface."""

    def __init__(self, *_, **__) -> None:
        # Same constructor signature as AmadeusClient so the swap is silent.
        pass

    def hotels_by_city(self, city_code: str, limit: int = 20) -> list[dict[str, Any]]:
        rows = MOCK_HOTELS_BY_CITY.get(city_code.upper(), [])
        return [
            {
                "hotelId": h["hotelId"],
                "name": h["name"],
                "chainCode": h["chainCode"],
                "iataCode": city_code.upper(),
                "geoCode": {"latitude": h["latitude"], "longitude": h["longitude"]},
            }
            for h in rows[:limit]
        ]

    def hotel_offers(
        self,
        hotel_ids: list[str],
        check_in_date: str,
        check_out_date: str,
        adults: int = 1,
    ) -> list[dict[str, Any]]:
        nights = _nights(check_in_date, check_out_date)
        wanted = set(hotel_ids)

        results: list[dict[str, Any]] = []
        for city_code, hotels in MOCK_HOTELS_BY_CITY.items():
            for h in hotels:
                if h["hotelId"] not in wanted:
                    continue

                seed = f"{h['hotelId']}:{check_in_date}:{adults}"
                base = float(h["basePrice"])
                jitter = base * _stable_offset(seed)
                adult_factor = 1.0 + 0.08 * (max(1, adults) - 1)
                nightly = (base + jitter) * adult_factor
                base_total = nightly * nights
                taxes = round(base_total * 0.115, 2)  # ~11.5% taxes/fees
                total = round(base_total + taxes, 2)

                results.append(
                    {
                        "type": "hotel-offers",
                        "hotel": {
                            "type": "hotel",
                            "hotelId": h["hotelId"],
                            "chainCode": h["chainCode"],
                            "name": h["name"],
                            "cityCode": city_code,
                            "latitude": h["latitude"],
                            "longitude": h["longitude"],
                        },
                        "available": True,
                        "offers": [
                            {
                                "id": f"mock-offer-{h['hotelId']}",
                                "checkInDate": check_in_date,
                                "checkOutDate": check_out_date,
                                "roomQuantity": 1,
                                "room": {
                                    "type": h["category"],
                                    "typeEstimated": {
                                        "category": h["category"],
                                        "beds": h["beds"],
                                        "bedType": h["bedType"],
                                    },
                                    "description": {
                                        "text": f"{h['category'].replace('_', ' ').title()} with {h['beds']} {h['bedType'].lower()} bed{'s' if h['beds'] > 1 else ''}.",
                                        "lang": "EN",
                                    },
                                },
                                "guests": {"adults": adults},
                                "price": {
                                    "currency": h["currency"],
                                    "base": _format_price(base_total),
                                    "total": _format_price(total),
                                    "taxes": [
                                        {
                                            "code": "TOTAL_TAX",
                                            "amount": _format_price(taxes),
                                            "currency": h["currency"],
                                            "included": False,
                                        }
                                    ],
                                    "variations": {
                                        "average": {
                                            "base": _format_price(nightly),
                                        }
                                    },
                                },
                                "policies": {
                                    "cancellation": {
                                        "type": "FULL_STAY",
                                        "deadline": f"{check_in_date}T18:00:00",
                                    }
                                },
                            }
                        ],
                    }
                )
        return results
