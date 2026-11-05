import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, FolderTree, CalendarCheck,
  Image, Youtube, MessageSquare, Settings, LogOut, ExternalLink,
  Menu, X, Shield, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import VmdLogo from '../../components/shared/VmdLogo';

const adminNavLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/bookings', label: 'Bookings Roster', icon: CalendarCheck },
  { to: '/admin/products', label: 'Merchandise Products', icon: ShoppingBag },
  { to: '/admin/categories', label: 'Product Categories', icon: FolderTree },
  { to: '/admin/gallery', label: 'Photo Gallery', icon: Image },
  { to: '/admin/videos', label: 'YouTube Broadcasts', icon: Youtube },
  { to: '/admin/enquiries', label: 'Customer Inquiries', icon: MessageSquare },
  { to: '/admin/settings', label: 'Website Settings', icon: Settings },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row">

      {/* ─── Mobile Header ─── */}
      <header className="md:hidden bg-brand-black border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/admin" className="flex items-center gap-2">
          <VmdLogo className="h-8 w-auto" />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/5 text-gray-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* ─── Sidebar (Desktop & Mobile Drawer) ─── */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-50 w-64 bg-brand-black border-r border-white/10 flex flex-col justify-between transition-transform duration-300 h-screen overflow-y-auto ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <VmdLogo className="h-10 w-auto" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {adminNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sport uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-brand-lime text-black font-bold shadow-[0_0_15px_rgba(191,255,0,0.25)]'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with User and Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-brand-lime" />
              View Public Website
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          </Link>

          {/* User profile */}
          <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-brand-lime/20 border border-brand-lime/40 flex items-center justify-center text-brand-lime text-xs font-bold flex-shrink-0">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block truncate">{user?.name || 'VMD Admin'}</span>
                <span className="text-[10px] text-gray-500 block truncate">{user?.email || 'admin@vmdsports.com'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-gray-400 hover:text-rose-400 transition-colors ml-1"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Main Content Area ─── */}
      <main className="flex-1 bg-[#0a0a0a] min-h-screen p-4 sm:p-8 lg:p-10 overflow-x-hidden">
        <Outlet />
      </main>

    </div>
  );
}
