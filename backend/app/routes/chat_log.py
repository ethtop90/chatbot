from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import app
from app.models.chatbot import ChatbotKeyword, ChatbotLog
from app.utils.llm import *
import traceback
from app import db
from app.models.chatLog import ChatLog

chatlog_bp = Blueprint('chatLog', __name__, url_prefix='/chatLog')

@chatlog_bp.route('/', methods=['GET'])
@jwt_required()
def read_chatlog():
    # data = request.get_json()
    # url = data.get('url')
    # title = data.get('title')
    # remarks = data.get('remarks')
    user_email = get_jwt_identity()

    try:
        logs = ChatLog.read_chat_logs(user_email)
        return jsonify({'msg': 'Read chat logs successfully', 'chat_logs': logs}), 201
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400
    
@chatlog_bp.route('/delete/<log_id>', methods=['DELETE'])
@jwt_required()
def delete_chatlog(log_id):
    try:
        chat_log = db.chatlog.find_one({'_id': ObjectId(log_id)})
        if chat_log:
            ChatLog.delete_chat_log(log_id)
            return jsonify({'msg': 'Deleted chat log successfully'}), 200
        else:
            return jsonify({'msg': 'Chat log not found'}), 404
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400
    except Exception as e:
        # Catch all other exceptions to avoid uncaught exceptions
        return jsonify({'msg': 'An error occurred', 'error': str(e)}), 500

@chatlog_bp.route('/delete', methods=['POST'])
@jwt_required()
def delete_chatlogs_by_email():
    data = request.get_json()
    user_email = data.get('email')
    try:
        logs = db.chatlog.find({'user_email': user_email})
        if len(logs):
            ChatLog.delete_all_chat_logs_by_user_email(user_email)
            return jsonify({'msg': 'Deleted all chat logs successfully'})
    except ValueError as e:
        return jsonify({'msg': str(e)}), 400