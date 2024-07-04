import os

MONGO_URI = 'mongodb://localhost:27017/'
MONGO_DBNAME = 'PERVA_chatbot'

# Construct the UPLOAD_PATH to refer to a sibling directory named 'uploads'
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_PATH = os.path.join(BASE_DIR, 'uploads') # backend/uploads