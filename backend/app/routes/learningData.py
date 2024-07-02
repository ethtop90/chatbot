# backend/app/routes/learningData.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.learningData import LearningData
import os
from app.utils.llm import create_vector_db  # Import the create_vector_db function

bp = Blueprint('learningData', __name__, url_prefix='/learningData')

# Middleware to create vectorDB after operations
def create_vector_db_middleware(user_id):
    try:
        create_vector_db(user_id)
    except Exception as e:
        print(f"Error creating vector DB: {e}")

# URLData endpoints
@bp.route('/url', methods=['POST'])
@jwt_required()
def create_url_data():
    data = request.get_json()
    url = data.get('url')
    title = data.get('title')
    remarks = data.get('remarks')
    user_id = get_jwt_identity()

    try:
        LearningData.create_url_data(user_id, url, title, remarks)
        create_vector_db_middleware(user_id)
        return jsonify({'msg': 'URL data created successfully'}), 201
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400

@bp.route('/urls', methods=['POST'])
@jwt_required()
def create_multiple_url_data():
    data = request.get_json()
    user_id = get_jwt_identity()
    print(data)

    try:
        for entry in data:
            LearningData.create_url_data(user_id, entry['url'], entry['title'], entry['remarks'])
        create_vector_db_middleware(user_id)
        return jsonify({'msg': 'Multiple URL data created successfully'}), 201
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400

@bp.route('/url', methods=['GET'])
@jwt_required()
def read_url_data():
    user_id = get_jwt_identity()
    data = LearningData.read_url_data(user_id)
    return jsonify(data), 200

@bp.route('/urls', methods=['GET'])
@jwt_required()
def read_multiple_url_data():
    user_id = get_jwt_identity()
    data = LearningData.read_url_data(user_id)
    return jsonify(data), 200

@bp.route('/url/<url_data_id>', methods=['PUT'])
@jwt_required()
def update_url_data(url_data_id):
    new_data = request.get_json()
    user_id = get_jwt_identity()
    LearningData.update_url_data(url_data_id, new_data)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'URL data updated successfully'}), 200

@bp.route('/urls', methods=['PUT'])
@jwt_required()
def update_multiple_url_data():
    data = request.get_json()
    user_id = get_jwt_identity()

    for entry in data:
        url_data_id = entry.pop('id', None)
        if url_data_id:
            LearningData.update_url_data(url_data_id, entry)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Multiple URL data updated successfully'}), 200

@bp.route('/url/<url_data_id>', methods=['DELETE'])
@jwt_required()
def delete_url_data(url_data_id):
    user_id = get_jwt_identity()
    LearningData.delete_url_data(url_data_id)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'URL data deleted successfully'}), 200

@bp.route('/urls', methods=['DELETE'])
@jwt_required()
def delete_multiple_url_data():
    data = request.get_json()
    user_id = get_jwt_identity()

    for entry in data:
        url_data_id = entry.get('id')
        if url_data_id:
            LearningData.delete_url_data(url_data_id)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Multiple URL data deleted successfully'}), 200

# FileData endpoints
@bp.route('/file', methods=['POST'])
@jwt_required()
def create_file_data():
    user_id = get_jwt_identity()
    if 'files' not in request.files:
        return jsonify({'msg': 'No files part in the request'}), 400

    files = request.files.getlist('files')
    LearningData.create_file_data(user_id, files)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Files uploaded successfully'}), 201

@bp.route('/files', methods=['POST'])
@jwt_required()
def create_multiple_file_data():
    user_id = get_jwt_identity()
    if 'files' not in request.files:
        return jsonify({'msg': 'No files part in the request'}), 400

    files = request.files.getlist('files')
    LearningData.create_file_data(user_id, files)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Multiple files uploaded successfully'}), 201

@bp.route('/file', methods=['GET'])
@jwt_required()
def read_file_data():
    user_id = get_jwt_identity()
    data = LearningData.read_file_data(user_id)
    return jsonify(data), 200

