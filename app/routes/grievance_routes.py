import os
from flask import Blueprint, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from app.services.db_service import get_db_connection
from app.services.resolution_time_service import get_resolution_indicator
from app.services.email_service import notify_admin_new_grievance

grievance_bp = Blueprint("grievance_bp", __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@grievance_bp.route("/grievance/submit", methods=["POST"])
def submit_grievance():
    student_id = request.form.get("student_id")
    category_id = request.form.get("category_id")
    description = request.form.get("description")
    priority = request.form.get("priority", "Medium")
    is_anonymous = request.form.get("is_anonymous", "false").lower() == "true"

    allowed_priority = ["Low", "Medium", "High", "Urgent"]

    if not student_id or not category_id or not description:
        return jsonify({"status": "failed ❌", "message": "student_id, category_id, and description are required"}), 400

    if priority not in allowed_priority:
        return jsonify({"status": "failed ❌", "message": f"Invalid priority. Allowed: {allowed_priority}"}), 400

    # Handle file upload
    attachment_filename = None
    if "attachment" in request.files:
        file = request.files["attachment"]
        if file and file.filename and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            unique_filename = f"{student_id}_{category_id}_{filename}"
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(os.path.join(UPLOAD_FOLDER, unique_filename))
            attachment_filename = unique_filename

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            "SELECT department_id FROM categories WHERE category_id = %s",
            (category_id,)
        )
        category = cursor.fetchone()

        if not category:
            conn.close()
            return jsonify({"status": "failed ❌", "message": "Invalid category"}), 400

        department_id = category["department_id"]

        cursor.execute(
            """INSERT INTO grievances 
               (student_id, category_id, description, status, priority, is_anonymous, attachment)
               VALUES (%s, %s, %s, 'New', %s, %s, %s)""",
            (student_id, category_id, description, priority, is_anonymous, attachment_filename)
        )
        grievance_id = cursor.lastrowid

        cursor.execute(
            "SELECT user_id, email, name FROM users WHERE role='admin' AND department_id=%s LIMIT 1",
            (department_id,)
        )
        admin = cursor.fetchone()

        admin_email = None
        admin_name = None

        if admin:
            cursor.execute(
                "INSERT INTO assignments (grievance_id, resolver_id) VALUES (%s, %s)",
                (grievance_id, admin["user_id"])
            )
            cursor.execute(
                "UPDATE grievances SET status='Assigned' WHERE grievance_id=%s",
                (grievance_id,)
            )
            admin_email = admin["email"]
            admin_name = admin["name"]

        cursor.execute("""
            SELECT c.category_name, d.department_name
            FROM categories c
            JOIN departments d ON c.department_id = d.department_id
            WHERE c.category_id = %s
        """, (category_id,))
        cat_info = cursor.fetchone()

        conn.commit()
        conn.close()

        if admin_email and cat_info:
            notify_admin_new_grievance(
                admin_email=admin_email,
                admin_name=admin_name,
                grievance_id=grievance_id,
                category=cat_info["category_name"],
                department=cat_info["department_name"],
                priority=priority
            )

        return jsonify({
            "status": "success ✅",
            "message": "Grievance submitted and assigned successfully!"
        })

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500


@grievance_bp.route("/uploads/<filename>", methods=["GET"])
def get_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename, as_attachment=False)


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
                g.priority,
                g.is_anonymous,
                g.created_at,
                g.attachment,
                c.category_name,
                c.expected_resolution_days,
                d.department_name,
                adm.name AS admin_name,
                adm.email AS admin_email
            FROM grievances g
            JOIN categories c ON g.category_id = c.category_id
            JOIN departments d ON c.department_id = d.department_id
            LEFT JOIN assignments a ON g.grievance_id = a.grievance_id
            LEFT JOIN users adm ON a.resolver_id = adm.user_id AND adm.role = 'admin'
            WHERE g.student_id = %s
            ORDER BY g.created_at DESC
        """, (student_id,))

        rows = cursor.fetchall()
        conn.close()

        for g in rows:
            g["rtci_status"] = get_resolution_indicator(g["created_at"], g["expected_resolution_days"])
            if g["attachment"]:
                g["attachment_url"] = f"http://localhost:5000/uploads/{g['attachment']}"
            else:
                g["attachment_url"] = None

        return jsonify({"status": "success ✅", "student_id": student_id, "grievances": rows})

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500


@grievance_bp.route("/grievance/<int:grievance_id>/responses", methods=["GET"])
def get_responses(grievance_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                r.response_id,
                r.response_text,
                r.responded_at,
                u.name AS responder_name,
                u.role AS responder_role
            FROM responses r
            JOIN users u ON r.responder_id = u.user_id
            WHERE r.grievance_id = %s
            ORDER BY r.responded_at ASC
        """, (grievance_id,))

        rows = cursor.fetchall()
        conn.close()

        return jsonify({"status": "success ✅", "responses": rows})

    except Exception as e:
        return jsonify({"status": "failed ❌", "error": str(e)}), 500
