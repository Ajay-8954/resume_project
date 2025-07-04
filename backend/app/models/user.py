from flask import current_app
from .. import bcrypt

class User:
    @staticmethod
    def create_user(username, email, password):
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        return current_app.db.users.insert_one({
            'username': username,
            'email': email,
            'password': hashed_pw
        })
    
    @staticmethod
    def find_by_email(email):
        return current_app.db.users.find_one({'email': email})
    
    @staticmethod
    def verify_password(hashed_pw, password):
        return bcrypt.check_password_hash(hashed_pw, password)
