# app/routes/__init__.py

from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('lastname') + data.get('firstname')
    password = data.get('password')
    email = data.get('email')
    phone = data.get('phone')

    
    if User.find_user(email):
        return jsonify({'msg': 'User already exists'}), 400

    User.create_user(username, password, email, phone)
    # user = User.find_user(email)
    # user['_id'] = str(user['_id'])
    data = {}
    data['status'] = 'ok'
    # data['userData'] = user
    return jsonify(data), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.find_user(email)
    if user and User.verify_password(user['password'], password):
        access_token = create_access_token(identity=email)
        user['_id'] = str(user['_id'])
        user.pop('password')  # Delete the 'password' key from the 'user' dictionary
        data = {}
        data['status'] = 'ok'
        data['userData'] = user
        data['access_token'] = access_token
        print(jsonify(data))
        return jsonify(data), 200
    return jsonify({'msg': 'Bad email or password'}), 401

@bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    data = request.get_json()
    access_token = data['access_token']
    data = {}
    data['status'] = 'ok'
    return jsonify(data), 200
