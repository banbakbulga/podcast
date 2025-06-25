# ✅ src/backend/app.py
from flask import Flask, request, jsonify, session, redirect
import requests
from flask_cors import CORS
import time
import os

app = Flask(__name__)
app.secret_key = 'jun9126'  # 여기에 고유하고 비밀스러운 문자열을 입력하세요.
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "http://localhost:5001", "http://localhost:*"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "supports_credentials": True,
        "max_age": 3600
    }
})

# ✅ 환경변수 또는 안전한 저장소에서 가져오는 구조가 이상적
CLIENT_ID = "076d3776c36e4bc8b4988d2a806cce8c"
CLIENT_SECRET = "5e79d36addc1414f91d56b02af8961d3"

# ✅ 토큰 캐싱
spotify_token = None
token_expiry = 0  # UNIX timestamp

def get_access_token():
    global spotify_token, token_expiry
    if spotify_token and time.time() < token_expiry:
        return spotify_token

    print("🔁 새로 Spotify 토큰 요청 중...")
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "client_credentials"
    }
    auth = (CLIENT_ID, CLIENT_SECRET)

    response = requests.post(url, headers=headers, data=data, auth=auth)
    if response.status_code == 200:
        result = response.json()
        spotify_token = result["access_token"]
        token_expiry = time.time() + result["expires_in"] - 60  # 60초 여유
        print("✅ Spotify 토큰 발급 완료")
        return spotify_token
    else:
        print("❌ Spotify 토큰 발급 실패", response.text)
        return None

@app.route("/search", methods=["GET"])
def search_track():
    title = request.args.get("title")
    artist = request.args.get("artist")
    if not title or not artist:
        return jsonify({"error": "Missing title or artist"}), 400

    access_token = get_access_token()
    if not access_token:
        return jsonify({"error": "Failed to get Spotify token"}), 500

    query = f"track:{title} artist:{artist}"
    url = "https://api.spotify.com/v1/search"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    params = {
        "q": query,
        "type": "track",
        "limit": 1
    }

    response = requests.get(url, headers=headers, params=params)
    if response.status_code != 200:
        return jsonify({"error": "Spotify API 오류"}), 500

    tracks = response.json().get("tracks", {}).get("items", [])
    if not tracks:
        return jsonify({"error": "트랙을 찾을 수 없음"}), 404

    track = tracks[0]
    return jsonify({
        "title": track["name"],
        "artist": track["artists"][0]["name"],
        "album": track["album"]["name"],
        "image": track["album"]["images"][0]["url"],
        "preview_url": track["preview_url"],
        "spotify_url": track["external_urls"]["spotify"]
    })

@app.route("/auth/callback", methods=["GET", "POST"])
def spotify_callback():
    print("콜백 엔드포인트 호출됨")
    if request.method == "POST":
        code = request.json.get('code')
        print("POST 요청으로 받은 코드:", code)
    else:
        code = request.args.get('code')
        print("GET 요청으로 받은 코드:", code)

    if not code:
        print("인증 코드가 없음")
        return jsonify({"error": "Authorization code missing"}), 400

    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": "http://localhost:5001/auth/callback",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }

    try:
        print("Spotify 토큰 요청 시도")
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()
        token_info = response.json()
        print("토큰 발급 성공")
        
        # 토큰 정보를 세션에 저장
        session['access_token'] = token_info['access_token']
        session['refresh_token'] = token_info.get('refresh_token')
        session['token_type'] = token_info.get('token_type', 'Bearer')
        session['expires_in'] = token_info.get('expires_in')
        
        # 사용자 정보 가져오기
        user_response = requests.get(
            'https://api.spotify.com/v1/me',
            headers={'Authorization': f"Bearer {token_info['access_token']}"}
        )
        user_response.raise_for_status()
        user_info = user_response.json()
        print("사용자 정보 가져오기 성공:", user_info.get('display_name'))
        
        # 사용자 정보도 세션에 저장 (이미지가 없는 경우 안전하게 처리)
        images = user_info.get('images', [])
        profile_image = images[0].get('url') if images else None
        
        session['user'] = {
            'id': user_info['id'],
            'email': user_info.get('email'),
            'name': user_info.get('display_name'),
            'image': profile_image
        }
        
        if request.method == "POST":
            return jsonify({"success": True, "message": "Authentication successful"})
        else:
            return redirect("http://localhost:3000")
            
    except requests.exceptions.RequestException as e:
        print(f"인증 과정 중 에러 발생: {str(e)}")
        return jsonify({"error": "Failed to authenticate with Spotify"}), 500

@app.route("/auth/me")
def get_current_user():
    if 'access_token' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    headers = {
        "Authorization": f"Bearer {session['access_token']}"
    }
    response = requests.get("https://api.spotify.com/v1/me", headers=headers)
    
    if response.status_code != 200:
        session.clear()
        return jsonify({"error": "Failed to get user info"}), 401
    
    return jsonify(response.json())

@app.route("/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"message": "Successfully logged out"})

@app.route("/spotify/me")
def get_spotify_profile():
    if 'access_token' not in session:
        return jsonify({"error": "Not authenticated"}), 401
    
    try:
        response = requests.get(
            'https://api.spotify.com/v1/me',
            headers={'Authorization': f"Bearer {session['access_token']}"}
        )
        
        if response.status_code != 200:
            session.clear()
            return jsonify({"error": "Failed to get Spotify profile"}), response.status_code
            
        user_data = response.json()
        return jsonify({
            'display_name': user_data.get('display_name'),
            'email': user_data.get('email'),
            'images': user_data.get('images', []),
            'followers': user_data.get('followers', {}).get('total', 0),
            'product': user_data.get('product')
        })
        
    except Exception as e:
        print(f"Spotify 프로필 정보 조회 실패: {str(e)}")
        return jsonify({"error": "Failed to get Spotify profile"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
