
import React, { useState, useRef } from 'react';

interface VideoUploaderProps {
  onUpload: (file: File) => void;
  onYoutubeUrl: (url: string) => void;
  isProcessing: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onUpload, onYoutubeUrl, isProcessing }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  const handleYoutubeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (youtubeUrl.trim()) onYoutubeUrl(youtubeUrl);
  };

  return (
    <div className="max-w-2xl mx-auto w-full bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-outfit font-bold text-white mb-2">Import Your Video</h2>
        <p className="text-slate-400">Upload a file or paste a YouTube link to get started.</p>
      </div>

      <div className="space-y-6">
        {/* File Drop Area */}
        <div 
          onClick={() => !isProcessing && fileInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed border-slate-600 hover:border-pink-500 rounded-2xl p-10 transition-all duration-300 text-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="video/*"
          />
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-slate-700 group-hover:bg-pink-500/20 rounded-full flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300 group-hover:text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg font-medium text-slate-200">Drop your video here</p>
            <p className="text-sm text-slate-500">Supports MP4, MOV, WebM up to 500MB</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-500 font-medium text-sm">OR</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* Youtube Link */}
        <form onSubmit={handleYoutubeSubmit} className="flex gap-3">
          <input 
            type="text" 
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste YouTube video URL"
            disabled={isProcessing}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={isProcessing || !youtubeUrl}
            className="bg-pink-600 hover:bg-pink-500 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <span>Process</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUploader;