@bp.route('/files', methods=['GET'])
@jwt_required()
def read_multiple_file_data():
    user_id = get_jwt_identity()
    data = LearningData.read_file_data(user_id)
    return jsonify(data), 200

@bp.route('/file/<file_data_id>', methods=['PUT'])
@jwt_required()
def update_file_data(file_data_id):
    new_filename = request.get_json().get('filename')
    user_id = get_jwt_identity()
    LearningData.update_file_data(file_data_id, new_filename)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'File data updated successfully'}), 200

@bp.route('/files', methods=['PUT'])
@jwt_required()
def update_multiple_file_data():
    data = request.get_json()
    user_id = get_jwt_identity()

    for entry in data:
        file_data_id = entry.pop('id', None)
        new_filename = entry.get('filename')
        if file_data_id and new_filename:
            LearningData.update_file_data(file_data_id, new_filename)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Multiple file data updated successfully'}), 200

@bp.route('/file/<file_data_id>', methods=['DELETE'])
@jwt_required()
def delete_file_data(file_data_id):
    user_id = get_jwt_identity()
    LearningData.delete_file_data(file_data_id)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'File data deleted successfully'}), 200

@bp.route('/files', methods=['DELETE'])
@jwt_required()
def delete_multiple_file_data():
    data = request.get_json()
    user_id = get_jwt_identity()

    for entry in data:
        file_data_id = entry.get('id')
        if file_data_id:
            LearningData.delete_file_data(file_data_id)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Multiple file data deleted successfully'}), 200

# HandInputData endpoints
@bp.route('/handinput', methods=['POST'])
@jwt_required()
def create_hand_input_data():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    user_id = get_jwt_identity()

    LearningData.create_hand_input_data(user_id, title, content)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Hand input data created successfully'}), 201

@bp.route('/handinputs', methods=['POST'])
@jwt_required()
def create_multiple_hand_input_data():
    data = request.get_json()
    user_id = get_jwt_identity()

    for entry in data:
        LearningData.create_hand_input_data(user_id, entry['title'], entry['content'])
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Multiple hand input data created successfully'}), 201

@bp.route('/handinput', methods=['GET'])
@jwt_required()
def read_hand_input_data():
    user_id = get_jwt_identity()
    data = LearningData.read_hand_input_data(user_id)
    return jsonify(data), 200

@bp.route('/handinputs', methods=['GET'])
@jwt_required()
def read_multiple_hand_input_data():
    user_id = get_jwt_identity()
    data = LearningData.read_hand_input_data(user_id)
    return jsonify(data), 200

@bp.route('/handinput/<hand_input_data_id>', methods=['PUT'])
@jwt_required()
def update_hand_input_data(hand_input_data_id):
    new_data = request.get_json()
    user_id = get_jwt_identity()
    LearningData.update_hand_input_data(hand_input_data_id, new_data)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Hand input data updated successfully'}), 200

@bp.route('/handinputs', methods=['PUT'])
@jwt_required()
def update_multiple_hand_input_data():
    data = request.get_json()
    user_id = get_jwt_identity()

    for entry in data:
        hand_input_data_id = entry.pop('id', None)
        if hand_input_data_id:
            LearningData.update_hand_input_data(hand_input_data_id, entry)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Multiple hand input data updated successfully'}), 200

@bp.route('/handinput/<hand_input_data_id>', methods=['DELETE'])
@jwt_required()
def delete_hand_input_data(hand_input_data_id):
    user_id = get_jwt_identity()
    LearningData.delete_hand_input_data(hand_input_data_id)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Hand input data deleted successfully'}), 200

@bp.route('/handinputs', methods=['DELETE'])
@jwt_required()
def delete_multiple_hand_input_data():
    data = request.get_json()
    user_id = get_jwt_identity()

    for entry in data:
        hand_input_data_id = entry.get('id')
        if hand_input_data_id:
            LearningData.delete_hand_input_data(hand_input_data_id)
    create_vector_db_middleware(user_id)
    return jsonify({'msg': 'Multiple hand input data deleted successfully'}), 200
