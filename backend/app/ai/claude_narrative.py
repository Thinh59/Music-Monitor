import google.generativeai as genai
from app.config import settings

async def generate_daily_briefing(top_tracks, trending, predicted_hits, regions):
    # Cấu hình API Key từ file config
    genai.configure(api_key=settings.gemini_api_key)
    
    # SỬA TÊN MODEL TẠI ĐÂY:
    # Sử dụng 'gemini-3-flash' (phiên bản mới nhất của mình)
    model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')
    
    prompt = f"""
    Bạn là một chuyên gia phân tích âm nhạc cao cấp. 
    Hãy viết một bản tin ngắn gọn, súc tích và chuyên nghiệp về thị trường âm nhạc hôm nay dựa trên các dữ liệu sau:
    - Top Tracks: {top_tracks}
    - Đang Trending: {trending}
    - Dự báo Hits: {predicted_hits}
    
    Yêu cầu: Viết bằng tiếng Việt, phân tích sâu sắc về sự thay đổi thứ hạng và các bài hát tiềm năng.
    """
    
    # Sử dụng generate_content_async để không làm treo server
    response = await model.generate_content_async(prompt)
    return response.text
# --- THÊM HÀM NÀY VÀO CUỐI FILE ĐỂ DÙNG CHO MAP ---
async def analyze_country_insight(prompt: str):
    """
    Hàm phân tích insight văn hóa âm nhạc từng quốc gia cho trang World Map.
    """
    genai.configure(api_key=settings.gemini_api_key)
    model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        print(f"⚠️ Lỗi AI Insight: {e}")
        return "⚠️ Lỗi: AI đang quá tải hoặc gặp sự cố kết nối, vui lòng thử lại sau."
