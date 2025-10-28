from flask import Blueprint, request, jsonify, make_response, current_app
import jwt
from datetime import datetime, timezone, timedelta
from functools import wraps
from app.utils.auth_utils import token_required
from .. import bcrypt
from google.oauth2 import id_token
from google.auth.transport import requests

auth_bp = Blueprint('auth', __name__)


# Registration Route

# Special admin creation endpoint (add to auth_routes.py)
@auth_bp.route('/register-admin', methods=['POST'])
def register_admin():
    data = request.get_json()
    
    # Simple security check (you can enhance this)
    admin_secret = data.get('admin_secret')
    if admin_secret != 'YOUR_ADMIN_SECRET_KEY':  # Change this to a secure secret
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Check if email already exists
    existing_user = current_app.db.users.find_one({'email': data['email']})
    if existing_user:
        return jsonify({'error': 'Email already exists'}), 400
    
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Create super admin user
    super_admin_data = {
        'username': data['username'],
        'email': data['email'],
        'password': hashed_pw,
        'organisation_id': 1,
        'role': 'super_admin',
        'permissions': [
            'create_organisations',
            'manage_all_users', 
            'view_all_organisations',
            'system_settings',
            'delete_organisations'
        ],
        'is_active': True,
        'created_at': datetime.now(timezone.utc),
        'last_login': None,
        'login_count': 0
    }
    
    current_app.db.users.insert_one(super_admin_data)
    
    return jsonify({
        'message': 'Super admin created successfully',
        'user': {
            'email': data['email'],
            'username': data['username'],
            'role': 'super_admin'
        }
    }), 201


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
        'organisation_id': 1,  # ← ADDED THIS LINE
        'createdAt': datetime.now(timezone.utc)  # Good practice to track creation time
    })
    
    response = jsonify({'message': 'User created successfully'})
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 201


# Login Route
# Login Route - FIXED ObjectId comparison
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    db = current_app.db
    user = db.users.find_one({'email': data['email']})
    
    if not user or not bcrypt.check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # FIXED: Handle ObjectId comparison properly
    organisation_id = user.get('organisation_id', 1)
    
    # If organisation_id is ObjectId, it's an organisation member (not default org)
    # If it's 1 (integer), it's an individual user
    if isinstance(organisation_id, int):
        is_organization_member = organisation_id > 1
    else:
        # If it's ObjectId, it means it's a custom organisation (not default)
        is_organization_member = True
    
    token = jwt.encode({
        'email': user['email'],
        'role': user.get('role', 'individual'),
        'organisation_id': str(organisation_id),  # Convert to string for JWT
        'exp': datetime.now(timezone.utc) + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")
    
    response = make_response(jsonify({
        'message': 'Login successful',
        'user': {
            'email': user['email'],
            'username': user['username'],
            'organisation_id': str(organisation_id),  # Convert to string for frontend
            'is_organization_member': is_organization_member,
            'role': user.get('role', 'individual')
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
# Token Validation Route - FIXED ObjectId comparison
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

        # FIXED: Handle ObjectId comparison properly
        organisation_id = user.get('organisation_id', 1)
        
        if isinstance(organisation_id, int):
            is_organization_member = organisation_id > 1
        else:
            is_organization_member = True
            
        response = jsonify({
            'valid': True,
            'user': {
                'email': user['email'],
                'username': user['username'],
                'organisation_id': str(organisation_id),
                'is_organization_member': is_organization_member,
                'role': user.get('role', 'individual')
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


# Google Sign-In Route
# Google Sign-In Route - FIXED ObjectId handling
@auth_bp.route('/google', methods=['POST'])
def google_auth():
    try:
        id_token_str = request.json.get('id_token')
        if not id_token_str:
            return jsonify({'error': 'No ID token provided'}), 400

        CLIENT_ID = '617265112177-2f6l38vl5c7t8cmeief28p1ik6ecboj9.apps.googleusercontent.com'
        idinfo = id_token.verify_oauth2_token(id_token_str, requests.Request(), CLIENT_ID)

        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        user_id = idinfo['sub']

        db = current_app.db
        existing_user = db.users.find_one({'email': email})

        if existing_user:
            if existing_user['username'] != name:
                db.users.update_one(
                    {'email': email},
                    {'$set': {'username': name}}
                )
            organisation_id = existing_user.get('organisation_id', 1)
            user_role = existing_user.get('role', 'individual')
        else:
            organisation_id = 1  # Default to individual user
            user_role = 'individual'
            db.users.insert_one({
                'username': name,
                'email': email,
                'organisation_id': organisation_id,
                'role': user_role,
                'createdAt': datetime.now(timezone.utc)
            })

        # FIXED: Handle ObjectId comparison properly
        if isinstance(organisation_id, int):
            is_organization_member = organisation_id > 1
        else:
            is_organization_member = True

        token = jwt.encode({
            'email': email,
            'role': user_role,
            'organisation_id': str(organisation_id),
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm="HS256")

        response = make_response(jsonify({
            'message': 'Login successful',
            'user': {
                'email': email,
                'username': name,
                'organisation_id': str(organisation_id),
                'is_organization_member': is_organization_member,
                'role': user_role
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
            max_age=86400
        )
        return response
    except ValueError as e:
        return jsonify({'error': 'Invalid Google token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500