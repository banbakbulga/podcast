# src/backend/search_spotify.py
import requests
import os

ACCESS_TOKEN = "BQDa22brdHNHhlG4PdDeSa2yTSqTQ2XnY47p-2n0hG2J4lDpWnarLCCXEqeK3rHXWUCUEiIhjKs83E2VpbIxPjTI-euAju8UnidaVxJiZTeGpANzA30XOfc-owZwimPKK96sBfFCQ_Q"

def search_track(title, artist):
    query = f"track:{title} artist:{artist}"
    url = "https://api.spotify.com/v1/search"
    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}"
    }
    params = {
        "q": query,
        "type": "track",
        "limit": 1
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code == 200:
        items = response.json().get("tracks", {}).get("items", [])
        if items:
            track = items[0]
            return {
                "title": track["name"],
                "artist": track["artists"][0]["name"],
                "url": track["external_urls"]["spotify"],
                "preview_url": track["preview_url"],
                "album_image": track["album"]["images"][0]["url"]
            }
    return None
