
import json
from pathlib import Path


def search_providers(
    service: str,
    city: str,
    budget: float,
    preference: str = "",
):
    file_path = Path(__file__).parent / "providers.json"

    with open(file_path, "r", encoding="utf-8") as file:
        providers = json.load(file)

    service = service.strip().lower()
    city = city.strip().lower()
    preference = preference.strip().lower()

    matches = []

    for provider in providers:
        if service not in provider["service"].lower():
            continue

        if city != provider["city"].strip().lower():
            continue

        if provider["price"] > budget:
            continue

        specialties = [
            item.lower()
            for item in provider.get("specialties", [])
        ]

        if preference and not any(
            preference in specialty for specialty in specialties
        ):
            continue

        matches.append(provider)

    matches.sort(key=lambda provider: provider["price"])

    return matches
