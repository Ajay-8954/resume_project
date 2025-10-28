from bson import ObjectId

class Organisation:
    @staticmethod
    def create_organisation(name, description="", org_id=None):
        # If no org_id provided, auto-increment
        if org_id is None:
            last_org = current_app.db.organisations.find_one(
                {}, 
                sort=[("org_id", -1)]
            )
            org_id = (last_org['org_id'] + 1) if last_org else 1
        
        return current_app.db.organisations.insert_one({
            '_id': ObjectId(),  # MongoDB still needs _id, but we'll use org_id for logic
            'org_id': org_id,   # Our manual ID: 1, 2, 3...
            'name': name,
            'description': description,
            'is_default': False
        })
    
    @staticmethod
    def create_default_organisation():
        """Create organisation with ID 1 for individual users"""
        default_org = current_app.db.organisations.find_one({'org_id': 1})
        if not default_org:
            return current_app.db.organisations.insert_one({
                '_id': ObjectId(),
                'org_id': 1,  # Explicitly set to 1
                'name': 'Individual Users',
                'description': 'Default organisation for individual users',
                'is_default': True
            })
        return default_org
    
    @staticmethod
    def find_by_org_id(org_id):
        return current_app.db.organisations.find_one({'org_id': org_id})