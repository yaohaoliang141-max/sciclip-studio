export interface ScriptSegment {
  id: string;
  text: string;
  keyword: string;
  startTime?: number;
  endTime?: number;
}

export interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  url: string;
  duration: number;
  user: {
    name: string;
    url: string;
  };
  video_files: {
    id: number;
    quality: string;
    file_type: string;
    width: number;
    height: number;
    fps: number;
    link: string;
  }[];
  video_pictures: {
    id: number;
    picture: string;
    nr: number;
  }[];
}

export interface SegmentWithVideos {
  segment: ScriptSegment;
  videos: PexelsVideo[];
  selectedVideoId: number | null;
  isLoading: boolean;
}

export interface AnalyzeResponse {
  segments: ScriptSegment[];
}

export interface SearchResponse {
  videos: PexelsVideo[];
}
