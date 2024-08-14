# app/__init__.py
from flask import Flask
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_cors import CORS

app = Flask(__name__, static_folder='../../frontend/dist', static_url_path='/')
app.config.from_object('app.config')
app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)  # Set the token to expire in 1 day

@app.errorhandler(404)
def not_found(e):
  return app.send_static_file('index.html')


client = MongoClient(app.config['MONGO_URI'])
db = client[app.config['MONGO_DBNAME']]

jwt = JWTManager(app)
CORS(app, resources={r"/auth/*": {"origins": "*"}})
CORS(app, resources={r"/learningData/*": {"origins": "*"}})
CORS(app, resources={r"/learningLogs/*": {"origins": "*"}})
CORS(app, resources={r"/chatbot/*": {"origins": "*"}})
CORS(app, resources={r"/users/*": {"origins": "*"}})
CORS(app, resources={r"/chatLog/*": {"origins": "*"}})

from app.routes import *

app.register_blueprint(auth_bp)
app.register_blueprint(learningData_bp)
app.register_blueprint(learningLog_bp)
app.register_blueprint(chatbot_bp)
app.register_blueprint(user_bp)
app.register_blueprint(chatlog_bp)
