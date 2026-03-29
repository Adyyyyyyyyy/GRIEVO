from flask import Blueprint, request, jsonify
from app.services.db_service import get_db_connection
from app.services.email_service import notify_student_status_update, notify_student_new_response

resolver_bp = Blueprint("resolver_bp", __name__)


@resolver_bp.route("/resolver/assigned/<int:resolver_id>", methods=["GET"])
def view_assigned(resolver_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                a.assignment_id,
                g.grievance_id,
                g.description,
                g.status,
                g.created_at
            FROM assignments a
            JOIN grievances g ON a.grievance_id = g.grievance_id
            WHERE a.resolver_id = %s
            ORDER BY a.assigned_at DESC
        """, (resolver_id,))

        rows = cursor.fetchall()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "resolver_id": resolver_id,
            "assigned_grievances": rows
        })

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500


@resolver_bp.route("/resolver/update-status", methods=["POST"])
def update_status():
    data = request.json

    grievance_id = data.get("grievance_id")
    new_status = data.get("status")

    allowed_status = ["In Progress", "Resolved", "Closed"]

    if not grievance_id or not new_status:
        return jsonify({"status": "failed ❌", "message": "grievance_id and status are required"}), 400

    if new_status not in allowed_status:
        return jsonify({"status": "failed ❌", "message": f"Invalid status. Allowed: {allowed_status}"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get student email and grievance info for notification
        cursor.execute("""
            SELECT 
                g.grievance_id,
                u.email AS student_email,
                c.category_name
            FROM grievances g
            JOIN users u ON g.student_id = u.user_id
            JOIN categories c ON g.category_id = c.category_id
            WHERE g.grievance_id = %s
        """, (grievance_id,))
        info = cursor.fetchone()

        if new_status == "Resolved":
            cursor.execute(
                "UPDATE grievances SET status=%s, resolved_at=NOW() WHERE grievance_id=%s",
                (new_status, grievance_id)
            )
        else:
            cursor.execute(
                "UPDATE grievances SET status=%s WHERE grievance_id=%s",
                (new_status, grievance_id)
            )

        conn.commit()
        conn.close()

        # Send email to student
        if info:
            notify_student_status_update(
                student_email=info["student_email"],
                grievance_id=grievance_id,
                category=info["category_name"],
                new_status=new_status
            )

        return jsonify({
            "status": "success ✅",
            "message": f"Grievance status updated to {new_status}"
        })

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500


@resolver_bp.route("/resolver/respond", methods=["POST"])
def respond():
    data = request.json

    grievance_id = data.get("grievance_id")
    responder_id = data.get("responder_id")
    response_text = data.get("response_text")

    if not grievance_id or not responder_id or not response_text:
        return jsonify({"status": "failed ❌", "message": "grievance_id, responder_id, and response_text are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "INSERT INTO responses (grievance_id, responder_id, response_text) VALUES (%s, %s, %s)",
            (grievance_id, responder_id, response_text)
        )

        # Get student email and admin name for notification
        cursor.execute("""
            SELECT 
                u.email AS student_email,
                c.category_name,
                adm.name AS admin_name
            FROM grievances g
            JOIN users u ON g.student_id = u.user_id
            JOIN categories c ON g.category_id = c.category_id
            JOIN users adm ON adm.user_id = %s
            WHERE g.grievance_id = %s
        """, (responder_id, grievance_id))
        info = cursor.fetchone()

        conn.commit()
        conn.close()

        if info:
            notify_student_new_response(
                student_email=info["student_email"],
                grievance_id=grievance_id,
                category=info["category_name"],
                admin_name=info["admin_name"]
            )

        return jsonify({"status": "success ✅", "message": "Response added successfully!"})

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500