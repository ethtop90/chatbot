from bson import ObjectId
from app import db

class ChatbotKeyword:
    
    @staticmethod
    def get_keywords(chatbot_id):
        result = db.chatbotKeyword.find_one({'chatbotID': chatbot_id})
        if result:
            return result.get('keywords', [])
        return []

    @staticmethod
    def add_keywords(chatbot_id, keywords):
        db.chatbotKeyword.update_one(
            {'chatbotID': chatbot_id},
            {'$addToSet': {'keywords': {'$each': keywords}}},
            upsert=True
        )

    @staticmethod
    def remove_keywords(chatbot_id, keywords):
        db.chatbotKeyword.update_one(
            {'chatbotID': chatbot_id},
            {'$pull': {'keywords': {'$in': keywords}}}
        )

class ChatbotLog:

    @staticmethod
    def get_logs(chatbot_id, user_ip):
        return list(db.chatbotLog.find({'chatbotID': chatbot_id, 'userIP': user_ip}))

    @staticmethod
    def create_log(chatbot_id, user_ip, request_message, response_message):
        db.chatbotLog.insert_one({
            'chatbotID': chatbot_id,
            'userIP': user_ip,
            'req_and_res': {
                'request': request_message,
                'response': response_message
            }
        })
