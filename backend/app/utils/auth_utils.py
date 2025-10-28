from functools import wraps
from flask import request, jsonify, current_app
import jwt
import datetime

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get('token')
        print(f"Token received: {token}")  # Debug line

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = current_app.db.users.find_one({'email': data['email']})
            
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
            
            # NEW: Add organisation information to current_user
            current_user['organisation_id'] = current_user.get('organisation_id', 1)
            current_user['is_organization_member'] = current_user['organisation_id'] > 1
            
        except Exception as e:
            print(f"Token error: {e}")  # Debug line
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated


def organization_member_required(f):
    """Decorator to restrict access to organization members only"""
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        # Check if user is an organization member
        if current_user.get('organisation_id', 1) <= 1:
            return jsonify({
                'message': 'Access denied. Organization membership required.',
                'error': 'NOT_ORGANIZATION_MEMBER'
            }), 403
        
        return f(current_user, *args, **kwargs)
    return decorated