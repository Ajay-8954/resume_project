from flask import current_app
from bson import ObjectId

from datetime import datetime

class Resume:
    @staticmethod
    def create_resume(user_id, title, content, template):
        return current_app.db.resumes.insert_one({
            "user_id": str(user_id),
            "title": title,
            "content": content,
             'template': template,
        'created_at': datetime.utcnow()
        })

    @staticmethod
    def get_resumes_by_user(user_id):
        return current_app.db.resumes.find({"user_id": str(user_id)})

    @staticmethod
    def update_resume_title(resume_id, title):
        return current_app.db.resumes.update_one(
            {"_id": ObjectId(resume_id)},
            {
                "$set": {
                    "title": title
                }
            }
        )




    @staticmethod
    def update_resume(resume_id, title, content, template):
        return current_app.db.resumes.update_one(
            {"_id": ObjectId(resume_id)},
            {
                "$set": {
                    "title": title,
                    "content": content,
                    "template": template
                }
            }
        )
        
        
    @staticmethod
    def delete_resume(resume_id):
        return current_app.db.resumes.delete_one({"_id": ObjectId(resume_id)})

