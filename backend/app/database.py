import firebase_admin
from firebase_admin import credentials, firestore
from app.config import settings
import datetime

# ── In-memory fallback khi Firebase không khả dụng ──────────────
class _MemDoc:
    """Mock Firestore document."""
    def __init__(self, data=None):
        self._data = data or {}
        self._subs: dict[str, "_MemCollection"] = {}

    # read
    def get(self):
        return self

    def to_dict(self):
        return self._data if self._data else None

    @property
    def exists(self):
        return bool(self._data)

    # write
    def set(self, data, merge=False):
        if merge:
            self._data.update(data)
        else:
            self._data = dict(data)

    def update(self, data):
        self._data.update(data)

    def delete(self):
        self._data = {}

    # sub-collection
    def collection(self, name):
        if name not in self._subs:
            self._subs[name] = _MemCollection()
        return self._subs[name]


class _MemCollection:
    """Mock Firestore collection."""
    def __init__(self):
        self._docs: dict[str, _MemDoc] = {}
        self._counter = 0

    def document(self, doc_id=None):
        if doc_id is None:
            doc_id = f"auto_{self._counter}"
            self._counter += 1
        if doc_id not in self._docs:
            self._docs[doc_id] = _MemDoc()
        return self._docs[doc_id]

    def add(self, data):
        doc_id = f"auto_{self._counter}"
        self._counter += 1
        self._docs[doc_id] = _MemDoc(dict(data))
        return None, self._docs[doc_id]

    def stream(self):
        for doc_id, doc in self._docs.items():
            doc.id = doc_id
            yield doc

    def where(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def limit(self, *_args):
        return self


class _MemDB:
    """Mock Firestore client."""
    def __init__(self):
        self._cols: dict[str, _MemCollection] = {}
        print("⚠️  Firebase không khả dụng — dùng in-memory storage (demo mode)")

    def collection(self, name):
        if name not in self._cols:
            self._cols[name] = _MemCollection()
        return self._cols[name]


# ── Khởi tạo Firebase Admin SDK (graceful fallback) ────────────
db = None
try:
    try:
        firebase_admin.get_app()
    except ValueError:
        cred = credentials.Certificate(settings.firebase_cert_path)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    # Quick connectivity check
    db.collection("_ping").document("_ping").set({"t": datetime.datetime.now(datetime.timezone.utc)})
    db.collection("_ping").document("_ping").delete()
    print("✅ Firebase Firestore connected")
except Exception as e:
    print(f"⚠️  Firebase init failed: {e}")
    db = _MemDB()


def get_db():
    return db