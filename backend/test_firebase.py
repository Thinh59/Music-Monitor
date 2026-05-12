import firebase_admin
from firebase_admin import credentials, firestore
import os

# Đường dẫn tới file cert
cert_path = "d:/NA/Kì 6/Phân Tích Dữ Liệu Thông Minh/Project/global_music_monitor/backend/firebase-cert.json"

if not os.path.exists(cert_path):
    print(f"ERROR: File not found at {cert_path}")
else:
    try:
        cred = credentials.Certificate(cert_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        
        print("Attempting to write to Firestore...")
        db.collection("test_connection").document("status").set({
            "message": "Hello from Antigravity!",
            "success": True
        })
        print("✅ Write successful! Check Firebase console for 'test_connection' collection.")
    except Exception as e:
        print(f"❌ Error: {e}")
