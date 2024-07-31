# backend/app/models/learningData.py
import os
import time
from bson import ObjectId
from urllib.parse import urlparse
from app import db
from app.config import UPLOAD_PATH

class LearningData:
    
    @staticmethod
    def is_valid_url(url):
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except ValueError:
            return False

    # URLData CRUD functions
    @staticmethod
    def create_url_data(user_id, url, title, remarks):
        if not LearningData.is_valid_url(url):
            raise ValueError("Invalid URL")
        db.urldata.insert_one({'userID': user_id, 'URL': url, 'title': title, 'remarks': remarks})

    @staticmethod
    def read_url_data(user_id):
        return list(db.urldata.find({'userID': user_id})) or []

    @staticmethod
    def update_url_data(url_data_id, new_data):
        db.urldata.update_one({'_id': ObjectId(url_data_id)}, {'$set': new_data})

    @staticmethod
    def delete_url_data(url_data_id):
        db.urldata.delete_one({'_id': ObjectId(url_data_id)})

    # FileData CRUD functions
    @staticmethod
    def create_file_data(user_id, file_list):
        for file in file_list:
            filename = file.filename
            unique_name = f"{user_id}_{int(time.time())}_{filename}"
            path = os.path.join(UPLOAD_PATH, unique_name)

            # Ensure the directory exists
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            file.save(path)
            db.filedata.insert_one({'userID': user_id, 'filename': filename, 'path': path})

    @staticmethod
    def read_file_data(user_id):
        return list(db.filedata.find({'userID': user_id})) or []

    # @staticmethod
    # def update_file_data(file_data_id, new_filename):
    #     file_data = db.filedata.find_one({'_id': ObjectId(file_data_id)})
    #     if file_data:
    #         new_path = file_data['path'].replace(file_data['filename'], new_filename)
    
    #         os.rename(file_data['path'], new_path)
    #         db.filedata.update_one({'_id': ObjectId(file_data_id)}, {'$set': {'filename': new_filename, 'path': new_path}})
    @staticmethod
    def update_file_data(file_data_id, file):
        file_data = db.filedata.find_one({'_id': ObjectId(file_data_id)})
        if file_data:
            # Remove the old file
            if os.path.exists(file_data['path']):
                os.remove(file_data['path'])

            # Save the new file
            filename = file.filename
            unique_name = f"{file_data['userID']}_{int(time.time())}_{filename}"
            new_path = os.path.join(UPLOAD_PATH, unique_name)
            os.makedirs(os.path.dirname(new_path), exist_ok=True)
            file.save(new_path)

            db.filedata.update_one(
                {'_id': ObjectId(file_data_id)},
                {'$set': {'filename': filename, 'path': new_path}}
            )

    @staticmethod
    def delete_file_data(file_data_id):
        file_data = db.filedata.find_one({'_id': ObjectId(file_data_id)})
        if file_data:
            os.remove(file_data['path'])
            db.filedata.delete_one({'_id': ObjectId(file_data_id)})

    # HandInputData CRUD functions
    @staticmethod
    def create_hand_input_data(user_id, title, content):
        db.handinputdata.insert_one({'userID': user_id, 'title': title, 'content': content})

    @staticmethod
    def read_hand_input_data(user_id):
        return list(db.handinputdata.find({'userID': user_id})) or []

    @staticmethod
    def update_hand_input_data(hand_input_data_id, new_data):
        db.handinputdata.update_one({'_id': ObjectId(hand_input_data_id)}, {'$set': new_data})

    @staticmethod
    def delete_hand_input_data(hand_input_data_id):
        db.handinputdata.delete_one({'_id': ObjectId(hand_input_data_id)})
