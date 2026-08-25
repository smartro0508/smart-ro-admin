import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';

const Header = ({ setIsMobileMenuOpen }) => {
  return (
    <header className="h-[72px] bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-8 shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.01)] relative z-40">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl transition-colors"
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-3 hover:bg-slate-50 p-2 pr-4 rounded-xl border border-transparent hover:border-slate-100 transition-all">
          <div className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <User size={18} strokeWidth={2.5} />
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-[13px] font-bold text-slate-800 leading-none mb-1">Administrator</span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-none">Smart RO Admin</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
