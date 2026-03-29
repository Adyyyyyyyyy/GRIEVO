from flask import Blueprint, jsonify
from app.services.db_service import get_db_connection

masterdata_bp = Blueprint("masterdata_bp", __name__)

# ✅ Get all departments
@masterdata_bp.route("/departments", methods=["GET"])
def get_departments():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT department_id, department_name FROM departments ORDER BY department_name")
        rows = cursor.fetchall()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "departments": rows
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500


# ✅ Get categories by department_id
@masterdata_bp.route("/categories/by-department/<int:department_id>", methods=["GET"])
def get_categories_by_department(department_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT category_id, category_name, expected_resolution_days
            FROM categories
            WHERE department_id = %s
            ORDER BY category_name
        """, (department_id,))

        rows = cursor.fetchall()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "department_id": department_id,
            "categories": rows
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500

# ✅ Get all categories with department details
@masterdata_bp.route("/categories", methods=["GET"])
def get_all_categories():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                c.category_id,
                c.category_name,
                c.expected_resolution_days,
                d.department_id,
                d.department_name
            FROM categories c
            JOIN departments d ON c.department_id = d.department_id
            ORDER BY d.department_name, c.category_name
        """)

        rows = cursor.fetchall()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "categories": rows
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500

