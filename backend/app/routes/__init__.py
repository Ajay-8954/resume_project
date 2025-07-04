from .auth_routes import auth_bp
from .resume_routes import resume_bp
from .analysis_routes import analysis_bp
from .optimize_routes import optimize_bp

__all__ = ['auth_bp', 'resume_bp', 'analysis_bp', 'optimize_bp']