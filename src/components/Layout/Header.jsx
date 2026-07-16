import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  Settings as SettingsIcon,
  Users as UsersIcon,
  LogOut,
  Download,
  Terminal,
  Database
} from 'lucide-react';
import { toggleTheme, toggleSidebar } from '../../store/themeSlice';
import { markAsRead, markAllAsRead, clearAllNotifications } from '../../store/notificationSlice';


const Header = ({
  sidebarCollapsed,
  mobileOpen,
  setMobileOpen,
  pageTitle,
  userBranches,
  activeBranchId,
  setActiveBranchId,
  theme,
  showProfileMenu,
  setShowProfileMenu,
  user,
  getUserPhotoUrl,
  handleLogout,
  installPrompt,
  handleInstallClick
}) => {
  const dispatch = useDispatch();
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';
  const [showNotifications, setShowNotifications] = useState(false);
  const { list: notifications, unreadCount } = useSelector((state) => state.notifications);


  return (
    <header className="navbar sticky-top" style={{ position: "sticky !important" }}>
      <div className="navbar-left" style={{ gap: '0.75rem' }}>
        <button
          className="nav-action-btn mobile-menu-btn"
          style={{ display: 'none' }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu size={20} />
        </button>
        <button
          className="nav-action-btn desktop-toggle-btn"
          onClick={() => dispatch(toggleSidebar())}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Branch Selector Dropdown */}
        {userBranches.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select
              value={activeBranchId}
              onChange={(e) => {
                const newBranchId = e.target.value;
                setActiveBranchId(newBranchId);
                localStorage.setItem('active_branch_id', newBranchId);
                window.dispatchEvent(new CustomEvent('activeBranchChanged', { detail: newBranchId }));
              }}
              style={{
                height: '32px',
                padding: '0.25rem 2.5rem 0.25rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'none\' stroke=\'%236c757d\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M2 5l6 6 6-6\'/%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '10px',
                appearance: 'none',
                WebkitAppearance: 'none',
                MozAppearance: 'none'
              }}
            >
              {userBranches.map(m => {
                const id = m.branchId || m.BranchId;
                const name = m.branchName || m.BranchName;
                return (
                  <option key={id} value={id.toString()} style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}>
                    {name}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <h1 className="page-title d-none d-sm-block">{pageTitle}</h1>
      </div>

      <div className="navbar-right">

        {/* PWA Install Button */}
        {installPrompt && (
          <button
            className="btn btn-primary d-none d-md-flex align-items-center gap-2"
            onClick={handleInstallClick}
            style={{
              height: '32px',
              padding: '0 0.85rem',
              fontSize: '0.78rem',
              fontWeight: '600',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: 'var(--primary-glow-strong)'
            }}
          >
            <Download size={13} />
            <span>Install App</span>
          </button>
        )}

        {/* Theme Selector Button */}
        <button
          className="nav-action-btn"
          onClick={() => dispatch(toggleTheme())}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Notification Badge Indicator */}
        <div style={{ position: 'relative' }}>
          <button 
            className="nav-action-btn" 
            title="Notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            onBlur={() => setTimeout(() => setShowNotifications(false), 200)}
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="nav-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div
              className="glass-panel fade-in"
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '320px',
                borderRadius: '8px',
                padding: '0.5rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)',
                zIndex: 1000,
                maxHeight: '400px',
                overflowY: 'auto'
              }}
            >
              {/* Header inside notifications dropdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.5rem 0.5rem 0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-main)' }}>
                  Notifications ({unreadCount})
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {unreadCount > 0 && (
                    <button 
                      onMouseDown={() => dispatch(markAllAsRead())}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Read All
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onMouseDown={() => dispatch(clearAllNotifications())}
                      style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Notifications list */}
              {notifications.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  No new notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onMouseDown={() => dispatch(markAsRead(notif.id))}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      backgroundColor: notif.read ? 'transparent' : 'rgba(99, 102, 241, 0.05)',
                      transition: 'background-color 0.2s',
                      marginBottom: '0.2rem'
                    }}
                    className="notification-item-hover"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: notif.read ? 500 : 700, fontSize: '0.8rem', color: notif.read ? 'var(--text-main)' : 'var(--primary)' }}>
                        {notif.title}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {notif.date}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-word', whiteSpace: 'normal', textAlign: 'left' }}>
                      {notif.body}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>


        {/* Profile Avatar — click toggles dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            className="nav-profile-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            onBlur={() => setTimeout(() => setShowProfileMenu(false), 200)}
            title="Account menu"
          >
            <img
              src={getUserPhotoUrl(user?.photoFile || user?.photo || user?.avatar, user?.nickName, user?.userName)}
              alt={user?.nickName || user?.userName}
              className="nav-avatar"
            />
          </button>

          {showProfileMenu && (
            <div
              className="glass-panel fade-in"
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '190px',
                borderRadius: '8px',
                padding: '0.5rem',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)',
                zIndex: 1000
              }}
            >
              {/* User info header inside dropdown */}
              <div style={{ padding: '0.5rem 0.75rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  {user?.nickName || user?.userName || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {user?.role?.name || 'Member'}
                </div>
              </div>

              <Link
                to="/profile"
                className="header-dropdown-item"
              >
                <UsersIcon size={16} />
                <span>My Profile</span>
              </Link>
              <Link
                to="/settings"
                className="header-dropdown-item"
              >
                <SettingsIcon size={16} />
                <span>Settings</span>
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/api-docs"
                    className="header-dropdown-item"
                  >
                    <Terminal size={16} />
                    <span>API Documentation</span>
                  </Link>
                  <Link
                    to="/database-schema"
                    className="header-dropdown-item"
                  >
                    <Database size={16} />
                    <span>Database Schema</span>
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="header-dropdown-item logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .header-dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem;
          color: var(--text-main) !important;
          text-decoration: none;
          border-radius: 6px;
          transition: background-color 0.2s, color 0.2s;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-weight: 500;
        }

        .header-dropdown-item:hover {
          background-color: var(--bg-card-hover, rgba(0,0,0,0.03));
          color: var(--primary) !important;
        }

        .header-dropdown-item.logout {
          color: var(--danger) !important;
          border-top: 1px solid var(--border-color);
          margin-top: 0.25rem;
          border-radius: 0 0 6px 6px;
        }

        .header-dropdown-item.logout:hover {
          background-color: rgba(239, 68, 68, 0.05);
          color: var(--danger) !important;
        }

        .notification-item-hover:hover {
          background-color: var(--bg-card-hover, rgba(0,0,0,0.03)) !important;
        }

        .nav-badge {
          position: absolute;
          top: 3px !important;
          right: 3px !important;
          background-color: var(--danger) !important;
          color: white !important;
          border-radius: 999px !important;
          padding: 0.1rem 0.3rem !important;
          font-size: 0.62rem !important;
          font-weight: 700 !important;
          line-height: 1 !important;
          min-width: 14px !important;
          height: auto !important;
          width: auto !important;
          text-align: center !important;
          box-shadow: 0 0 6px var(--danger) !important;
        }
      `}</style>
    </header>
  );
};

export default Header;
