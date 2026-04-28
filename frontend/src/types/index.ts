export interface Track {
  rank?: number;
  name: string;
  artist: string;
  playcount?: number;
  listeners?: number;
  source: string;
  source_url?: string;
  hit_probability?: number;
  prediction?: string;
  viral_score?: number;
}

export interface TrendPost {
  title: string;
  score: number;
  url: string;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  source: string;
  source_url: string;
}

export interface SentimentResult {
  compound: number;
  positive_pct: number;
  negative_pct: number;
  total: number;
}

export interface ClusterCountry {
  country: string;
  iso_code: string;
  cluster: number;
  cluster_label: string;
  pca_x: number;
  pca_y: number;
}

export interface BriefingSections {
  overview: string;
  top_charts: string;
  tiktok: string;
  community: string;
  forecast: string;
}

export interface DailyBriefing {
  briefing: string;
  briefing_sections?: BriefingSections;
  date: string;
  generated_at: string;
  sources: string[];
  source_urls: string[];
  top_tracks_used: Track[];
  tiktok_used?: Track[];
  reddit_sentiment?: SentimentResult;
  cached: boolean;
}

export interface HitPrediction {
  hit_probability: number;
  prediction: "Potential Hit" | "Watch" | "Normal";
  confidence: "High" | "Medium" | "Low";
  track?: string;
  artist?: string;
}

export interface YouTubeStats {
  video_id: string;
  title: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  published_at: string;
  growth_pct?: number;
  source: string;
  source_url: string;
  spike_detection?: {
    is_spike: boolean;
    z_score: number;
    growth_rate: number;
  };
}