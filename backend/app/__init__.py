from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

# Initialize extensions
bcrypt = Bcrypt()
client = None

def create_app():
    global client

    load_dotenv()

    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, 
         supports_credentials=True,
         origins=["http://localhost:5173"],
         resources={r"/api/*": {"origins": "http://localhost:5173", "supports_credentials": True}})

    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    app.config['MONGO_URI'] = os.getenv('MONGO_URI')
    app.config['UPLOAD_FOLDER'] = 'uploads'
    
    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize MongoDB connection
    try:
        client = MongoClient(app.config['MONGO_URI'])
        app.db = client.get_database()
        print("✅ MongoDB Connected Successfully")

        # Create indexes for filter collections (do this once on startup)
        app.db.jobDescriptions.create_index("_id")
        app.db.filter_resumes.create_index("jd_id")
        app.db.filter_resumes.create_index("processed_at")
        app.db.filter_resumes.create_index("score")
        print("✅ Indexes created for filter collections")

    except Exception as e:
        print(f"❌ MongoDB Connection Failed: {e}")
        raise

    # Initialize bcrypt
    bcrypt.init_app(app)

    # Register blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.resume_routes import resume_bp
    from app.routes.analysis_routes import analysis_bp
    from app.routes.optimize_routes import optimize_bp
    from app.routes.admin_routes import  admin_bp
    from app.routes.filter_routes import filter_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(resume_bp)
    app.register_blueprint(analysis_bp, url_prefix='/api')  # New registration
    app.register_blueprint(optimize_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(filter_bp, url_prefix='/api')

    # ✅ Add Content Security Policy globally
    @app.after_request
    def apply_csp(response):
        response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; "
        "frame-src 'self' https://accounts.google.com; "
        "connect-src 'self' https://www.googleapis.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src https://fonts.gstatic.com"
)

        return response

    return app
