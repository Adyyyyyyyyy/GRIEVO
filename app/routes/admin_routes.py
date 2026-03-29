from flask import Blueprint, request, jsonify
from app.services.db_service import get_db_connection
from app.services.resolution_time_service import get_resolution_indicator

admin_bp = Blueprint("admin_bp", __name__)


# ✅ Admin views grievances for their department only
@admin_bp.route("/admin/grievances", methods=["GET"])
def all_grievances():
    department_id = request.args.get("department_id")

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        if department_id:
            cursor.execute("""
                SELECT 
                    g.grievance_id,
                    g.description,
                    g.status,
                    g.priority,
                    g.is_anonymous,
                    g.created_at,
                    g.resolved_at,
                    c.category_name,
                    c.expected_resolution_days,
                    d.department_name,
                    d.department_id,
                    u.name AS student_name,
                    u.email AS student_email,
                    g.attachment
                FROM grievances g
                JOIN categories c ON g.category_id = c.category_id
                JOIN departments d ON c.department_id = d.department_id
                JOIN users u ON g.student_id = u.user_id
                WHERE d.department_id = %s
                ORDER BY g.created_at DESC
            """, (department_id,))
        else:
            cursor.execute("""
                SELECT 
                    g.grievance_id,
                    g.description,
                    g.status,
                    g.priority,
                    g.is_anonymous,
                    g.created_at,
                    g.resolved_at,
                    c.category_name,
                    c.expected_resolution_days,
                    d.department_name,
                    d.department_id,
                    u.name AS student_name,
                    u.email AS student_email,
                    g.attachment
                FROM grievances g
                JOIN categories c ON g.category_id = c.category_id
                JOIN departments d ON c.department_id = d.department_id
                JOIN users u ON g.student_id = u.user_id
                ORDER BY g.created_at DESC
            """)

        rows = cursor.fetchall()
        conn.close()

        for g in rows:
            g["rtci_status"] = get_resolution_indicator(g["created_at"], g["expected_resolution_days"])

        return jsonify({"status": "success ✅", "grievances": rows})

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500


# ✅ Admin assigns grievance to resolver
@admin_bp.route("/admin/assign", methods=["POST"])
def assign_grievance():
    data = request.json
    grievance_id = data.get("grievance_id")
    resolver_id = data.get("resolver_id")

    if not grievance_id or not resolver_id:
        return jsonify({"status": "failed ❌", "message": "grievance_id and resolver_id are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO assignments (grievance_id, resolver_id) VALUES (%s, %s)",
            (grievance_id, resolver_id)
        )
        cursor.execute(
            "UPDATE grievances SET status='Assigned' WHERE grievance_id=%s",
            (grievance_id,)
        )

        conn.commit()
        conn.close()

        return jsonify({"status": "success ✅", "message": "Grievance assigned successfully!"})

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500