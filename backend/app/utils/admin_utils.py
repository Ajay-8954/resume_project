# app/utils/admin_utils.py
from functools import wraps
from flask import request, jsonify, current_app
from datetime import datetime, timezone

def super_admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.get('role') != 'super_admin':
            return jsonify({
                'error': 'Access denied. Super admin privileges required.',
                'code': 'ADMIN_ACCESS_REQUIRED'
            }), 403
        return f(current_user, *args, **kwargs)
    return decorated

def log_admin_action(current_user, action, target_type=None, target_id=None):
    """Log admin actions for audit trail"""
    try:
        admin_log = {
            'admin_id': current_user['_id'],
            'action': action,
            'target_type': target_type,
            'target_id': target_id,
            'details': request.get_json() if request.is_json else {},
            'ip_address': request.remote_addr,
            'created_at': datetime.now(timezone.utc)
        }
        current_app.db.admin_logs.insert_one(admin_log)
    except Exception as e:
        # Don't break the main action if logging fails
        print(f"Failed to log admin action: {e}")