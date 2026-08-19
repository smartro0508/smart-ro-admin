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
          "group relative flex items-center justify-between px-3.5 py-3 mb-1.5 rounded-2xl transition-all duration-300 text-[13.5px] font-semibold overflow-hidden",
          isActive
            ? "text-blue-700 bg-white/60 border border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.03)] backdrop-blur-md"
            : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
          )}

          <div className="flex items-center gap-3.5 z-10 pl-1">
            <div className={cn(
              "flex items-center justify-center transition-all duration-300",
              isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-500"
            )}>
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="tracking-wide">{label}</span>
          </div>

          {isActive && <ChevronRight size={14} className="text-blue-400 z-10" />}
        </>
      )}
    </NavLink>
  );
};

const NavGroup = ({ title, children }) => (
  <div className="mb-6">
    <div className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-3">
      <span>{title}</span>
      <div className="h-px bg-slate-200/60 flex-1"></div>
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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-gradient-to-br from-blue-50/95 via-white/95 to-indigo-50/95 backdrop-blur-2xl border-r border-indigo-100/50 transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) lg:translate-x-0 lg:static lg:inset-auto flex flex-col h-full shadow-[4px_0_24px_rgba(0,0,0,0.04)]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-400/10 rounded-full blur-[40px] pointer-events-none"></div>

        {/* Header/Logo area */}
        <div className="relative flex items-center justify-center h-28 px-6 shrink-0 bg-transparent z-10 border-b border-indigo-100/40">
          <div className="w-44 h-auto drop-shadow-sm transition-transform hover:scale-105 duration-300 flex items-center justify-center">
            <img src="/app-logo.png" alt="AURO Logo" className="w-full h-full object-contain" />
          </div>

          <button onClick={closeMenu} className="absolute right-4 lg:hidden text-slate-400 hover:text-slate-700 transition-colors bg-white/50 p-2 rounded-xl border border-slate-200">
            <X size={16} />
          </button>
        </div>

        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto pb-6 scrollbar-hide relative z-10 mt-2">
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
        <div className="p-5 shrink-0 relative z-10 border-t border-indigo-100/40 bg-white/20 backdrop-blur-md">
          <button onClick={onLogout} className="flex items-center justify-between px-4 py-3.5 w-full rounded-2xl text-[13.5px] font-bold text-slate-500 hover:bg-white hover:text-rose-600 border border-transparent hover:border-rose-100 hover:shadow-sm transition-all group">
            <div className="flex items-center gap-3">
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
