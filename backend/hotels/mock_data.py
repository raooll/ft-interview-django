"""Mock hotel inventory used by MockAmadeusClient.

Hotels are grouped by IATA city code and ordered roughly by price. Each entry
carries the fields needed to synthesise an Amadeus-shaped offer response.

Adding a new city: append a new entry to MOCK_HOTELS_BY_CITY. Candidates can
extend this freely.
"""
from __future__ import annotations

MOCK_HOTELS_BY_CITY: dict[str, list[dict]] = {
    "PAR": [
        {"hotelId": "MCPAR001", "name": "Hôtel de Crillon", "chainCode": "RC", "latitude": 48.8676, "longitude": 2.3214, "basePrice": 1850, "currency": "EUR", "category": "DELUXE_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCPAR002", "name": "Le Bristol Paris", "chainCode": "BRC", "latitude": 48.8717, "longitude": 2.3160, "basePrice": 1450, "currency": "EUR", "category": "STANDARD_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCPAR003", "name": "Hôtel Plaza Athénée", "chainCode": "DC", "latitude": 48.8662, "longitude": 2.3041, "basePrice": 1620, "currency": "EUR", "category": "SUPERIOR_ROOM", "beds": 1, "bedType": "QUEEN"},
        {"hotelId": "MCPAR004", "name": "Le Meurice", "chainCode": "DC", "latitude": 48.8651, "longitude": 2.3284, "basePrice": 1340, "currency": "EUR", "category": "DELUXE_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCPAR005", "name": "citizenM Paris Champs-Élysées", "chainCode": "CZ", "latitude": 48.8693, "longitude": 2.3076, "basePrice": 225, "currency": "EUR", "category": "STANDARD_ROOM", "beds": 1, "bedType": "QUEEN"},
        {"hotelId": "MCPAR006", "name": "Mama Shelter Paris East", "chainCode": "MS", "latitude": 48.8689, "longitude": 2.4000, "basePrice": 165, "currency": "EUR", "category": "STANDARD_ROOM", "beds": 1, "bedType": "DOUBLE"},
        {"hotelId": "MCPAR007", "name": "ibis Paris Tour Eiffel", "chainCode": "RT", "latitude": 48.8556, "longitude": 2.2913, "basePrice": 145, "currency": "EUR", "category": "STANDARD_ROOM", "beds": 1, "bedType": "DOUBLE"},
        {"hotelId": "MCPAR008", "name": "Generator Paris", "chainCode": "GN", "latitude": 48.8821, "longitude": 2.3653, "basePrice": 95, "currency": "EUR", "category": "STANDARD_ROOM", "beds": 2, "bedType": "TWIN"},
    ],
    "LON": [
        {"hotelId": "MCLON001", "name": "The Savoy", "chainCode": "FH", "latitude": 51.5101, "longitude": -0.1198, "basePrice": 980, "currency": "GBP", "category": "DELUXE_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCLON002", "name": "Claridge's", "chainCode": "MO", "latitude": 51.5128, "longitude": -0.1480, "basePrice": 1150, "currency": "GBP", "category": "SUPERIOR_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCLON003", "name": "The Langham London", "chainCode": "LH", "latitude": 51.5176, "longitude": -0.1438, "basePrice": 720, "currency": "GBP", "category": "DELUXE_ROOM", "beds": 1, "bedType": "QUEEN"},
        {"hotelId": "MCLON004", "name": "The Z Hotel Soho", "chainCode": "ZH", "latitude": 51.5117, "longitude": -0.1308, "basePrice": 195, "currency": "GBP", "category": "STANDARD_ROOM", "beds": 1, "bedType": "DOUBLE"},
        {"hotelId": "MCLON005", "name": "citizenM Tower of London", "chainCode": "CZ", "latitude": 51.5108, "longitude": -0.0792, "basePrice": 245, "currency": "GBP", "category": "STANDARD_ROOM", "beds": 1, "bedType": "QUEEN"},
        {"hotelId": "MCLON006", "name": "Premier Inn London County Hall", "chainCode": "PI", "latitude": 51.5012, "longitude": -0.1190, "basePrice": 165, "currency": "GBP", "category": "STANDARD_ROOM", "beds": 1, "bedType": "DOUBLE"},
        {"hotelId": "MCLON007", "name": "Generator London", "chainCode": "GN", "latitude": 51.5234, "longitude": -0.1216, "basePrice": 85, "currency": "GBP", "category": "STANDARD_ROOM", "beds": 4, "bedType": "BUNK"},
    ],
    "NYC": [
        {"hotelId": "MCNYC001", "name": "The Plaza", "chainCode": "FH", "latitude": 40.7644, "longitude": -73.9744, "basePrice": 1295, "currency": "USD", "category": "DELUXE_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCNYC002", "name": "The St. Regis New York", "chainCode": "XR", "latitude": 40.7610, "longitude": -73.9743, "basePrice": 1480, "currency": "USD", "category": "SUPERIOR_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCNYC003", "name": "The Standard High Line", "chainCode": "ST", "latitude": 40.7411, "longitude": -74.0080, "basePrice": 545, "currency": "USD", "category": "STANDARD_ROOM", "beds": 1, "bedType": "QUEEN"},
        {"hotelId": "MCNYC004", "name": "citizenM New York Times Square", "chainCode": "CZ", "latitude": 40.7575, "longitude": -73.9886, "basePrice": 295, "currency": "USD", "category": "STANDARD_ROOM", "beds": 1, "bedType": "QUEEN"},
        {"hotelId": "MCNYC005", "name": "Pod 51 Hotel", "chainCode": "PD", "latitude": 40.7553, "longitude": -73.9694, "basePrice": 175, "currency": "USD", "category": "STANDARD_ROOM", "beds": 1, "bedType": "DOUBLE"},
        {"hotelId": "MCNYC006", "name": "Yotel New York", "chainCode": "YT", "latitude": 40.7621, "longitude": -73.9942, "basePrice": 219, "currency": "USD", "category": "STANDARD_ROOM", "beds": 1, "bedType": "QUEEN"},
        {"hotelId": "MCNYC007", "name": "The Jane Hotel", "chainCode": "JN", "latitude": 40.7378, "longitude": -74.0094, "basePrice": 145, "currency": "USD", "category": "STANDARD_ROOM", "beds": 1, "bedType": "DOUBLE"},
    ],
    "MAD": [
        {"hotelId": "MCMAD001", "name": "Mandarin Oriental Ritz Madrid", "chainCode": "MO", "latitude": 40.4146, "longitude": -3.6929, "basePrice": 1180, "currency": "EUR", "category": "DELUXE_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCMAD002", "name": "Four Seasons Hotel Madrid", "chainCode": "FS", "latitude": 40.4181, "longitude": -3.6991, "basePrice": 985, "currency": "EUR", "category": "SUPERIOR_ROOM", "beds": 1, "bedType": "KING"},
        {"hotelId": "MCMAD003", "name": "Hotel Wellington", "chainCode": "WL", "latitude": 40.4232, "longitude": -3.6864, "basePrice": 320, "currency": "EUR", "category": "STANDARD_ROOM", "beds": 1, "bedType": "QUEEN"},
        {"hotelId": "MCMAD004", "name": "Room Mate Alicia", "chainCode": "RM", "latitude": 40.4148, "longitude": -3.7022, "basePrice": 175, "currency": "EUR", "category": "STANDARD_ROOM", "beds": 1, "bedType": "DOUBLE"},
        {"hotelId": "MCMAD005", "name": "Generator Madrid", "chainCode": "GN", "latitude": 40.4214, "longitude": -3.7044, "basePrice": 85, "currency": "EUR", "category": "STANDARD_ROOM", "beds": 2, "bedType": "TWIN"},
        {"hotelId": "MCMAD006", "name": "Hotel Único Madrid", "chainCode": "UN", "latitude": 40.4271, "longitude": -3.6868, "basePrice": 410, "currency": "EUR", "category": "DELUXE_ROOM", "beds": 1, "bedType": "KING"},
    ],
}
