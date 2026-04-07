import numpy as np
from sklearn.ensemble import IsolationForest
from scipy import stats

def detect_view_spike_zscore(view_history: list[int], threshold: float = 2.5) -> dict:
    """
    Phát hiện spike bất thường trong YouTube views bằng Z-score.
    view_history: danh sách view count theo thời gian (mới nhất ở cuối)
    """
    if len(view_history) < 5:
        return {"is_spike": False, "z_score": 0}
    
    arr = np.array(view_history)
    growth = np.diff(arr)   # Tốc độ tăng
    z_scores = np.abs(stats.zscore(growth))
    latest_z = float(z_scores[-1]) if len(z_scores) > 0 else 0
    
    return {
        "is_spike": latest_z > threshold,
        "z_score": round(latest_z, 3),
        "growth_rate": int(growth[-1]) if len(growth) > 0 else 0,
        "avg_growth": float(np.mean(growth)),
        "threshold": threshold
    }

def detect_anomalies_isolation_forest(features: list[list[float]]) -> list[int]:
    """
    Isolation Forest cho nhiều bài hát cùng lúc.
    features: [[youtube_growth, reddit_mentions, ...], ...]
    Returns: list -1 (anomaly/trending) hoặc 1 (normal)
    """
    if len(features) < 10:
        return [1] * len(features)
    
    clf = IsolationForest(contamination=0.1, random_state=42)
    predictions = clf.fit_predict(features)
    return predictions.tolist()

def calculate_viral_score(youtube_growth_pct: float, reddit_mentions: int,
                          youtube_comments: int) -> float:
    """Tính điểm viral tổng hợp (0-100)."""
    # Trọng số: YouTube 50%, Reddit 30%, Comments 20%
    yt_score = min(youtube_growth_pct / 500 * 50, 50)
    reddit_score = min(reddit_mentions / 100 * 30, 30)
    comment_score = min(youtube_comments / 50000 * 20, 20)
    return round(yt_score + reddit_score + comment_score, 1)