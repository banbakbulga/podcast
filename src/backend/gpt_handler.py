import openai
import os
import json
import requests
from flask import Flask, jsonify, request, send_from_directory

openai.api_key = "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"  # 여기에 실제 API 키를 입력하세요.

app = Flask(__name__)

# 이미지 저장 디렉토리
IMAGE_DIR = "img"  # 로컬 이미지 디렉토리
if not os.path.exists(IMAGE_DIR):
    os.makedirs(IMAGE_DIR)

# 데이터 파일 경로
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../public/data"))

def summarize_script_to_image_description(date):
    """주어진 날짜의 방송 내용을 요약하고 이미지를 생성할 설명을 반환하는 함수"""
    filename = f"{date}.json"
    file_path = os.path.join(DATA_DIR, filename)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"{filename} 파일이 존재하지 않습니다.")

    # JSON 파일 읽기
    with open(file_path, "r", encoding="utf-8") as file:
        data = json.load(file)

    # 방송 내용 요약
    content_to_summarize = " ".join([item['title'] + " " + item['summary'] for item in data])

    # GPT로 방송 내용을 요약하는 설명을 생성
    prompt = f"다음 내용을 기반으로 이미지를 그릴 수 있는 설명을 만들어 주세요: {content_to_summarize}"

    response = openai.Completion.create(
        model="gpt-4o",  # GPT-4o 모델 사용
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
        max_tokens=150
    )

    image_description = response['choices'][0]['message']['content'].strip()
    return image_description

def generate_image(description, date):
    """DALL·E로 이미지 생성 요청 후 로컬에 저장하는 함수"""
    try:
        response = openai.Image.create(
            prompt=description,
            n=1,  # 생성할 이미지 개수
            size="1024x1024"  # 이미지 크기
        )
        
        # 생성된 이미지 URL 가져오기
        image_url = response['data'][0]['url']
        
        # 이미지 다운로드 후 로컬 저장
        image_path = os.path.join(IMAGE_DIR, f"{date}.png")
        download_image(image_url, image_path)
        
        return f"/img/{date}.png"  # 로컬 서버에서 제공할 이미지 경로 반환
    except Exception as e:
        print(f"이미지 생성 실패: {e}")
        return None

def download_image(url, path):
    """이미지를 다운로드하고 로컬 디렉토리에 저장하는 함수"""
    img_data = requests.get(url).content
    with open(path, 'wb') as file:
        file.write(img_data)

@app.route("/api/generate-image", methods=["POST"])
def generate_image_from_json():
    """JSON 파일을 기반으로 이미지 생성 후 URL 반환"""
    date = request.json.get("date")
    if not date:
        return jsonify({"error": "날짜를 제공해 주세요."}), 400

    try:
        # 방송 내용 요약 및 이미지 설명 생성
        image_description = summarize_script_to_image_description(date)
        
        # 이미지 생성
        image_url = generate_image(image_description, date)
        
        if image_url:
            return jsonify({"image_url": image_url})  # 이미지 URL 반환
        else:
            return jsonify({"error": "이미지 생성 실패"}), 500

    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "처리 중 오류 발생", "message": str(e)}), 500

@app.route('/img/<filename>')
def serve_image(filename):
    """로컬 이미지 파일을 클라이언트에 제공하는 라우트"""
    return send_from_directory(IMAGE_DIR, filename)

if __name__ == "__main__":
    app.run(debug=True)
