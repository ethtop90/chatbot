# app/__init__.py
from flask import Flask
from pymongo import MongoClient
from flask_jwt_extended import JWTManager
from datetime import timedelta
from flask_cors import CORS

app = Flask(__name__)
app.config.from_object('app.config')
app.config["JWT_SECRET_KEY"] = "your_jwt_secret_key"
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=1)  # Set the token to expire in 1 day


client = MongoClient(app.config['MONGO_URI'])
db = client[app.config['MONGO_DBNAME']]

jwt = JWTManager(app)
CORS(app, resources={r"/auth/*": {"origins": "*"}})
CORS(app, resources={r"/learningData/*": {"origins": "*"}})
CORS(app, resources={r"/learningLogs/*": {"origins": "*"}})


from app.routes import *

app.register_blueprint(auth_bp)
app.register_blueprint(learningData_bp)
app.register_blueprint(learningLog_bp)
