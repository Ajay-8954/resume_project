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
        except Exception as e:
            print(f"Token error: {e}")  # Debug line
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401

        return f(current_user, *args, **kwargs)
    return decorated
