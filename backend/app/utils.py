from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

ROLE_HIERARCHY = {'viewer': 0, 'reporter': 1, 'admin': 2}


def require_role(minimum_role):
    """Decorator: reject requests from users below minimum_role."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            user = User.query.get(int(get_jwt_identity()))
            if not user:
                return jsonify({'error': 'User not found'}), 404
            if ROLE_HIERARCHY.get(user.role, 0) < ROLE_HIERARCHY[minimum_role]:
                return jsonify({'error': f'Requires {minimum_role} role'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator
