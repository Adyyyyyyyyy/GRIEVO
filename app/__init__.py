from flask import Flask
from flask_cors import CORS
from app.services.db_service import get_db_connection
from app.routes.auth_routes import auth_bp
from app.routes.grievance_routes import grievance_bp
from app.routes.masterdata_routes import masterdata_bp
from app.routes.report_routes import report_bp
from app.routes.admin_routes import admin_bp
from app.routes.resolver_routes import resolver_bp
from app.routes.feedback_routes import feedback_bp


def create_app():
    app = Flask(__name__)
    CORS(app)  # Allow frontend to call backend

    app.register_blueprint(auth_bp)
    app.register_blueprint(grievance_bp)
    app.register_blueprint(masterdata_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(resolver_bp)
    app.register_blueprint(feedback_bp)

    @app.route("/")
    def home():
        return "GRIEVO Backend is running ✅"

    @app.route("/db-test")
    def db_test():
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("SHOW TABLES;")
            tables = cursor.fetchall()
            conn.close()
            return {
                "status": "success ✅",
                "message": "Database connected successfully!",
                "tables": [t[0] for t in tables]
            }
        except Exception as e:
            return {
                "status": "failed ❌",
                "error": str(e)
            }, 500

    return app