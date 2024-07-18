from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import app
from app.models.chatbot import ChatbotKeyword, ChatbotLog
from app.utils.llm import create_vector_db, create_rag_chain, create_follow_up_chain, generate_response, generate_follow_up_question
import traceback
from app import db

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/chatbot')

# Initialize vector DB, RAG chain, and follow-up chain
# def initialize_chatbot(chatbot_id):

#     create_vector_db(chatbot_id)
#     rag_chain = create_rag_chain(chatbot_id)
#     follow_up_chain = create_follow_up_chain(rag_chain)
#     response = generate_response(rag_chain, [])
    
#     return rag_chain, follow_up_chain
#     # try:
#     #     create_vector_db(chatbot_id)
#     #     rag_chain = create_rag_chain(chatbot_id)
#     #     follow_up_chain = create_follow_up_chain(rag_chain)
        
#     #     return rag_chain, follow_up_chain
#     # except Exception as e:
#     #     traceback.print_exc()
#     #     print(f"Error initializing chatbot: {e}")
#     #     return None, None
    
# # @chatbot_bp.after_
# # def after_request(response):
# #     if request.path == "/chatbot/" or request.path == "/chatbot/message":
# #         # Remove CORS headers for the specified endpoint
# #         response.headers.pop("Access-Control-Allow-Origin", None)
# #         response.headers.pop("Access-Control-Allow-Headers", None)
# #         response.headers.pop("Access-Control-Allow-Methods", None)
# #     return response

# @chatbot_bp.route('/', methods=['POST'])
# # @jwt_required()
# def chatbot_home():
#     # user_id = get_jwt_identity()
#     # chatbot_id = request.args.get('chatbotID')
#     data = request.get_json()
    
#     chatbot_id = data.get('chatbotID')

#     # Get request and response logs
#     logs = ChatbotLog.get_logs(chatbot_id, request.remote_addr)

#     # Initialize chatbot components
#     rag_chain, follow_up_chain = initialize_chatbot(chatbot_id)
    
#     keyword_question = """
#     既存の文書に基づいて、学習資料に関連するユーザーが質問できる次の6～10個のキーワードを返します。書式テンプレートを使用してください。回答を繰り返さないでください。
#     --- 書式テンプレート
#     [キーワード1", "キーワード2", "キーワード3", "キーワード4"
#     "キーワード1", "キーワード2", "キーワード3", "キーワード4", "キーワード5
#     "キーワード2", ["キーワード2"、
#     "キーワード3", "キーワード4
#     "キーワード4"
#     ]
#     書式テンプレート終了 --- --- --- 書式終了
#     """
#     init_response = []
#     def generate():
#         complete_response = []
#         for response in generate_response(rag_chain, keyword_question, []):
#             complete_response.append(response)
#             yield response
#         # full_response = "".join(complete_response)
        

#     return generate()

#     # Get keywords
#     keywords = ChatbotKeyword.get_keywords(chatbot_id)

#     # Get request and response logs
#     logs = ChatbotLog.get_logs(chatbot_id, request.remote_addr)

#     return jsonify({
#         'response': init_response,
#         'keywords': keywords,
#         'logs': logs
#     }), 200

# @chatbot_bp.route('/message', methods=['POST'])
# # @jwt_required()
# def chatbot_message():
#     data = request.get_json()
#     chatbot_id = data.get('chatbotID')
#     user_message = data.get('message')
#     user_ip = request.remote_addr

#     if not chatbot_id or not user_message:
#         return jsonify({'msg': 'Invalid request'}), 400

#     # Initialize chatbot components
#     rag_chain, follow_up_chain = initialize_chatbot(chatbot_id)

#     # Generate response
#     response_chunks = list(generate_response(rag_chain, user_message))
#     response_message = ''.join(response_chunks)

#     # Generate follow-up questions
#     follow_up_questions = generate_follow_up_question(follow_up_chain, user_message)

#     # Save log
#     ChatbotLog.create_log(chatbot_id, user_ip, user_message, response_message)

#     return jsonify({
#         'response': response_message,
#         'follow_up_questions': follow_up_questions
#     }), 200
@chatbot_bp.route('/', methods=['GET'])
def greetings():
	user_ip = request.remote_addr
	data = request.get_json()
	email = data['email']
	user = db.users.find_one({'email': email})
	company_name = user.get('username')
	greetings = f"""
	こんにちは！株式会社{company_name}のサポートチャットです。
	お問い合わせ内容を選択ください。
	"""
	
	return 
	

@chatbot_bp.route('/add_message', methods=['POST'])
def add_message():
	user_ip = request.remote_addr
	data = request.get_json()
	email = data['email']
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

	email = data['email']
	chat_history = data['chat_history']
	question = data['question']
	question_type = data['question_type']

	if(question_type == "text"):
		user = db.users.find_one({"email": email})

		if user:
			user_chat_history = list(db.chat_history_collection.find({"email": email}))
			chat_history = []
			for chat in user_chat_history:
				chat_history.append({
					"ip": user_ip,
					'role': chat['role'],
					'content': chat['content']
				})


		def generate():
			complete_response = []
			for response in generate_response(question, chat_history):
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

	email = data['email']
	chat_history = data['chat_history']
	question = data['question']
	question_type = data['question_type']

	user = db.users.find_one({"email": email})

	if user:
		user_chat_history = list(db.chat_history_collection.find({"email": email}))
		chat_history = []
		for chat in user_chat_history:
			chat_history.append({
				'ip': user_ip,
				'role': chat['role'],
				'content': chat['content']
			})

	follow_up_questions = generate_follow_up_question(question, chat_history)
	return jsonify({'follow_up_questions': follow_up_questions}), 200

@chatbot_bp.route('/get_chat_history', methods=['GET'])
def get_chat_history():
	user_ip = request.remote_addr
    
	email = request.args.get('email')
	chat_history = list(db.chat_history_collection.find({'email': email})) 

	formatted_chat_history = []
	for chat in chat_history:
		formatted_chat_history.append({
			'ip': user_ip,
			'role': chat['role'],
			'content': chat['content'],
		})

	return jsonify(formatted_chat_history)