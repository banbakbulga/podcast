from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB 연결
client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
db = client.podcast
favorites_collection = db.favorites
clips_collection = db.clips  # 클립 컬렉션 추가
playlists_collection = db.playlists  # 플레이리스트 컬렉션 추가

def format_time_range(start, end):
    """시작과 끝 시간을 포맷팅"""
    start_min = int(start) // 60
    start_sec = int(start) % 60
    end_min = int(end) // 60
    end_sec = int(end) % 60
    return f"{start_min:02d}:{start_sec:02d} - {end_min:02d}:{end_sec:02d}"

def parse_clip_id(clip_id):
    """클립 ID에서 날짜와 시간 정보 추출"""
    try:
        # 19921104-351.96-442 형식 파싱
        date_str, start, end = clip_id.split('-')
        year = date_str[:4]
        month = date_str[4:6]
        day = date_str[6:8]
        
        formatted_date = f"{year}년 {month}월 {day}일"
        time_range = format_time_range(float(start), float(end))
        
        duration_sec = int(float(end) - float(start))
        duration_min = duration_sec // 60
        duration_sec = duration_sec % 60
        duration = f"{duration_min:02d}:{duration_sec:02d}"
        
        return {
            'title': f"{formatted_date} 클립",
            'displayDate': formatted_date,
            'timeRange': time_range,
            'duration': duration
        }
    except Exception as e:
        print(f"Error parsing clip_id {clip_id}: {str(e)}")
        return {
            'title': clip_id,
            'displayDate': '',
            'timeRange': '',
            'duration': '00:00'
        }

@app.route('/api/users/<user_id>/favorites', methods=['GET'])
def get_favorites(user_id):
    try:
        favorites = list(favorites_collection.find({'user_id': user_id}))
        for fav in favorites:
            fav['_id'] = str(fav['_id'])
            clip_info = parse_clip_id(fav['clip_id'])
            # title 우선순위: 즐겨찾기 title > clips title > fallback
            title = fav.get('title')
            if not title:
                clip = clips_collection.find_one({'id': fav['clip_id']})
                if clip:
                    title = clip.get('title', clip_info['title'])
                else:
                    title = clip_info['title']
            fav.update({
                'title': title,
                'description': f"{clip_info['timeRange']}",
                'thumbnail': '',
                'duration': clip_info['duration'],
                'date': clip_info['displayDate'],
                'displayDate': clip_info['displayDate'],
            })
            clip = clips_collection.find_one({'id': fav['clip_id']})
            if clip:
                clip['_id'] = str(clip['_id'])
                fav.update({
                    'description': clip.get('description', clip_info['timeRange']),
                    'thumbnail': clip.get('thumbnail', ''),
                    'duration': clip.get('duration', clip_info['duration']),
                    'date': clip.get('date', clip_info['displayDate']),
                    'displayDate': clip.get('displayDate', clip_info['displayDate']),
                })
        print("Returning favorites:", favorites)
        return jsonify(favorites)
    except Exception as e:
        print("Error in get_favorites:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>/favorites', methods=['POST'])
def add_favorite(user_id):
    try:
        clip_data = request.json
        existing = favorites_collection.find_one({
            'user_id': user_id,
            'clip_id': clip_data['clipId']
        })
        if existing:
            return jsonify({'message': 'Already in favorites'}), 400
        favorite = {
            'user_id': user_id,
            'clip_id': clip_data['clipId'],
            'title': clip_data.get('title', ''),
            'added_at': datetime.utcnow()
        }
        result = favorites_collection.insert_one(favorite)
        return jsonify({'id': str(result.inserted_id)}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<user_id>/favorites/<clip_id>', methods=['DELETE'])
def remove_favorite(user_id, clip_id):
    try:
        result = favorites_collection.delete_one({
            'user_id': user_id,
            'clip_id': clip_id
        })
        if result.deleted_count:
            return '', 204
        return jsonify({'error': 'Favorite not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 플레이리스트 목록 조회
@app.route('/api/users/<user_id>/playlists', methods=['GET'])
def get_playlists(user_id):
    try:
        playlists = list(playlists_collection.find({'user_id': user_id}))
        for pl in playlists:
            pl['_id'] = str(pl['_id'])
            for clip in pl.get('clips', []):
                clip['id'] = str(clip['id'])
        return jsonify(playlists)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 플레이리스트 생성
@app.route('/api/users/<user_id>/playlists', methods=['POST'])
def create_playlist(user_id):
    try:
        data = request.json
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Playlist name required'}), 400
        playlist = {
            'user_id': user_id,
            'name': name,
            'clips': [],
            'created_at': datetime.utcnow()
        }
        result = playlists_collection.insert_one(playlist)
        playlist['_id'] = str(result.inserted_id)
        return jsonify(playlist), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 플레이리스트에 클립 추가/삭제
@app.route('/api/users/<user_id>/playlists/<playlist_id>', methods=['PUT'])
def update_playlist(user_id, playlist_id):
    try:
        data = request.json
        action = data.get('action')  # 'add' or 'remove' or 'rename'
        clip = data.get('clip')
        if not action or not clip:
            return jsonify({'error': 'action and clip required'}), 400
        playlist = playlists_collection.find_one({'_id': ObjectId(playlist_id), 'user_id': user_id})
        if not playlist:
            return jsonify({'error': 'Playlist not found'}), 404
        if action == 'add':
            # 중복 방지
            if any(c['id'] == clip['id'] for c in playlist['clips']):
                return jsonify({'message': 'Already in playlist'}), 400
            playlist['clips'].append(clip)
        elif action == 'remove':
            playlist['clips'] = [c for c in playlist['clips'] if c['id'] != clip['id']]
        elif action == 'rename':
            new_name = data.get('name')
            if not new_name:
                return jsonify({'error': 'name required'}), 400
            playlists_collection.update_one({'_id': ObjectId(playlist_id)}, {'$set': {'name': new_name}})
            return jsonify({'success': True})
        else:
            return jsonify({'error': 'Invalid action'}), 400
        playlists_collection.update_one({'_id': ObjectId(playlist_id)}, {'$set': {'clips': playlist['clips']}})
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 플레이리스트 삭제
@app.route('/api/users/<user_id>/playlists/<playlist_id>', methods=['DELETE'])
def delete_playlist(user_id, playlist_id):
    try:
        result = playlists_collection.delete_one({'_id': ObjectId(playlist_id), 'user_id': user_id})
        if result.deleted_count:
            return '', 204
        return jsonify({'error': 'Playlist not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5002) 