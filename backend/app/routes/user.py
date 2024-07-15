# backend/app/routes/user.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from bson.objectid import ObjectId

user_bp = Blueprint('user', __name__, url_prefix='/users')

@user_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    email = get_jwt_identity()
    if is_admin(email) is False:
        return jsonify({'msg': 'Access was not permitted.'}), 404
    db_users = User.get_all_users()
    # Convert ObjectId to string for JSON serialization
    users = []
    for user in db_users:
        temp_user = {key: value for key, value in user.items() if key != 'password'}
        new_user = temp_user.copy()  # Create a copy of the user object to avoid modifying the original object
        new_user['_id'] = str(user['_id'])  # Convert _id to string
        users.append(new_user)

    return jsonify(users), 200

@user_bp.route('/<id>', methods=['GET'])
@jwt_required()
def get_user(id):
    email = get_jwt_identity()
    if is_admin(email) is False:
        return jsonify({'msg': 'Access was not permitted.'}), 404
    user = User.find_user(ObjectId(id))
    if user:
        user['_id'] = str(user['_id'])
        return jsonify(user), 200
    return jsonify({'msg': 'User not found'}), 404

@user_bp.route('/', methods=['POST'])
@jwt_required()
def create_user():
    email = get_jwt_identity()
    if is_admin(email) is False:
        return jsonify({'msg': 'Access was not permitted.'}), 404
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    admin_note = data.get('admin_note')

    if User.find_user(email):
        return jsonify({'msg': 'User already exists'}), 400

    User.create_user(username, "password", email, phone, admin_note, False, False)
    return jsonify({'msg': 'User created successfully'}), 201

@user_bp.route('/<id>', methods=['PUT'])
@jwt_required()
def update_user(id):
    email = get_jwt_identity()
    if is_admin(email) is False:
        return jsonify({'msg': 'Access was not permitted.'}), 404
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    phone = data.get('phone')
    admin_note = data.get('admin_note')
    status = data.get('status')

    user = User.find_user(ObjectId(id))
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    User.update_user(ObjectId(id), username, email, phone, admin_note, status)
    return jsonify({'msg': 'User updated successfully'}), 200

@user_bp.route('/<id>', methods=['DELETE'])
@jwt_required()
def delete_user(id):
    email = get_jwt_identity()
    if is_admin(email) is False:
        return jsonify({'msg': 'Access was not permitted.'}), 404
    user = User.find_user(ObjectId(id))
    if not user:
        return jsonify({'msg': 'User not found'}), 404

    User.delete_user(ObjectId(id))
    return jsonify({'msg': 'User deleted successfully'}), 200

def is_admin(email):
    user = User.find_user(email)
    
    return User.find_user(email)['isadmin']