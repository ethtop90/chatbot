# app/routes/__init__.py
from .auth import bp as auth_bp
from .learningData import bp as learningData_bp
from .learningLog import learningLog_bp
from .chatbot import chatbot_bp
from .user import user_bp