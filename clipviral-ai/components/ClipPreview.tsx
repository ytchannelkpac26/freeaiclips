
import React, { useRef, useState, useEffect } from 'react';
import { VideoSegment } from '../types';

interface ClipPreviewProps {
  segment: VideoSegment;
  videoUrl: string;
}

const ClipPreview: React.FC<ClipPreviewProps> = ({ segment, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeCaption, setActiveCaption] = useState<string>('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      
      const caption = segment.captions.find(c => time >= c.start && time <= c.end);
      setActiveCaption(caption ? caption.text : '');
      
      // Loop within segment
      if (time >= segment.endTime) {
        video.currentTime = segment.startTime;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [segment]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = segment.startTime;
      videoRef.current.play().catch(() => {});
    }
  }, [segment]);

  return (
    <div className="relative group rounded-3xl overflow-hidden bg-black shadow-2xl flex items-center justify-center aspect-[9/16] max-w-[320px] mx-auto border-4 border-slate-800">
      <video 
        ref={videoRef}
        src={videoUrl}
        className="h-full w-full object-cover"
        muted
        playsInline
      />
      
      {/* Overlay Captions */}
      <div className="absolute bottom-24 left-0 w-full px-4 flex flex-col items-center pointer-events-none">
        {activeCaption && (
          <div className="bg-yellow-400 text-black px-4 py-2 font-black italic uppercase text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
            {activeCaption}
          </div>
        )}
      </div>

      {/* Stats UI */}
      <div className="absolute top-4 right-4 flex flex-col gap-4 text-white">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-slate-900/50 backdrop-blur rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[10px] font-bold mt-1">14.2K</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-slate-900/50 backdrop-blur rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[10px] font-bold mt-1">1.1K</span>
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4">
        <p className="text-white text-xs font-semibold drop-shadow-md">@viral_creator</p>
        <p className="text-white text-[10px] opacity-80 mt-1 line-clamp-2">{segment.description}</p>
      </div>
    </div>
  );
};

export default ClipPreview;
