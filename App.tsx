
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import VideoUploader from './components/VideoUploader';
import ClipPreview from './components/ClipPreview';
import { AppStatus, ProcessedVideo, VideoSegment } from './types';
import { analyzeVideoContent } from './services/geminiService';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [processedVideo, setProcessedVideo] = useState<ProcessedVideo | null>(null);
  const [activeClipIndex, setActiveClipIndex] = useState(0);

  const extractFrames = async (file: File): Promise<string[]> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.load();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const frames: string[] = [];
        const capturePoints = [0.1, 0.3, 0.5, 0.7, 0.9]; // Capture 5 points in video

        const captureFrame = (index: number) => {
          if (index >= capturePoints.length) {
            resolve(frames);
            return;
          }

          video.currentTime = video.duration * capturePoints[index];
          video.onseeked = () => {
            canvas.width = video.videoWidth / 4; // Scale down for API speed
            canvas.height = video.videoHeight / 4;
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            frames.push(canvas.toDataURL('image/jpeg', 0.5));
            captureFrame(index + 1);
          };
        };

        captureFrame(0);
      };
    });
  };

  const handleUpload = async (file: File) => {
    try {
      setStatus(AppStatus.PROCESSING);
      setError(null);
      
      const frames = await extractFrames(file);
      const clips = await analyzeVideoContent(file.name, frames);
      
      setProcessedVideo({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        name: file.name,
        duration: 0, // Metadata will fill this
        clips: clips
      });
      
      setStatus(AppStatus.READY);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the video.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleYoutubeUrl = (url: string) => {
    alert("YouTube URL processing requires a backend proxy to bypass CORS. For this demo, please upload a local video file instead! This tool is 100% free.");
  };

  const activeClip = processedVideo?.clips[activeClipIndex];

  return (
    <div className="min-h-screen pb-20 pt-24 px-4 bg-slate-950 text-slate-100 selection:bg-pink-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto">
        {status === AppStatus.IDLE && (
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">100% Free Forever • No Credit Card Required</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-outfit font-black text-white mb-6 tracking-tight">
              Turn Long Videos Into <br/>
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-transparent bg-clip-text">Viral Short Clips</span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Our AI analyzes your long-form content, identifies high-engagement moments, 
              crops them for 9:16, and generates high-impact captions. Completely free.
            </p>
            <VideoUploader onUpload={handleUpload} onYoutubeUrl={handleYoutubeUrl} isProcessing={false} />
            
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              {[
                { title: 'AI Clipping', desc: 'Auto-detects high-energy and emotional peaks in your videos for free.' },
                { title: 'Unlimited Use', desc: 'No daily limits or watermarks. Process as many videos as you want.' },
                { title: 'Auto Captions', desc: 'Generates stylish, synchronized captions using cutting-edge AI at zero cost.' }
              ].map((feature, i) => (
                <div key={i} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
                  <div className="w-10 h-10 bg-pink-500/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-4 h-4 bg-pink-500 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === AppStatus.PROCESSING && (
          <div className="mt-24 text-center">
            <div className="relative inline-block">
              <div className="w-24 h-24 border-4 border-slate-800 border-t-pink-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-pink-500 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>
            <h2 className="mt-8 text-2xl font-bold font-outfit text-white">Analyzing Viral Potential...</h2>
            <p className="mt-2 text-slate-400">Our free AI is scanning your video for the best moments.</p>
            <div className="mt-8 max-w-md mx-auto bg-slate-900 h-2 rounded-full overflow-hidden">
               <div className="bg-pink-500 h-full animate-[progress_3s_ease-in-out_infinite]" style={{width: '60%'}}></div>
            </div>
            <style>{`
              @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(200%); }
              }
            `}</style>
          </div>
        )}

        {status === AppStatus.READY && processedVideo && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Clips Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-outfit font-bold text-white">Viral Suggestions</h2>
                <span className="text-xs font-bold px-2 py-1 bg-green-500/20 text-green-400 rounded-full">
                  FREE ANALYSIS COMPLETE
                </span>
              </div>
              
              <div className="space-y-4">
                {processedVideo.clips.map((clip, index) => (
                  <button
                    key={clip.id}
                    onClick={() => setActiveClipIndex(index)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 ${
                      activeClipIndex === index 
                        ? 'bg-slate-800 border-pink-500 shadow-lg' 
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-100 line-clamp-1">{clip.title}</h3>
                      <span className="text-[10px] font-black px-2 py-1 bg-pink-600 rounded text-white italic">
                        SCORE: {clip.viralScore}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">{clip.description}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <span>{Math.floor(clip.startTime)}s - {Math.floor(clip.endTime)}s</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span>{Math.floor(clip.endTime - clip.startTime)}s duration</span>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setStatus(AppStatus.IDLE)}
                className="w-full py-4 border border-slate-700 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all font-bold flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Upload New Video
              </button>
            </div>

            {/* Middle: Preview Player */}
            <div className="lg:col-span-5 flex flex-col items-center">
              {activeClip && (
                <ClipPreview segment={activeClip} videoUrl={processedVideo.url} />
              )}
            </div>

            {/* Right: Actions / Settings */}
            <div className="lg:col-span-3 space-y-8">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Customize Clip
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Caption Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="py-2 bg-pink-600 text-[10px] font-bold rounded-lg text-white">ALEX HORMOZI</button>
                      <button className="py-2 bg-slate-800 text-[10px] font-bold rounded-lg text-slate-400 hover:text-white">MINIMALIST</button>
                      <button className="py-2 bg-slate-800 text-[10px] font-bold rounded-lg text-slate-400 hover:text-white">BEAST MODE</button>
                      <button className="py-2 bg-slate-800 text-[10px] font-bold rounded-lg text-slate-400 hover:text-white">RETRO</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-500 uppercase mb-2">Background Music</label>
                    <div className="p-3 bg-slate-800 rounded-xl flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V7.82l8-1.6V11.114A4.369 4.369 0 0015 11c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3V3z" />
                          </svg>
                       </div>
                       <span className="text-xs font-medium text-slate-300">Dramatic Tension #4</span>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-3">
                  <button className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-2xl shadow-[0_4px_20px_rgba(219,39,119,0.4)] transition-all transform hover:-translate-y-1">
                    Free Export
                  </button>
                  <button className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all">
                    Free Download
                  </button>
                </div>
              </div>

              <div className="p-6 border border-slate-800 rounded-3xl">
                 <h4 className="text-sm font-bold text-slate-300 mb-2 italic">Pro Tip:</h4>
                 <p className="text-xs text-slate-500 leading-relaxed">
                   This tool is built to empower creators. Enjoy the <span className="text-pink-400 font-bold">full pro experience</span> with zero subscription fees.
                 </p>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="mt-12 max-w-lg mx-auto p-8 bg-red-900/20 border border-red-900/50 rounded-3xl text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-xl font-bold text-white mb-2">Oops! Something went wrong</h3>
            <p className="text-red-300 mb-6">{error}</p>
            <button 
              onClick={() => setStatus(AppStatus.IDLE)}
              className="bg-white text-black font-bold px-8 py-3 rounded-xl hover:bg-slate-200 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/60 backdrop-blur border-t border-slate-900 p-4 text-center">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
          100% Free Open Tool • Powered by Gemini 3 Flash &copy; 2025 ClipViral.ai
        </p>
      </footer>
    </div>
  );
};

export default App;
