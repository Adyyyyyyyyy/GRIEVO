from flask import Blueprint, jsonify
from app.services.db_service import get_db_connection
from app.services.resolution_time_service import get_resolution_indicator

report_bp = Blueprint("report_bp", __name__)

@report_bp.route("/admin/delayed-grievances", methods=["GET"])
def delayed_grievances():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                g.grievance_id,
                g.description,
                g.status,
                g.priority,
                g.created_at,
                c.category_name,
                c.expected_resolution_days
            FROM grievances g
            JOIN categories c ON g.category_id = c.category_id
            WHERE g.status NOT IN ('Resolved', 'Closed')
            ORDER BY g.created_at ASC
        """)

        rows = cursor.fetchall()
        conn.close()

        delayed_list = []
        for g in rows:
            rtci = get_resolution_indicator(g["created_at"], g["expected_resolution_days"])
            g["rtci_status"] = rtci
            if rtci in ["Delayed", "Near Deadline"]:
                delayed_list.append(g)

        return jsonify({
            "status": "success ✅",
            "count": len(delayed_list),
            "grievances": delayed_list
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500
