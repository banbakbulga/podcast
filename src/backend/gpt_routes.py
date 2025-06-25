# gpt_routes.py
from flask import Blueprint, jsonify, request
from gpt_handler import summarize_script  # gpt_handler에서 요약 함수 임포트

gpt_bp = Blueprint('gpt', __name__)

@gpt_bp.route("/api/gpt-summary", methods=["GET"])
def gpt_summary():
    date = request.args.get("date")
    if not date:
        return jsonify({"error": "날짜를 제공해 주세요."}), 400

    try:
        summary = summarize_script(date)
        return jsonify({"summary": summary})
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "설명 생성 실패", "message": str(e)}), 500
