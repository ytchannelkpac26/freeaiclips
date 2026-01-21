
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-pink-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">
            C
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-outfit font-black tracking-tighter text-white leading-none">CLIPVIRAL<span className="text-pink-500 font-normal">.AI</span></span>
            <span className="text-[10px] font-bold text-green-500 tracking-widest uppercase">100% Free</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it works</a>
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">GitHub</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-slate-200 transition-colors shadow-lg">Start Clipping</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
