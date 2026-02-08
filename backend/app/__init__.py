from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    jwt.init_app(app)
    CORS(app)

    from app.routes.auth import auth_bp
    from app.routes.incidents import incidents_bp
    from app.routes.organizations import org_bp
    from app.routes.stats import stats_bp
    from app.routes.uploads import uploads_bp
    from app.routes.guidance import guidance_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(incidents_bp, url_prefix='/incidents')
    app.register_blueprint(org_bp, url_prefix='/organizations')
    app.register_blueprint(stats_bp, url_prefix='/stats')
    app.register_blueprint(uploads_bp, url_prefix='/uploads')
    app.register_blueprint(guidance_bp, url_prefix='/guidance')

    with app.app_context():
        db.create_all()

    return app
