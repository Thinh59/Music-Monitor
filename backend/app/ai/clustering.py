import numpy as np
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import pandas as pd
from sklearn.metrics import silhouette_score

GENRE_LIST = [
    "pop", "hip-hop", "k-pop", "rock", "electronic", "indie",
    "r&b", "latin", "jazz", "classical", "metal", "country",
    "reggae", "folk", "dance", "alternative"
]

def build_country_vectors(country_tags: dict[str, list[str]]) -> pd.DataFrame:
    """
    Xây dựng vector đặc trưng cho mỗi quốc gia từ genre tags.
    country_tags: {"vietnam": ["pop", "k-pop", ...], "japan": [...], ...}
    """
    rows = []
    for country, tags in country_tags.items():
        vec = {genre: 0 for genre in GENRE_LIST}
        for tag in tags:
            if tag in vec:
                vec[tag] += 1
        rows.append({"country": country, **vec})
    return pd.DataFrame(rows)

def cluster_countries(df: pd.DataFrame, n_clusters: int = 5) -> pd.DataFrame:
    """K-Means clustering các quốc gia theo gu âm nhạc."""
    feature_cols = [c for c in df.columns if c != "country"]
    X = df[feature_cols].values
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df["cluster"] = kmeans.fit_predict(X)

    if len(df) > n_clusters:
        df.attrs["silhouette"] = round(float(silhouette_score(X, df["cluster"])), 4)
    else:
        df.attrs["silhouette"] = 0.0
    # PCA để giảm chiều cho visualization
    pca = PCA(n_components=2)
    coords = pca.fit_transform(X)
    df["pca_x"] = coords[:, 0]
    df["pca_y"] = coords[:, 1]
    
    return df

def get_cluster_label(cluster_id: int, df: pd.DataFrame) -> str:
    """Tự động đặt tên cho cluster dựa trên genre nổi bật nhất."""
    cluster_data = df[df["cluster"] == cluster_id]
    feature_cols = [c for c in df.columns if c in GENRE_LIST]
    genre_means = cluster_data[feature_cols].mean()
    top_genre = genre_means.idxmax()
    return f"{top_genre.upper()}-dominant"

def elbow_method(df: pd.DataFrame, max_k: int = 10) -> list[dict]:
    """Tính inertia cho k=2..max_k để vẽ Elbow chart."""
    feature_cols = [c for c in df.columns if c != "country"]
    X = df[feature_cols].values
    results = []
    for k in range(2, max_k + 1):
        km  = KMeans(n_clusters=k, random_state=42, n_init=10)
        km.fit(X)
        sil = silhouette_score(X, km.labels_) if len(df) > k else 0
        results.append({"k": k, "inertia": km.inertia_, "silhouette": round(sil, 4)})
    return results