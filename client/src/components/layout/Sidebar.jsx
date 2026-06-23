import { useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  Sparkles,
  Calendar,
  PiggyBank,
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { fastTransition, sidebarVariants } from '../ui/motion';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: Wallet },
  { to: '/budget', label: 'Budget', icon: PiggyBank },
  { to: '/ai', label: 'AI Insights', icon: Sparkles, badge: 'Soon' },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
];

function UserDropdown({ onNavigate }) {
  const { user, theme, themeMode, toggleTheme, useAutoTheme, logout } = useApp();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const displayName = user?.name || user?.username;

  return (
    <div className={`user-dropdown ${open ? 'open' : ''}`} ref={ref}>
      <button type="button" className="sidebar-user" onClick={() => setOpen((s) => !s)} aria-expanded={open}>
        <div className="avatar">{displayName?.[0]?.toUpperCase() || 'U'}</div>
        <div className="user-meta">
          <strong>{displayName}</strong>
          <span>@{user?.username}</span>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={fastTransition}>
          <ChevronDown size={16} className="user-chevron" />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="user-dropdown-menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={fastTransition}
          >
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                navigate('/profile');
                setOpen(false);
                onNavigate?.();
              }}
            >
              <User size={16} /> Profile
            </button>
            <button
              type="button"
              className="dropdown-item"
              onClick={() => {
                toggleTheme();
                setOpen(false);
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            {themeMode === 'manual' && (
              <button
                type="button"
                className="dropdown-item"
                onClick={() => {
                  useAutoTheme();
                  setOpen(false);
                }}
              >
                <Sun size={16} /> Auto theme (by time)
              </button>
            )}
            <button
              type="button"
              className="dropdown-item danger"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="sidebar-brand">
        <div className="brand-mark">
          <span className="brand-icon">₹</span>
          <div>
            <strong>POCKET</strong>
            <small>SIMPLE. SMART. YOURS.</small>
          </div>
        </div>
      </div>

      <UserDropdown onNavigate={onNavigate} />

      <nav className="sidebar-nav">
        {NAV.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to !== '/expenses'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <Icon size={18} />
            <span>{label}</span>
            {badge && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <small>v1.0 · Built with care</small>
      </div>
    </>
  );
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const close = () => setSidebarOpen(false);

  return (
    <>
      <aside className="sidebar desktop-sidebar">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fastTransition}
              onClick={close}
            />
            <motion.aside
              className="sidebar mobile-sidebar"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <button type="button" className="sidebar-close" onClick={close} aria-label="Close menu">
                <X size={20} />
              </button>
              <SidebarContent onNavigate={close} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <button type="button" className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
        <Menu size={20} />
      </button>
    </>
  );
}
