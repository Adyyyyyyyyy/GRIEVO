from flask import Blueprint, request, jsonify
from app.services.db_service import get_db_connection
from app.services.resolution_time_service import get_resolution_indicator


grievance_bp = Blueprint("grievance_bp", __name__)

@grievance_bp.route("/grievance/submit", methods=["POST"])
def submit_grievance():
    data = request.json

    student_id = data.get("student_id")
    category_id = data.get("category_id")
    description = data.get("description")

    if not student_id or not category_id or not description:
        return jsonify({
            "status": "failed ❌",
            "message": "student_id, category_id, and description are required"
        }), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO grievances (student_id, category_id, description, status) VALUES (%s, %s, %s, 'New')",
            (student_id, category_id, description)
        )

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "message": "Grievance submitted successfully!"
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500


@grievance_bp.route("/grievance/my/<int:student_id>", methods=["GET"])
def my_grievances(student_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                g.grievance_id,
                g.description,
                g.status,
                g.created_at,
                c.category_name,
                c.expected_resolution_days
            FROM grievances g
            JOIN categories c ON g.category_id = c.category_id
            WHERE g.student_id = %s
            ORDER BY g.created_at DESC
        """, (student_id,))

        rows = cursor.fetchall()
        conn.close()

# Add RTCI indicator for each grievance
        for g in rows:
              g["rtci_status"] = get_resolution_indicator(g["created_at"], g["expected_resolution_days"])
  

        return jsonify({
             "status": "success ✅",
             "student_id": student_id,
             "grievances": rows
   
})


    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500
