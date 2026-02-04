from flask import Blueprint, request, jsonify
from app.services.db_service import get_db_connection

admin_bp = Blueprint("admin_bp", __name__)

# ✅ Admin assigns grievance to resolver
@admin_bp.route("/admin/assign", methods=["POST"])
def assign_grievance():
    data = request.json

    grievance_id = data.get("grievance_id")
    resolver_id = data.get("resolver_id")

    if not grievance_id or not resolver_id:
        return jsonify({
            "status": "failed ❌",
            "message": "grievance_id and resolver_id are required"
        }), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Insert assignment
        cursor.execute(
            "INSERT INTO assignments (grievance_id, resolver_id) VALUES (%s, %s)",
            (grievance_id, resolver_id)
        )

        # Update grievance status
        cursor.execute(
            "UPDATE grievances SET status='Assigned' WHERE grievance_id=%s",
            (grievance_id,)
        )

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "message": "Grievance assigned successfully!"
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500
