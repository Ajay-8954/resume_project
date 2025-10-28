class User:
    @staticmethod
    def create_user(username, email, password, organisation_id=1):  # Default to org_id 1
        hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        return current_app.db.users.insert_one({
            'username': username,
            'email': email,
            'password': hashed_pw,
            'organisation_id': organisation_id  # Now stores simple integers: 1, 2, 3...
        })
    
    @staticmethod
    def find_by_email(email):
        return current_app.db.users.find_one({'email': email})
    
    @staticmethod
    def find_by_organisation(organisation_id):
        return list(current_app.db.users.find({'organisation_id': organisation_id}))
    
    @staticmethod
    def verify_password(hashed_pw, password):
        return bcrypt.check_password_hash(hashed_pw, password)
    
    @staticmethod
    def is_organization_member(user):
        """Check if user is an organization member (org_id > 1)"""
        return user and user.get('organisation_id', 1) > 1