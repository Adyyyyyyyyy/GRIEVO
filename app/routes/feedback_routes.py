from flask import Blueprint, request, jsonify
from app.services.db_service import get_db_connection

feedback_bp = Blueprint("feedback_bp", __name__)


@feedback_bp.route("/feedback/submit", methods=["POST"])
def submit_feedback():
    data = request.json

    grievance_id = data.get("grievance_id")
    is_resolved = data.get("is_resolved")  # True or False
    comments = data.get("comments", "")

    if grievance_id is None or is_resolved is None:
        return jsonify({
            "status": "failed ❌",
            "message": "grievance_id and is_resolved are required"
        }), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT status FROM grievances WHERE grievance_id=%s", (grievance_id,))
        result = cursor.fetchone()

        if not result:
            conn.close()
            return jsonify({"status": "failed ❌", "message": "Grievance not found"}), 404

        if result[0] != "Resolved":
            conn.close()
            return jsonify({
                "status": "failed ❌",
                "message": "Feedback only allowed for Resolved grievances"
            }), 400

        if is_resolved:
            # Student satisfied → Close it
            new_status = "Closed"
            rating = 5
        else:
            # Student not satisfied → reopen
            new_status = "In Progress"
            rating = 1

        # Save feedback
        cursor.execute(
            "INSERT INTO feedback (grievance_id, rating, comments) VALUES (%s, %s, %s)",
            (grievance_id, rating, comments)
        )

        # Update grievance status
        cursor.execute(
            "UPDATE grievances SET status=%s WHERE grievance_id=%s",
            (new_status, grievance_id)
        )

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "message": "Feedback submitted!",
            "new_status": new_status
        })

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500


@feedback_bp.route("/feedback/grievance/<int:grievance_id>", methods=["GET"])
def get_feedback(grievance_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT * FROM feedback WHERE grievance_id=%s ORDER BY submitted_at DESC LIMIT 1",
            (grievance_id,)
        )
        result = cursor.fetchone()
        conn.close()

        return jsonify({"status": "success ✅", "feedback": result})

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500