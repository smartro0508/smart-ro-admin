import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';

const Header = ({ setIsMobileMenuOpen }) => {
  return (
    <header className="h-16 bg-card border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full border border-card"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 mx-1"></div>
        
        <button className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={18} />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-dark leading-none">Admin User</p>
            <p className="text-xs text-text-secondary mt-1">Super Admin</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
