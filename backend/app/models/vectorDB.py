import os
from app import db
from app.config import VECTOR_DB_PATH

class VectorDB:
    @staticmethod
    def create_vector_db(chatbot_id):
        vector_db_path = os.path.join(VECTOR_DB_PATH, f"{chatbot_id}_vector_db")
        os.makedirs(vector_db_path, exist_ok=True)
        db.vectordb.insert_one({'chatbotID': chatbot_id, 'path': vector_db_path})

    @staticmethod
    def read_vector_db(chatbot_id):
        return db.vectordb.find_one({'chatbotID': chatbot_id})

    @staticmethod
    def update_vector_db(chatbot_id, new_data):
        vector_db = db.vectordb.find_one({'chatbotID': chatbot_id})
        if vector_db:
            if 'path' in new_data:
                new_path = new_data['path']
                # Ensure the new directory exists
                os.makedirs(new_path, exist_ok=True)
                # Remove the old directory if it exists
                if os.path.exists(vector_db['path']):
                    os.rmdir(vector_db['path'])
                new_data['path'] = new_path

            db.vectordb.update_one({'chatbotID': chatbot_id}, {'$set': new_data})

    @staticmethod
    def delete_vector_db(chatbot_id):
        vector_db = db.vectordb.find_one({'chatbotID': chatbot_id})
        if vector_db:
            if os.path.exists(vector_db['path']):
                os.rmdir(vector_db['path'])
            db.vectordb.delete_one({'chatbotID': chatbot_id})
