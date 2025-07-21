from flask import Blueprint, request, jsonify, make_response, current_app
import jwt
from datetime import datetime, timezone, timedelta
from functools import wraps
from app.utils.auth_utils import token_required
from .. import bcrypt

auth_bp = Blueprint('auth', __name__)


# Registration Route
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if email OR username already exists
    existing_user = current_app.db.users.find_one({
        '$or': [
            {'email': data['email']},
            {'username': data['username']}
        ]
    })
    
    if existing_user:
        if existing_user['email'] == data['email']:
            return jsonify({'error': 'Email already exists'}), 400
        else:
            return jsonify({'error': 'Username already taken'}), 400
    
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    current_app.db.users.insert_one({
        'username': data['username'],
        'email': data['email'],
        'password': hashed_pw,
        'createdAt': datetime.now(timezone.utc)  # Good practice to track creation time
    })
    
    response = jsonify({'message': 'User created successfully'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 201


# Login Route
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    db = current_app.db
    user = db.users.find_one({'email': data['email']})
    
    if not user or not bcrypt.check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'email': user['email'],
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")
    
    response = make_response(jsonify({
        'message': 'Login successful',
        'user': {
            'email': user['email'],
            'username': user['username']
        }
    }))
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.set_cookie(
        'token',
        token,
        httponly=True,
        secure=False,
        samesite='Lax',
        max_age=86400  # 24 hours
    )
    return response

# Logout Route
@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({'message': 'Logged out successfully'}))
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.delete_cookie('token')
    return response

# Token Validation Route
@auth_bp.route('/validate', methods=['GET'])
def validate_token():
    token = request.cookies.get('token')
    db = current_app.db
    
    if not token:
        response = jsonify({'valid': False, 'message': 'Token missing'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 401
        
    try:
        data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        user = db.users.find_one({'email': data['email']})
        
        if not user:
            response = jsonify({'valid': False, 'message': 'User not found'})
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 401
            
        response = jsonify({
            'valid': True,
            'user': {
                'email': user['email'],
                'username': user['username']
            }
        })
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response
    except jwt.ExpiredSignatureError:
        response = jsonify({'valid': False, 'message': 'Token expired'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 401
    except jwt.InvalidTokenError:
        response = jsonify({'valid': False, 'message': 'Invalid token'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 401
