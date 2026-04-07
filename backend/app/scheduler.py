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
        
        # Ghi đè document 'global_top' trong collection 'cache'
        db.collection('cache').document('global_top').set({
            'updated_at': datetime.datetime.now(datetime.timezone.utc),
            'tracks': tracks
        })
        print(f"[Scheduler] Đã cache {len(tracks)} bài hát vào Firestore.")
    except Exception as e:
        print(f"[Scheduler] Lỗi khi cập nhật Last.fm: {e}")

def start_scheduler():
    # Quét mỗi 6 tiếng để tối ưu quota Firebase và API (tránh rate limit)
    scheduler.add_job(poll_lastfm_charts, IntervalTrigger(hours=6))
    scheduler.start()
    print("[Scheduler] Started background jobs")