# src/backend/get_spotify_token.py
import os
import time
import requests

CLIENT_ID = "076d3776c36e4bc8b4988d2a806cce8c"
CLIENT_SECRET = "5e79d36addc1414f91d56b02af8961d3"

_cached_token = None
_token_expiry = 0

def get_access_token():
    global _cached_token, _token_expiry

    if _cached_token and time.time() < _token_expiry:
        return _cached_token

    url = "https://accounts.spotify.com/api/token"
    data = {"grant_type": "client_credentials"}
    auth = (CLIENT_ID, CLIENT_SECRET)

    response = requests.post(url, data=data, auth=auth)
    if response.status_code != 200:
        raise Exception("❌ Spotify 토큰 요청 실패")

    res_json = response.json()
    _cached_token = res_json["access_token"]
    _token_expiry = time.time() + res_json["expires_in"] - 60  # 60초 여유

    return _cached_token
