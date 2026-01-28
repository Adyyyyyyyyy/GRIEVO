import re
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from app.services.db_service import get_db_connection

auth_bp = Blueprint("auth_bp", __name__)

def is_valid_srm_email(email: str) -> bool:
    pattern = r"^[a-zA-Z]{2}\d{4}@srmist\.edu\.in$"
    return re.match(pattern, email) is not None


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.json

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "student")

    if not name or not email or not password:
        return jsonify({
            "status": "failed ❌",
            "message": "Name, email, password required"
        }), 400

    if not is_valid_srm_email(email):
        return jsonify({
            "status": "failed ❌",
            "message": "Only SRM official emails allowed (example: ts0614@srmist.edu.in)"
        }), 400

    hashed_pw = generate_password_hash(password)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s, %s, %s, %s)",
            (name, email, hashed_pw, role)
        )

        conn.commit()
        conn.close()

        return jsonify({
            "status": "success ✅",
            "message": "User registered successfully!"
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "status": "failed ❌",
            "message": "Email and password required"
        }), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
        user = cursor.fetchone()
        conn.close()

        if not user:
            return jsonify({
                "status": "failed ❌",
                "message": "Invalid email"
            }), 401

        if not check_password_hash(user["password"], password):
            return jsonify({
                "status": "failed ❌",
                "message": "Invalid password"
            }), 401

        return jsonify({
            "status": "success ✅",
            "message": "Login successful!",
            "user": {
                "user_id": user["user_id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        })

    except Exception as e:
        return jsonify({
            "status": "failed ❌",
            "error": str(e)
        }), 500
