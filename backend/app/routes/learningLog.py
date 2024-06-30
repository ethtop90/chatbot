# backend/app/routes/learningLog.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.learningData import LearningData
from datetime import datetime
import os

learningLog_bp = Blueprint('learningLogs', __name__, url_prefix='/learningLogs')

def format_learning_data(data):
    formatted_data = []
    for item in data:
        learning_date = item.get('learningDate', item['_id'].generation_time).strftime('%Y/%m/%d %H:%M')
        
        if 'filename' in item:
            original_name = '_'.join(item['filename'].split('_')[0:])
        else:
            original_name = item.get('title', '')

        formatted_item = {
            'id': str(item['_id']),
            'title': original_name,
            'type': 'URL形式' if 'URL' in item else 'ファイル形式' if 'filename' in item else '手入力形式',
            'note': item.get('remarks', item.get('content', '')),
            'learningDate': learning_date
        }
        formatted_data.append(formatted_item)
    return sorted(formatted_data, key=lambda x: x['learningDate'], reverse=True)

@learningLog_bp.route('/', methods=['POST'])
@jwt_required()
def create_learning_log():
    data = request.get_json()
    user_id = get_jwt_identity()
    log_type = data.get('type')

    try:
        if log_type == 'URL形式':
            LearningData.create_url_data(user_id, data['url'], data['title'], data['note'])
        elif log_type == 'ファイル形式':
            LearningData.create_file_data(user_id, request.files.getlist('files'))
        elif log_type == '手入力形式':
            LearningData.create_hand_input_data(user_id, data['title'], data['note'])
        else:
            return jsonify({'msg': 'Invalid type'}), 400

        return jsonify({'msg': 'Learning log created successfully'}), 201
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400

@learningLog_bp.route('/multiple', methods=['POST'])
@jwt_required()
def create_multiple_learning_logs():
    data = request.get_json()
    user_id = get_jwt_identity()

    try:
        for entry in data:
            log_type = entry.get('type')
            if log_type == 'URL形式':
                LearningData.create_url_data(user_id, entry['url'], entry['title'], entry['note'])
            elif log_type == 'ファイル形式':
                LearningData.create_file_data(user_id, request.files.getlist('files'))
            elif log_type == '手入力形式':
                LearningData.create_hand_input_data(user_id, entry['title'], entry['note'])
            else:
                return jsonify({'msg': 'Invalid type'}), 400

        return jsonify({'msg': 'Multiple learning logs created successfully'}), 201
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400

@learningLog_bp.route('/', methods=['GET'])
@jwt_required()
def read_learning_logs():
    print("GET request!")
    user_id = get_jwt_identity()
    url_data = LearningData.read_url_data(user_id)
    file_data = LearningData.read_file_data(user_id)
    hand_input_data = LearningData.read_hand_input_data(user_id)

    combined_data = url_data + file_data + hand_input_data
    formatted_data = format_learning_data(combined_data)

    return jsonify(formatted_data), 200

@learningLog_bp.route('/<log_id>', methods=['POST'])
@jwt_required()
def update_learning_log(log_id):
    user_id = get_jwt_identity()
    try:
        new_data = request.get_json()
    except Exception as e:
        new_data = {}
    # log_type = new_data.get('type')
    # if new_data is not None:
    num_properties = len(new_data)
    try:
        if num_properties == 3:
            LearningData.update_url_data(log_id, new_data)
        elif num_properties == 0:
            if 'files' not in request.files:
                return jsonify({'msg': 'No file part in the request'}), 400
            file = request.files['files']
            LearningData.update_file_data(log_id, file)
        elif num_properties == 2:
            LearningData.update_hand_input_data(log_id, new_data)
        else:
            return jsonify({'msg': 'Invalid type'}), 400

        return jsonify({'msg': 'Learning log updated successfully'}), 200
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400

@learningLog_bp.route('/multiple', methods=['PUT'])
@jwt_required()
def update_multiple_learning_logs():
    data = request.get_json()

    try:
        for entry in data:
            log_id = entry.pop('id', None)
            if log_id:
                log_type = entry.get('type')
                if log_type == 'URL形式':
                    LearningData.update_url_data(log_id, entry)
                elif log_type == 'ファイル形式':
                    LearningData.update_file_data(log_id, entry.get('filename'))
                elif log_type == '手入力形式':
                    LearningData.update_hand_input_data(log_id, entry)
                else:
                    return jsonify({'msg': 'Invalid type'}), 400

        return jsonify({'msg': 'Multiple learning logs updated successfully'}), 200
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400

@learningLog_bp.route('/<log_id>', methods=['DELETE'])
@jwt_required()
def delete_learning_log(log_id):
    try:
        LearningData.delete_url_data(log_id)
        LearningData.delete_file_data(log_id)
        LearningData.delete_hand_input_data(log_id)
        return jsonify({'msg': 'Learning log deleted successfully'}), 200
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400

@learningLog_bp.route('/multiple', methods=['DELETE'])
@jwt_required()
def delete_multiple_learning_logs():
    data = request.get_json()

    try:
        for entry in data:
            log_id = entry.get('id')
            if log_id:
                LearningData.delete_url_data(log_id)
                LearningData.delete_file_data(log_id)
                LearningData.delete_hand_input_data(log_id)

        return jsonify({'msg': 'Multiple learning logs deleted successfully'}), 200
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400
