import openai
import os
import json
import time

client = openai.OpenAI(api_key="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")  # ← 실제 키로 교체

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

PUBLIC_DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../public/data"))

script_path = os.path.join(PUBLIC_DATA_DIR, "19930201_cleaned.json")
output_path = os.path.join(PUBLIC_DATA_DIR, "19930201.json")
log_path = os.path.join(PUBLIC_DATA_DIR, "19921104_gpt_raw.txt")

# 프롬프트
BASE_PROMPT = """
당신은 라디오 방송 스크립트를 분석하여 주제별로 조각화하는 역할을 맡았습니다. 아래는 1992년 FM 영화음악 방송의 전체 스크립트를 JSON으로 변환한 것입니다.

🎯 **조각을 나누는 기준은 다음과 같습니다:**
- 하나의 조각은 하나의 의미 흐름 또는 코너 단위가 되어야 하며, 주제에 따라 정확하게 나누어야 합니다. 하지만 최대한 누락되는 부분 없이 최대한 많은 조각을 생성해야 합니다.
- 음악, 영화, 사연, 광고, 오프닝, 엔딩에 대한 중요한 정보는 반드시 누락 없이 모두 포함해야 합니다.
- 음악과 영화 관련 내용은 반드시 음악 제목, 아티스트, 장면 설명, 영화 제목 등 중요한 정보를 포함해야 하며, **누락되거나 잘못된 부분이 없도록 수정**하십시오.
- 영화와 음악 제목은 영어인 경우 너가 직접 영어 제목을 찾아서 **영어로 변경**하고 잘못 인식된 내용은 **수정**하세요. 영어 제목은 영어로 변경해서 표기해
- 예를 들어, 영화 영어 제목은 영어로 변경하고, 영어 음악 제목은 영어로 변경합니다.
- 해당 영화나 음악의 제목이 영어인지 한글인지는 너가 알아서 판단해야 합니다.
- 타이틀, 서머리, 디스크립션은 한글로 출력되도록 합니다.
- **잡음**(예: "아아아", "음...")은 제외하고 조각화합니다.
- 각 조각은 **시작 시간**과 **종료 시간**을 포함하고, **음악 제목**, **아티스트**, **사연** 등 관련된 세부 정보를 포함합니다.
- 음악, 영화 소개 외에도 다른 얘기도 포함해서 따로 조각화 해야합니다. 예를 들어 영화에 얽힌 이야기나 전체 주제에 대한 내용.
- 조각은 반드시시 20개 정도로 나오도록

📌 **조각마다 포함해야 할 항목:**
- `start` (float, 초 단위): 조각 시작 시간
- `end` (float, 초 단위): 조각 종료 시간
- `title` (string): 조각 대표 제목
- `summary` (string): 한두 문장의 요약 (필수)
- `tags` (list): 관련 키워드 (예: ["영화", "OST", "사연"]) (필수)
- `music` (list): 포함된 음악 리스트 (없으면 `[]`)
    - `title`: 음악 제목
    - `artist`: 아티스트
    - `description`: 음악 설명 (없으면 "없음")
- `story` (string): 청취자 사연 요약 (없으면 '없음')
- `ad` (string): 광고 정보 요약 (없으면 '없음')
- `tag` (string): 해당 내용에 대한 간단한 태그, 예: `#영화`, `#음악`, `#광고`, `#사연`, `#소개` 등

🎵 **음악 조각의 경우:**
- **영화 음악 소개 멘트**는 음악 바로 전 도입 멘트까지 포함해야 합니다.
- 영화 제목, 아티스트명, 장면 설명 등을 반드시 포함하며, 모든 **음악 정보는 정확하게 반영**됩니다.
- 음악이 먼저 시작되는 경우 해당 음악의 시작 시간을 `start`에 넣고, 'end'는 음악 소개가 끝나는 시점으로 설정합니다.
- 음악이 나중에 시작되는 경우 해당 음악의 소개 시작 시간을 'start'에 넣고, 'end'는 음악이 끝나는 시점으로 설정합니다.

🎬 **영화 조각의 경우:**
- 영화 제목, 주요 장면, 등장인물, 영화의 중요한 정보(예: 감독, 연도 등)를 포함하여 설명을 충분히 작성합니다.
- **영화 소개는 필수**이며, 영화에 대한 설명이 누락되지 않도록 주의하십시오.

📤 **출력 예시:**

```json
[
  {
    "title": "청취자 사연 - 광주에서",
    "start": 280.0,
    "end": 320.2,
    "summary": "광주 동구의 박성우 청취자가 FM 시사회 재개에 대한 기쁨을 전함.",
    "tags": ["사연", "청취자"],
    "music": [],
    "story": "광주 동구 박성우님의 사연. FM 시사회가 다시 시작되어 기쁘다는 내용.",
    "ad": "없음"
  },
  {
    "title": "영화 'Back to the Future' 음악 소개",
    "start": 550.0,
    "end": 570.0,
    "summary": "영화 'Back to the Future'의 삽입곡 'The Power of Love' 소개. 영화의 중요한 장면에서 이 음악이 사용됨.",
    "tags": ["영화", "OST"],
    "music": [
      {
        "title": "The Power of Love",
        "artist": "Huey Lewis and the News",
        "description": "영화 'Back to the Future'의 삽입곡으로, 영화의 주요 장면에서 사용되며 분위기를 고조시킴."
      }
    ],
    "story": "없음",
    "ad": "없음"
  }
]

"""

with open(script_path, "r", encoding="utf-8") as f:
    full_script = f.read()

prompt = BASE_PROMPT + "\n\n" + full_script

print("⏳ GPT-4o 요청 중...")
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    temperature=0.3
)

content = response.choices[0].message.content

with open(log_path, "w", encoding="utf-8") as f:
    f.write(content)

try:
    json_start = content.find("[")
    json_end = content.rfind("]") + 1
    content_clean = content[json_start:json_end]
    parsed = json.loads(content_clean)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(parsed, f, ensure_ascii=False, indent=2)

    print(f"✅ 저장 완료: {output_path}")

except Exception as e:
    print(f"❌ JSON 파싱 실패: {e}")
    print("🔎 응답 내용 확인 필요 (log 파일 참고)")
