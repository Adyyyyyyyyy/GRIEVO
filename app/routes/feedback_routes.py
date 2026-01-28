from flask import Blueprint, request, jsonify
from app.services.db_service import get_db_connection

feedback_bp = Blueprint("feedback_bp", __name__)

@feedback_bp.route("/feedback/submit", methods=["POST"])
def submit_feedback():
    data = request.json

    grievance_id = data.get("grievance_id")
    rating = data.get("rating")
    comments = data.get("comments", "")

    if not grievance_id or not rating:
        return jsonify({
            "status": "failed ❌",
            "message": "grievance_id and rating are required"
        }), 400

    if int(rating) < 1 or int(rating) > 5:
        return jsonify({
            "status": "failed ❌",
            "message": "rating must be between 1 and 5"
        }), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Optional rule: only allow feedback if grievance is resolved/closed
        cursor.execute("SELECT status FROM grievances WHERE grievance_id=%s", (grievance_id,))
        result = cursor.fetchone()

        if not result:
            conn.close()
            return jsonify({
                "status": "failed ❌",
                "message": "Grievance not found"
            }), 404

        status = result[0]
        if status not in ["Resolved", "Closed"]:
            conn.close()
            return jsonify({
                "status": "failed ❌",
                "message": "Feedback allowed only after grievance is Resolved/Closed"
            }), 400

        cursor.execute(
            "INSERT INTO feedback (grievance_id, rating, comments) VALUES (%s, %s, %s)",
            (grievance_id, rating, comments)
        )

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "message": "Feedback submitted successfully!"
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500
