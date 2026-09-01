import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  RotateCcw,
  Package,
  PlusSquare,
  Users,
  Mail,
  Star,
  ShoppingCart,
  Wallet,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  X,
  ChevronRight,
  Image,
  Wrench
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const NavItem = ({ to, icon: Icon, label, onClick }) => {
  return (
    <NavLink
      to={to}
      end
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center justify-between px-4 py-3 mb-1.5 rounded-2xl transition-all duration-300 text-[13.5px] font-medium overflow-hidden border border-transparent",
          isActive
            ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.3)] border-blue-500/30"
            : "text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-700/50 hover:shadow-lg"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-2 bottom-2 w-1 bg-white/50 rounded-r-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          )}

          <div className="flex items-center gap-3.5 z-10 pl-1 transition-transform duration-300 group-hover:translate-x-1">
            <div className={cn(
              "flex items-center justify-center transition-all duration-300 p-1.5 rounded-xl",
              isActive ? "text-white bg-white/10" : "text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-500/10"
            )}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="tracking-wide">{label}</span>
          </div>

          {isActive && <ChevronRight size={14} className="text-white/60 z-10 transition-transform duration-300 translate-x-0" />}
          {!isActive && <ChevronRight size={14} className="text-slate-600 z-10 transition-transform duration-300 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0" />}
        </>
      )}
    </NavLink>
  );
};

const NavGroup = ({ title, children }) => (
  <div className="mb-7">
    <div className="px-4 text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-400 to-slate-600 uppercase tracking-widest mb-3 flex items-center gap-3">
      <span>{title}</span>
      <div className="h-px bg-gradient-to-r from-slate-800 to-transparent flex-1"></div>
    </div>
    <div className="space-y-0.5 px-3">
      {children}
    </div>
  </div>
);

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen, onLogout }) => {
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 lg:hidden transition-opacity duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[270px] shrink-0 bg-[#0B1120]/95 backdrop-blur-xl border-r border-slate-800/60 transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:translate-x-0 lg:static flex flex-col h-full shadow-[4px_0_30px_rgba(0,0,0,0.3)]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-48 bg-rose-500/5 rounded-t-full blur-[50px] pointer-events-none"></div>

        {/* Header/Logo area */}
        <div className="relative flex items-center justify-center h-28 px-6 shrink-0 bg-transparent z-10 border-b border-slate-800/50">
          <div className="w-44 h-auto drop-shadow-lg transition-transform hover:scale-105 duration-300 flex items-center justify-center bg-white/90 p-4 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <img src="/app-logo.png" alt="AURO Logo" className="w-full h-full object-contain" />
          </div>

          <button onClick={closeMenu} className="absolute right-4 lg:hidden text-slate-400 hover:text-white transition-colors bg-slate-800/80 p-2 rounded-xl border border-slate-700/80 hover:bg-slate-700 backdrop-blur-sm">
            <X size={16} />
          </button>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide relative z-10 mt-4 custom-scrollbar">
          <div className="px-3 mb-8">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard Overview" onClick={closeMenu} />
          </div>

          <NavGroup title="Billing & Sales">
            <NavItem to="/billing/new" icon={Receipt} label="Create Invoice" onClick={closeMenu} />
            <NavItem to="/billing/list" icon={FileText} label="Invoices List" onClick={closeMenu} />
          </NavGroup>

          <NavGroup title="Products & Stock">
            <NavItem to="/products" icon={Package} label="All Products" onClick={closeMenu} />
            <NavItem to="/products/new" icon={PlusSquare} label="Add Product" onClick={closeMenu} />
          </NavGroup>

          <NavGroup title="Services">
            <NavItem to="/services" icon={Wrench} label="All Services" onClick={closeMenu} />
            <NavItem to="/services/new" icon={PlusSquare} label="Add Service" onClick={closeMenu} />
          </NavGroup>

          <NavGroup title="Directory">
            <NavItem to="/customers" icon={Users} label="Customers" onClick={closeMenu} />
            <NavItem to="/contact" icon={Mail} label="Contact Us" onClick={closeMenu} />
            <NavItem to="/testimonials" icon={Star} label="Testimonials" onClick={closeMenu} />
            <NavItem to="/gallery" icon={Image} label="Gallery" onClick={closeMenu} />
          </NavGroup>

          <NavGroup title="Operations">
            <NavItem to="/purchases" icon={ShoppingCart} label="Purchases" onClick={closeMenu} />
            <NavItem to="/expenses" icon={Wallet} label="Expenses" onClick={closeMenu} />
          </NavGroup>

          <NavGroup title="Administration">
            <NavItem to="/reports" icon={BarChart3} label="Analytics Reports" onClick={closeMenu} />
            <NavItem to="/users" icon={UserCog} label="Team Members" onClick={closeMenu} />
            <NavItem to="/settings" icon={Settings} label="System Settings" onClick={closeMenu} />
          </NavGroup>
        </div>

        {/* Footer Area */}
        <div className="p-5 shrink-0 relative z-10 border-t border-slate-800/50 bg-[#0B1120]/80 backdrop-blur-md">
          <button onClick={onLogout} className="flex items-center justify-between px-4 py-3.5 w-full rounded-2xl text-[13.5px] font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 shadow-none hover:shadow-[0_0_15px_rgba(244,63,94,0.1)] transition-all group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/5 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />
            <div className="flex items-center gap-3 relative z-10">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
