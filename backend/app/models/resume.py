from flask import current_app

class Resume:
    @staticmethod
    def create_resume(user_id, title, content):
        return current_app.db.resumes.insert_one({
            "user_id": str(user_id),
            "title": title,
            "content": content
        })

    @staticmethod
    def get_resumes_by_user(user_id):
        return current_app.db.resumes.find({"user_id": str(user_id)})
