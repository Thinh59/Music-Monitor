from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

def analyze_posts_sentiment(posts: list[dict]) -> dict:
    """
    Phân tích sentiment của Reddit posts về một bài hát.
    Trả về compound score trung bình (-1 đến 1).
    """
    if not posts:
        return {"compound": 0, "positive_pct": 0, "negative_pct": 0, "total": 0}
    
    scores = []
    positive = 0
    negative = 0
    
    for post in posts:
        text = post.get("title", "")
        score = analyzer.polarity_scores(text)
        scores.append(score["compound"])
        if score["compound"] > 0.05:
            positive += 1
        elif score["compound"] < -0.05:
            negative += 1
    
    total = len(scores)
    return {
        "compound": round(sum(scores) / total, 3),
        "positive_pct": round(positive / total * 100, 1),
        "negative_pct": round(negative / total * 100, 1),
        "total": total
    }