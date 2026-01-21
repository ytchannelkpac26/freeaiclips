
export interface VideoSegment {
  id: string;
  startTime: number;
  endTime: number;
  title: string;
  description: string;
  viralScore: number;
  captions: Caption[];
}

export interface Caption {
  text: string;
  start: number;
  end: number;
}

export interface ProcessedVideo {
  id: string;
  url: string;
  name: string;
  duration: number;
  clips: VideoSegment[];
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}
