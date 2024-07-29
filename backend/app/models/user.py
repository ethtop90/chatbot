# backend/app/models/user.py
# import bcrypt
# from app import db

# class User:
#     @staticmethod
#     def create_user(username, password, email, phone, admin_note, isadmin = False, status = False):
#         if password is not None:
#             hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
#             db.users.insert_one({'username': username, 'password': hashed_password, 'email': email, 'phone': phone, 'admin_note': admin_note, 'isadmin': isadmin, 'status': status})

#     @staticmethod
#     def find_user(email):
#         return db.users.find_one({'email': email})

#     @staticmethod
#     def verify_password(stored_password, provided_password):
#         print("stored_password:", stored_password)
#         print("provided_password:", provided_password)
#         return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)

# backend/app/models/user.py
import bcrypt
from app import db
from bson.objectid import ObjectId
from datetime import datetime

class User:
    @staticmethod
    # def create_user(username, password, email, phone, admin_note, isadmin=False, status=False):
    #     if password:
    #         user_data = {
    #             'username': username,
    #             'email': email,
    #             'phone': phone,
    #             'admin_note': admin_note,
    #             'isadmin': isadmin,
    #             'status': status,
    #             'registrationDate': datetime.now().strftime("%Y/%m/%d"),
    #         }
    #         user_data['password'] = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    #         db.users.insert_one(user_data)
    def create_user(username, password, email = "test@gmail.com", phone = "123456789", admin_note = "", isadmin = False, status = False):
        if password is not None:
            hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            db.users.insert_one({'username': username, 'password': hashed_password, 'email': email, 'phone': phone, 'admin_note': admin_note, 'isadmin': isadmin, 'status': status, 'registrationDate': datetime.now().strftime("%Y/%m/%d")})


    @staticmethod
    def update_user(id, username, email, phone, admin_note, status):
        update_data = {
            'username': username,
            'email': email,
            'phone': phone,
            'admin_note': admin_note,
            'status': status
        }
        db.users.update_one(
            {'_id': ObjectId(id)},
            {'$set': update_data}
        )

    @staticmethod
    def delete_user(id):
        db.users.delete_one({'_id': ObjectId(id)})

    @staticmethod
    def find_user(email_or_id):
        if isinstance(email_or_id, ObjectId):
            return db.users.find_one({'_id': email_or_id})
        return db.users.find_one({'email': email_or_id})

    @staticmethod
    def get_all_users():
        return list(db.users.find()) or []

    @staticmethod
    def verify_password(stored_password, provided_password):
        print("stored_password:", stored_password)
        print("provided_password:", provided_password)
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)

    @staticmethod
    def generate_code(email):
        code = 'generated-code-string'
        # Logic to send the code via email
        return code

    # @staticmethod
    # def is_admin(email):
    #     user = User.find_user(email)
    #     return user['isadmin'] if user else False

