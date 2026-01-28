from flask import Flask
from app.routes.auth_routes import auth_bp
from app.routes.grievance_routes import grievance_bp

def create_app():
    app = Flask(__name__)

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(grievance_bp)

    @app.route("/")
    def home():
        return "GRIEVO Backend is running ✅"

    return app
