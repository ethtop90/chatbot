import bcrypt
from app import db

class User:
    @staticmethod
    def create_user(username, password, email, phone):
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        db.users.insert_one({'username': username, 'password': hashed_password, 'email': email, 'phone': phone})

    @staticmethod
    def find_user(email):
        return db.users.find_one({'email': email})

    @staticmethod
    def verify_password(stored_password, provided_password):
        print("stored_password:", stored_password)
        print("provided_password:", provided_password)
        return bcrypt.checkpw(provided_password.encode('utf-8'), stored_password)
