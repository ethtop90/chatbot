# backend/app/models/chatLog.py
from bson import ObjectId
from app import db

class ChatLog:

    @staticmethod
    def create_chat_log(date, user_email, question, answer):
        db.chatlog.insert_one({
            # 'type': log_type,
            'date': date,
            'user_email': user_email,
            'question': question,
            'answer': answer,
            # 'score': score
        })

    @staticmethod
    def read_chat_logs(user_email):
        logs = db.chatlog.find({'user_email': user_email})
        processed_logs = []
        for log in logs:
            processed_log = {
                '_id': str(log['_id']),  # Convert ObjectId to string
                'date': log['date'],
                'user_email': log['user_email'],
                'question': log['question'],
                'answer': log['answer'],
                # Add other fields if present
            }
            processed_logs.append(processed_log)
        return processed_logs or []

    @staticmethod
    def update_chat_log(log_id, new_data):
        db.chatlog.update_one({'_id': ObjectId(log_id)}, {'$set': new_data})

    @staticmethod
    def delete_chat_log(log_id):
        return db.chatlog.delete_one({'_id': ObjectId(log_id)})

    @staticmethod
    def delete_all_chat_logs_by_user_email(user_email):
        result = db.chatlog.delete_many({'user_email': user_email})
        return result.deleted_count
