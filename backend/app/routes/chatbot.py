from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.chatbot import ChatbotKeyword, ChatbotLog
from app.utils.llm import create_vector_db, create_rag_chain, create_follow_up_chain, generate_response, generate_follow_up_question
import traceback

chatbot_bp = Blueprint('chatbot', __name__, url_prefix='/chatbot')

# Initialize vector DB, RAG chain, and follow-up chain
def initialize_chatbot(chatbot_id):

    create_vector_db(chatbot_id)
    rag_chain = create_rag_chain(chatbot_id)
    follow_up_chain = create_follow_up_chain(rag_chain)
    response = generate_response(rag_chain, [])
    
    return rag_chain, follow_up_chain
    # try:
    #     create_vector_db(chatbot_id)
    #     rag_chain = create_rag_chain(chatbot_id)
    #     follow_up_chain = create_follow_up_chain(rag_chain)
        
    #     return rag_chain, follow_up_chain
    # except Exception as e:
    #     traceback.print_exc()
    #     print(f"Error initializing chatbot: {e}")
    #     return None, None

@chatbot_bp.route('/', methods=['GET'])
@jwt_required()
def chatbot_home():
    user_id = get_jwt_identity()
    # chatbot_id = request.args.get('chatbotID')
    chatbot_id = user_id

    # Get request and response logs
    logs = ChatbotLog.get_logs(chatbot_id, request.remote_addr)

    # Initialize chatbot components
    rag_chain, follow_up_chain = initialize_chatbot(chatbot_id)

    def generate():
        complete_response = []
        for response in generate_response(rag_chain, "", []):
            complete_response.append(response)
            yield response

    full_response = "".join(complete_response)

    generate()
    # Get keywords
    keywords = ChatbotKeyword.get_keywords(chatbot_id)

    # Get request and response logs
    logs = ChatbotLog.get_logs(chatbot_id, request.remote_addr)

    return jsonify({
        'keywords': keywords,
        'logs': logs
    }), 200

@chatbot_bp.route('/message', methods=['POST'])
# @jwt_required()
def chatbot_message():
    data = request.get_json()
    chatbot_id = data.get('chatbotID')
    user_message = data.get('message')
    user_ip = request.remote_addr

    if not chatbot_id or not user_message:
        return jsonify({'msg': 'Invalid request'}), 400

    # Initialize chatbot components
    rag_chain, follow_up_chain = initialize_chatbot(chatbot_id)

    # Generate response
    response_chunks = list(generate_response(rag_chain, user_message))
    response_message = ''.join(response_chunks)

    # Generate follow-up questions
    follow_up_questions = generate_follow_up_question(follow_up_chain, user_message)

    # Save log
    ChatbotLog.create_log(chatbot_id, user_ip, user_message, response_message)

    return jsonify({
        'response': response_message,
        'follow_up_questions': follow_up_questions
    }), 200
