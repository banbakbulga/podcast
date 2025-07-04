# 🎙️ FM Radio Script Curation Platform

> Whisper로 변환된 라디오 방송 스크립트를 GPT를 활용해 주제별로 자동 큐레이션하는 프로젝트입니다.

---

## 📁 프로젝트 개요

이 프로젝트는 1992년 FM 영화음악 등 라디오 음원 데이터를 기반으로 다음 과정을 자동화합니다:

1. 🎧 **Whisper로 음성 → 텍스트(JSON) 변환**
2. 🤖 **GPT-4o-mini로 의미 단위(조각) 자동 분할**
3. 🖥️ **React 프론트엔드에서 시각적으로 조각 콘텐츠 제공**

---

## 🚀 사용 기술

| 영역         | 기술                                   |
|--------------|----------------------------------------|
| 음성 인식     | [OpenAI Whisper](https://github.com/openai/whisper) |
| LLM 처리     | OpenAI `gpt-4o-mini` API               |
| 프론트엔드   | React                                   |
| 백엔드 API   | FastAPI (Python)                        |
| 데이터 저장   | JSON 기반 정적 파일 (`public/data/`)      |

---

## 📂 디렉토리 구조

```bash
public/
  ├── audio/                  # mp3 음원 파일
  ├── data/                   # Whisper 결과 및 GPT 조각화 결과
  │    ├── 1992XXXX_cleaned.json     # Whisper 출력
  │    ├── 1992XXXX.json             # GPT 조각화 결과
src/
  ├── backend/                # FastAPI 백엔드 코드
  ├── components/             # React 컴포넌트
