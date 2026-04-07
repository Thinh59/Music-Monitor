import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings

# Khởi tạo Firebase Admin SDK
try:
    firebase_admin.get_app()
except ValueError:
    cred = credentials.Certificate(settings.firebase_cert_path)
    firebase_admin.initialize_app(cred)

# Khởi tạo Firestore Client
db = firestore.client()

def get_db():
    return db