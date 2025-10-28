from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timezone, timedelta
from bson import ObjectId
from app.utils.auth_utils import token_required
from app.utils.admin_utils import super_admin_required
import secrets
import string

admin_bp = Blueprint('admin', __name__)

def generate_temp_password(length=10):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for i in range(length))

# Admin Dashboard Statistics - SIMPLIFIED
@admin_bp.route('/dashboard/stats', methods=['GET'])
@token_required
@super_admin_required
def admin_dashboard_stats(current_user):
    try:
        # Simple counts
        total_users = current_app.db.users.count_documents({})
        total_organisations = current_app.db.organisations.count_documents({})
        total_resumes = current_app.db.resumes.count_documents({})
        
        # Recent organisations - SIMPLE ObjectId conversion
        recent_organisations_raw = list(current_app.db.organisations.find(
            {}, 
            {'name': 1, 'created_at': 1, 'description': 1}
        ).sort('created_at', -1).limit(5))
        
        # Convert ObjectId to string manually
        recent_organisations = []
        for org in recent_organisations_raw:
            user_count = current_app.db.users.count_documents({
                'organisation_id': org['_id']
            })
            org_data = {
                '_id': str(org['_id']),
                'name': org['name'],
                'description': org.get('description', ''),
                'created_at': org['created_at'].isoformat() if org.get('created_at') else None,
                'user_count': user_count
            }
            recent_organisations.append(org_data)
        
        return jsonify({
            'stats': {
                'total_users': total_users,
                'total_organisations': total_organisations,
                'total_resumes': total_resumes,
            },
            'recent_organisations': recent_organisations
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get All Organisations - SIMPLIFIED
@admin_bp.route('/organisations', methods=['GET'])
@token_required
@super_admin_required
def get_all_organisations(current_user):
    try:
        # Simple query
        organisations_raw = list(current_app.db.organisations.find(
            {}, 
            {'name': 1, 'description': 1, 'created_at': 1, 'org_id': 1}
        ).sort('created_at', -1))
        
        # Convert ObjectId to string manually
        organisations = []
        for org in organisations_raw:
            org_data = {
                '_id': str(org['_id']),
                'name': org['name'],
                'description': org.get('description', ''),
                'org_id': org['org_id'],
                'created_at': org['created_at'].isoformat() if org.get('created_at') else None
            }
            organisations.append(org_data)
        
        return jsonify({
            'organisations': organisations,
            'total': len(organisations)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Create New Organisation - SIMPLIFIED
@admin_bp.route('/organisations', methods=['POST'])
@token_required
@super_admin_required
def create_organisation(current_user):
    try:
        data = request.get_json()
        
        # Basic validation
        required_fields = ['name', 'hr_admin_email', 'hr_admin_name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if organisation exists
        existing_org = current_app.db.organisations.find_one({'name': data['name']})
        if existing_org:
            return jsonify({'error': 'Organisation name already exists'}), 400
        
        # Check if HR admin email exists
        existing_user = current_app.db.users.find_one({'email': data['hr_admin_email']})
        if existing_user:
            return jsonify({'error': 'HR admin email already registered'}), 400
        
        # Generate organisation ID
        last_org = current_app.db.organisations.find_one({}, sort=[('org_id', -1)])
        new_org_id = (last_org['org_id'] + 1) if last_org else 2
        
        # Create organisation
        new_organisation = {
            'org_id': new_org_id,
            'name': data['name'],
            'description': data.get('description', ''),
            'created_by': str(current_user['_id']),
            'created_at': datetime.now(timezone.utc),
            'status': 'active'
        }
        
        org_result = current_app.db.organisations.insert_one(new_organisation)
        org_id = org_result.inserted_id
        
        # Generate temporary password
        temp_password = generate_temp_password()
        
        # Use bcrypt from auth routes
        from .. import bcrypt
        hashed_password = bcrypt.generate_password_hash(temp_password).decode('utf-8')
        
        # Create HR admin user
        hr_admin_user = {
            'username': data['hr_admin_name'].replace(' ', '_').lower(),
            'email': data['hr_admin_email'],
            'password': hashed_password,
            'organisation_id': org_id,
            'role': 'hr_admin',
            'is_active': True,
            'created_at': datetime.now(timezone.utc),
            'temp_password': temp_password
        }
        
        user_result = current_app.db.users.insert_one(hr_admin_user)
        
        return jsonify({
            'message': 'Organisation created successfully',
            'organisation': {
                'id': str(org_id),
                'name': data['name'],
                'org_id': new_org_id
            },
            'hr_admin': {
                'email': data['hr_admin_email'],
                'temp_password': temp_password
            }
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500