# backend/app/models/chatLog.py

from bson import ObjectId
from app import db

class ChatLog:
    
    @staticmethod
    def create_log(chatbot_id, question, response):
        """
        Create a new chat log entry.
        :param chatbot_id: ID of the chatbot
        :param question: User's question
        :param response: Bot's response
        """
        log_entry = {
            'chatbotID': chatbot_id,
            'log': {
                'question': question,
                'response': response
            }
        }
        db.chatlogs.insert_one(log_entry)
        return log_entry

    @staticmethod
    def read_logs(chatbot_id):
        """
        Read all chat logs for a specific chatbot ID.
        :param chatbot_id: ID of the chatbot
        :return: List of chat logs
        """
        return list(db.chatlogs.find({'chatbotID': chatbot_id}))

    @staticmethod
    def update_log(log_id, question=None, response=None):
        """
        Update an existing chat log entry.
        :param log_id: ID of the log entry to update
        :param question: (Optional) Updated question
        :param response: (Optional) Updated response
        """
        update_fields = {}
        if question:
            update_fields['log.question'] = question
        if response:
            update_fields['log.response'] = response
        db.chatlogs.update_one({'_id': ObjectId(log_id)}, {'$set': update_fields})

    @staticmethod
    def delete_log(log_id):
        """
        Delete a chat log entry.
        :param log_id: ID of the log entry to delete
        """
        db.chatlogs.delete_one({'_id': ObjectId(log_id)})

    @staticmethod
    def delete_logs_by_chatbot(chatbot_id):
        """
        Delete all chat log entries for a specific chatbot ID.
        :param chatbot_id: ID of the chatbot
        """
        db.chatlogs.delete_many({'chatbotID': chatbot_id})
