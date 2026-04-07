import numpy as np
import xgboost as xgb
import joblib
import os
from datetime import datetime

MODEL_PATH = "models/hit_predictor.joblib"

def build_features(track_data: dict) -> np.ndarray:
    """
    Xây dựng vector features cho mô hình dự đoán.
    Không dùng Spotify audio features (đã bị xóa).
    """
    features = [
        track_data.get("youtube_growth_24h", 0),      # % tăng view 24h
        track_data.get("youtube_growth_48h", 0),      # % tăng view 48h
        track_data.get("youtube_growth_7d", 0),       # % tăng view 7 ngày
        track_data.get("reddit_mentions_24h", 0),     # Số mentions Reddit 24h
        track_data.get("youtube_comments", 0),        # Tổng comments
        track_data.get("lastfm_playcount", 0),        # Playcount Last.fm
        track_data.get("lastfm_listeners", 0),        # Listeners Last.fm
        track_data.get("genre_popularity", 0.5),      # Popularity của genre (0-1)
        track_data.get("artist_playcount", 0),        # Artist total playcount
        datetime.now().month,                          # Tháng (seasonality)
        1 if datetime.now().month in [11, 12, 1] else 0,  # Mùa lễ tết
    ]
    return np.array(features).reshape(1, -1)

def predict_hit_probability(track_data: dict) -> dict:
    """Dự đoán xác suất bài hát lọt top chart trong 7 ngày."""
    features = build_features(track_data)
    
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        prob = float(model.predict_proba(features)[0][1])
    else:
        # Heuristic fallback nếu chưa có model train
        growth = track_data.get("youtube_growth_24h", 0)
        mentions = track_data.get("reddit_mentions_24h", 0)
        prob = min((growth / 1000 * 0.6 + mentions / 200 * 0.4), 0.99)
    
    return {
        "hit_probability": round(prob * 100, 1),
        "prediction": "Potential Hit" if prob > 0.6 else "Watch" if prob > 0.3 else "Normal",
        "confidence": "High" if prob > 0.8 else "Medium" if prob > 0.5 else "Low"
    }

def train_model(X: np.ndarray, y: np.ndarray):
    """Train XGBoost model — chạy trên Kaggle."""
    model = xgb.XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="logloss",
        random_state=42
    )
    model.fit(X, y)
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    return model