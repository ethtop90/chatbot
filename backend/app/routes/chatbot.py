from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import app
from app.models.chatbot import ChatbotKeyword, ChatbotLog
from app.utils.llm import *
import traceback
from app import db
from app.models.user import *

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/chatbot')

def process_chat_history(user_chat_history):
	processed_chat_history = []
	for chat_entry in user_chat_history:
		chat_entry.pop('_id', None)
		chat_entry.pop('email', None)
		chat_entry.pop('ip', None)
		chat_entry.pop('message_type', None)
		processed_chat_history.append(chat_entry)
	return processed_chat_history


@chatbot_bp.route('/', methods=['POST'])
def greetings():
	user_ip = request.remote_addr
	data = request.get_json()
	encrypted_email = data['chatbotID']
	email = decrypt_email(encrypted_email)
	user = db.users.find_one({'email': email})
	company_name = user.get('username')
	greetings = f"""
	こんにちは！株式会社{company_name}のサポートチャットです。
	お問い合わせ内容を選択ください。
	"""
	chatbot = chatbot_set.get(email)
	user_chat_history = process_chat_history(list(db.chat_history_collection.find({"email": email, "ip": user_ip})) or [])
	
	# keywords = generate_keyword(chatbot['keyword_chain'])
	print("decrypted_email:", email)
	keywords = generate_keyword(chatbot['rag_chain'])
	return jsonify({"greetings": greetings, "logs": user_chat_history, "keywords": keywords}),  200
	

@chatbot_bp.route('/add_message', methods=['POST'])
def add_message():
	user_ip = request.remote_addr
	data = request.get_json()
	encrypted_email = data['chatbotID']
	email = decrypt_email(encrypted_email)
	message_type = data['message_type']
	message = data['content']

	new_message = {
		"ip": user_ip,
		"email": email,
		"message_type": message_type,
		"content": message,
	}

	result = db.chat_history_collection.insert_one(new_message)
	return jsonify({"message": "メッセージが正常に追加されました。", "message_id": str(result.inserted_id)}), 201

@chatbot_bp.route('/respond_to_question', methods=['POST'])
def respond_to_question():
	user_ip = request.remote_addr
	data = request.get_json()
	if not data or 'question' not in data:
		return jsonify({"error": "無効なリクエストです。質問を提供してください。"}), 400

	encrypted_email = data['chatbotID']
	email = decrypt_email(encrypted_email)
	chat_history = data['chat_history']
	question = data['question']
	question_type = data['question_type']
	chatbot = chatbot_set.get(email)
	rag_chain = chatbot['rag_chain']
	if(question_type == "text"):
		user = db.users.find_one({"email": email})

		if user:
			user_chat_history = process_chat_history(list(db.chat_history_collection.find({"email": email, "ip": user_ip})) or [])
			chat_history = []
			for chat in user_chat_history:
				chat_history.append({
					"ip": user_ip,
					'role': chat['role'],
					'content': chat['content']
				})


		def generate():
			complete_response = []
			for response in generate_response(rag_chain, question, chat_history):
				complete_response.append(response)
				yield response
			
			full_response = "".join(complete_response)
			new_message_user = {
				"ip": user_ip,
				"email": email,
				"message_type": question_type,
				"role": "user",
				"content": question,
			}

			new_message_ai = {
				"ip": user_ip,
			    "email": email,
			    "message_type": question_type,
			    "role": "ai",
			    "content": full_response,
			}

			db.chat_history_collection.insert_one(new_message_user)
			db.chat_history_collection.insert_one(new_message_ai)
			
		
		return generate(), {"Content-Type": "text/plain"}

@chatbot_bp.route('/get_suggest_question', methods=['POST'])
def get_suggest_question():
	user_ip = request.remote_addr
	data = request.get_json()
	if not data or 'question' not in data:
		return jsonify({"error": "無効なリクエストです。質問を提供してください。"}), 400

	encrypted_email = data['chatbotID']
	email = decrypt_email(encrypted_email)
	chat_history = data['chat_history']
	question = data['question']
	question_type = data['question_type']

	chatbot = chatbot_set.get(email)
	follow_up_chain = chatbot['follow_up_chain']

	user = db.users.find_one({"email": email})

	if user:
		user_chat_history = process_chat_history(list(db.chat_history_collection.find({"email": email, "ip": user_ip})) or [])
		chat_history = []
		for chat in user_chat_history:
			chat_history.append({
				'ip': user_ip,
				'role': chat['role'],
				'content': chat['content']
			})

	follow_up_questions = generate_follow_up_question(follow_up_chain, question, chat_history)
	return jsonify({'follow_up_questions': follow_up_questions}), 200

@chatbot_bp.route('/get_chat_history', methods=['GET'])
def get_chat_history():
	user_ip = request.remote_addr
    
	email = request.args.get('email')
	chat_history = process_chat_history(list(db.chat_history_collection.find({"email": email, "ip": user_ip})) or []) 

	formatted_chat_history = []
	for chat in chat_history:
		formatted_chat_history.append({
			'ip': user_ip,
			'role': chat['role'],
			'content': chat['content'],
		})

	return jsonify(formatted_chat_history)