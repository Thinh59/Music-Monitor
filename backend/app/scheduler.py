from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from app.services.lastfm import get_global_top_tracks
from app.database import get_db
import datetime

scheduler = AsyncIOScheduler()
db = get_db()

async def poll_lastfm_charts():
    """Cập nhật Last.fm charts và lưu vào Firestore (thay thế Redis)."""
    print("[Scheduler] Polling Last.fm global charts...")
    try:
        tracks = await get_global_top_tracks(limit=50)
        
        now = datetime.datetime.now(datetime.timezone.utc)
        # Ghi đè document 'global_top' trong collection 'cache'
        db.collection('cache').document('global_top').set({
            'updated_at': now,
            'tracks': tracks
        })
        
        # LƯU LỊCH SỬ ĐỂ VẼ TIME-SERIES
        db.collection('historical_charts').document('global_top').collection('history').add({
            'timestamp': now,
            'tracks': tracks
        })
        
        print(f"[Scheduler] Đã cache và lưu lịch sử {len(tracks)} bài hát vào Firestore.")
    except Exception as e:
        print(f"[Scheduler] Lỗi khi cập nhật Last.fm: {e}")

async def poll_youtube_stats():
    """Lấy stats YouTube của top tracks và lưu lịch sử."""
    print("[Scheduler] Polling YouTube stats...")
    from app.services.youtube import search_music_video, get_video_stats
    try:
        tracks = await get_global_top_tracks(limit=10)
        for track in tracks:
            query = f"{track['name']} {track['artist']} official".strip()
            yt_hits = await search_music_video(query)
            if yt_hits:
                video_id = yt_hits[0]["video_id"]
                stats = await get_video_stats(video_id)
                if stats:
                    doc_id = f"{track['name']}_{track['artist']}".replace("/", "_")[:80]
                    # Ghi đè thông tin cơ bản
                    db.collection("youtube_snapshots").document(doc_id).set({
                        "track_name": track['name'],
                        "artist": track['artist'],
                        "video_id": video_id,
                        "updated_at": datetime.datetime.now(datetime.timezone.utc)
                    }, merge=True)
                    
                    # Thêm vào collection history
                    db.collection("youtube_snapshots").document(doc_id).collection("history").add({
                        "timestamp": datetime.datetime.now(datetime.timezone.utc),
                        "view_count": stats.get("view_count", 0),
                        "like_count": stats.get("like_count", 0),
                        "comment_count": stats.get("comment_count", 0)
                    })
        print("[Scheduler] Đã lưu lịch sử YouTube cho Top 10 bài hát.")
    except Exception as e:
        print(f"[Scheduler] Lỗi cập nhật YouTube: {e}")

def start_scheduler():
    # Quét mỗi 6 tiếng để tối ưu quota Firebase và API (tránh rate limit)
    scheduler.add_job(poll_lastfm_charts, IntervalTrigger(hours=6))
    scheduler.add_job(poll_youtube_stats, IntervalTrigger(hours=6))
    scheduler.start()
    print("[Scheduler] Started background jobs (6 hours interval)")