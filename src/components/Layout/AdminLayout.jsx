import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users as UsersIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sun,
  Moon,
  Bell,
  Palette,
  Shield,
  Layers,
  Home,
  Package,
  Building,
  Handshake,
  Download,
  X
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { toggleTheme, toggleSidebar } from '../../store/themeSlice';
import apiService from '../../services/api';
import { requestNotificationPermission, onMessageListener } from '../../services/firebase';
import { addNotification } from '../../store/notificationSlice';

import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

// Lucide Icon mapper from FontAwesome name descriptors
const getMenuIcon = (iconName) => {
  if (!iconName) return Layers;
  const name = iconName.toLowerCase();
  if (name.includes('home')) return Home;
  if (name.includes('product') || name.includes('box') || name.includes('asset') || name.includes('handshake')) {
    if (name.includes('handshake')) return Handshake;
    return Package;
  }
  if (name.includes('building') || name.includes('company') || name.includes('department') || name.includes('designation') || name.includes('employee')) return Building;
  if (name.includes('bars') || name.includes('master')) return Layers;
  if (name.includes('users') || name.includes('user')) return UsersIcon;
  if (name.includes('cogs') || name.includes('setting')) return SettingsIcon;
  if (name.includes('menu')) return Menu;
  if (name.includes('shield') || name.includes('permission')) return Shield;
  return Layers;
};

// Route mapper to convert child paths back to our dashboard pages
const getResolvedPath = (parent, child) => {
  if (child) {
    const rawPath = child.path || '';
    const childPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

    // Auto-map endpoints to template paths
    if (childPath === '/user') return '/users';
    if (childPath === '/role') return '/roles';
    if (childPath === '/menu') return '/menus';
    if (childPath === '/branch') return '/branches';
    if (childPath === '/menu-permission') return '/menu-permissions';
    if (childPath === '/companies') return '/company';
    if (childPath === '/user-branch') return '/user-branches';

    return childPath;
  }

  if (parent) {
    const rawPath = parent.path || '';
    if (!rawPath) return '';
    return rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  }

  return '/';
};

// Build full photo URL from env base path
const getUserPhotoUrl = (rawPhoto, nickName, userName) => {
  if (rawPhoto) {
    if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://') || rawPhoto.startsWith('data:')) {
      return rawPhoto;
    }
    const base = import.meta.env.VITE_USER_PHOTO_URL || 'https://localhost:7245/upload/user/photo/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    return `${cleanBase}${rawPhoto.startsWith('/') ? rawPhoto.slice(1) : rawPhoto}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(nickName || userName || 'U')}&background=6366f1&color=fff&size=64`;
};

const AdminLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userBranches, setUserBranches] = useState([]);
  const [activeBranchId, setActiveBranchId] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showMobileInstallBanner, setShowMobileInstallBanner] = useState(true);

  const { user } = useSelector((state) => state.auth?.user);
  const { theme, sidebarCollapsed } = useSelector((state) => state.theme);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowMobileInstallBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app is already installed or running in standalone mode, hide the button
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setInstallPrompt(null);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to PWA install prompt: ${outcome}`);
    setInstallPrompt(null);
  };

  useEffect(() => {
    if (!user) {
      setUserBranches([]);
      setActiveBranchId('');
      return;
    }
    const fetchUserBranches = async () => {
      try {
        const response = await apiService.get('UserBranch/current');
        let mappings = [];
        if (response && Array.isArray(response.data)) {
          mappings = response.data;
        } else if (response && Array.isArray(response)) {
          mappings = response;
        } else if (response && typeof response === 'object' && Array.isArray(response.data?.data)) {
          mappings = response.data.data;
        }

        setUserBranches(mappings);

        if (mappings.length > 0) {
          const savedActive = localStorage.getItem('active_branch_id');
          const hasSavedActive = savedActive && mappings.some(m => {
            const id = m.branchId || m.BranchId;
            return id?.toString() === savedActive;
          });

          if (hasSavedActive) {
            setActiveBranchId(savedActive);
          } else {
            const defaultMap = mappings.find(m => m.isDefault || m.IsDefault);
            const initialActive = defaultMap
              ? (defaultMap.branchId || defaultMap.BranchId).toString()
              : (mappings[0].branchId || mappings[0].BranchId).toString();

            setActiveBranchId(initialActive);
            localStorage.setItem('active_branch_id', initialActive);
          }
        }
      } catch (err) {
        console.warn('Failed to load login user branches for header dropdown:', err.message);
      }
    };
    fetchUserBranches();
  }, [user]);

  // Map location path to titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'Dashboard';
    if (path === '/users' || path === '/user') return 'User Management';
    if (path === '/roles' || path === '/role') return 'Role Management';
    if (path === '/menus' || path === '/menu') return 'Menu Management';
    if (path === '/branches' || path === '/branch') return 'Branch Management';
    if (path === '/menu-permissions' || path === '/menu-permission') return 'Menu Access Permissions';
    if (path === '/company' || path === '/companies') return 'Company Configuration';
    if (path === '/user-branches' || path === '/user-branch') return 'User Branch Mapping';
    if (path === '/settings') return 'Settings & Customization';
    if (path === '/profile') return 'My Profile';
    return 'Admin Control Panel';
  };

  // Fetch Menu tree on load (only once on mount)
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await apiService.get('MenuPermission/my-menus');

        let parsed = [];
        if (response && Array.isArray(response.data)) {
          parsed = response.data;
        } else if (Array.isArray(response)) {
          parsed = response;
        } else if (response && typeof response === 'object' && Array.isArray(response.data?.data)) {
          parsed = response.data.data;
        }

        if (parsed.length > 0) {
          setMenuItems(parsed);
        } else {
          throw new Error('Received empty menu array');
        }
      } catch (error) {
        console.warn("Failed to fetch dynamic menus, loading fallback sidebar layout:", error.message);
        // Resilient default fallback sidebar
        setMenuItems([
          { menuId: 1, title: 'Dashboard', path: '/dashboard', icon: 'fa fa-home', children: [] },
          {
            menuId: 2, title: 'Users', path: '', icon: 'fa fa-users', children: [
              { menuId: 22, title: 'Users List', path: 'user' },
              { menuId: 23, title: 'Roles List', path: 'role' },
              { menuId: 24, title: 'Permissions Config', path: 'menu-permission' },
              { menuId: 27, title: 'User Branch Map', path: 'user-branch' }
            ]
          },
          {
            menuId: 3, title: 'Company', path: '', icon: 'fa fa-building', children: [
              { menuId: 30, title: 'Company Profile', path: 'company' },
              { menuId: 31, title: 'Branch List', path: 'branch' }
            ]
          },
          {
            menuId: 6, title: 'Settings', path: '', icon: 'fa fa-cogs', children: [
              { menuId: 25, title: 'Menu Config', path: 'menu' },
              { menuId: 26, title: 'Customize Layout', path: 'settings' }
            ]
          }
        ]);
      }
    };
    fetchMenus();
  }, []);

  // Initialize Firebase Push Notifications and listener
  useEffect(() => {
    const authState = localStorage.getItem(import.meta.env.VITE_TOKEN_NAME || 'auth_user');
    let userId = null;
    if (authState) {
      try {
        const parsed = JSON.parse(authState);
        userId = parsed?.id || parsed.user?.Id;
      } catch (e) {
        console.warn("Failed to parse user from localStorage:", e);
      }
    }

    if (userId) {
      // Request permission and token
      requestNotificationPermission(userId);

      // Listen for foreground push notifications
      const unsubscribe = onMessageListener((payload) => {
        dispatch(
          addNotification({
            id: payload.messageId || Date.now().toString(),
            title: payload.notification?.title || 'Notification',
            body: payload.notification?.body || '',
            date: new Date().toLocaleTimeString(),
            read: false,
            url: payload.data?.url || '',
            type: payload.data?.type || ''
          })
        );

        // Standard Web Notification alert if in foreground
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'New Notification', {
            body: payload.notification?.body || '',
            icon: '/favicon.svg'
          });
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [dispatch]);

  // Auto-expand current active sub-menu when location or menu items change

  useEffect(() => {
    if (menuItems.length === 0 || sidebarCollapsed) return;
    const currentPath = location.pathname;
    setExpandedMenus(prev => {
      const initialExpanded = { ...prev };
      menuItems.forEach(parent => {
        if (parent.children && parent.children.length > 0) {
          const hasActiveChild = parent.children.some(child => getResolvedPath(parent, child) === currentPath);
          if (hasActiveChild) {
            initialExpanded[parent.menuId] = true;
          }
        }
      });
      return initialExpanded;
    });
  }, [location.pathname, menuItems, sidebarCollapsed]);

  const toggleExpand = (menuId) => {
    setExpandedMenus(prev => {
      const isCurrentlyExpanded = !!prev[menuId];
      return {
        [menuId]: !isCurrentlyExpanded
      };
    });
  };

  const collapseAllMenus = () => {
    setExpandedMenus({});
  };

  return (
    <div className={`admin-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        menuItems={menuItems}
        expandedMenus={expandedMenus}
        toggleExpand={toggleExpand}
        getMenuIcon={getMenuIcon}
        getResolvedPath={getResolvedPath}
        user={user}
        getUserPhotoUrl={getUserPhotoUrl}
        collapseAllMenus={collapseAllMenus}
      />

      {/* Main Content Wrappers */}
      <div className="main-wrapper">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          pageTitle={getPageTitle()}
          userBranches={userBranches}
          activeBranchId={activeBranchId}
          setActiveBranchId={setActiveBranchId}
          theme={theme}
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          user={user}
          getUserPhotoUrl={getUserPhotoUrl}
          handleLogout={handleLogout}
          installPrompt={installPrompt}
          handleInstallClick={handleInstallClick}
        />

        {/* Content View Area */}
        <main className="content-area">
          <div className="fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* Overlay backdrop for mobile */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 95
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Floating PWA Install button for Mobile */}
      {installPrompt && showMobileInstallBanner && (
        <div className="mobile-pwa-install-container">
          <button
            onClick={handleInstallClick}
            className="mobile-pwa-install-btn"
            title="Install App"
          >
            <Download size={16} />
            <span>Install App</span>
          </button>
          <button
            onClick={() => setShowMobileInstallBanner(false)}
            className="mobile-pwa-install-close-btn"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <style>{`
        /* Sidebar Parent-Child Submenu CSS */
        .sidebar-dropdown {
          display: flex;
          flex-direction: column;
        }
        .sidebar-submenu-list {
          list-style: none;
          padding: 0;
          margin: 0;
          overflow: hidden;
          transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
        }
        .sidebar-submenu-list.collapsed {
          max-height: 0;
          opacity: 0;
          pointer-events: none;
        }
        .sidebar-submenu-list.visible {
          max-height: 500px;
          opacity: 1;
        }
        .sidebar-sublink {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.85rem;
          border-radius: 8px;
          margin: 2px 8px;
          transition: all 0.2s ease;
        }
        .sidebar-sublink-bullet {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background-color: var(--text-muted);
          opacity: 0.5;
          transition: all 0.2s ease;
        }
        .sidebar-sublink:hover {
          background-color: var(--bg-hover);
          color: var(--text-main);
        }
        .sidebar-sublink:hover .sidebar-sublink-bullet {
          background-color: var(--primary);
          opacity: 1;
        }
        .sidebar-sublink.active {
          background-color: var(--primary-glow);
          color: var(--primary);
          font-weight: 500;
        }
        .sidebar-sublink.active .sidebar-sublink-bullet {
          background-color: var(--primary);
          opacity: 1;
        }
        .dropdown-toggle-btn {
          width: 100%;
        }
        .sidebar-link svg {
          flex-shrink: 0 !important;
        }
        .sidebar.collapsed .sidebar-link-text {
          display: none !important;
        }

        /* Hover dropdown popout for collapsed sidebar */
        @media (min-width: 769px) {
          .sidebar.collapsed .sidebar-dropdown {
            position: relative;
          }
          .sidebar.collapsed .sidebar-submenu-list {
            max-height: 0 !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
          .sidebar.collapsed .sidebar-dropdown:hover .sidebar-submenu-list,
          .sidebar.collapsed .sidebar-dropdown.open .sidebar-submenu-list {
            position: absolute;
            left: 72px;
            top: 0;
            width: 200px;
            background-color: var(--bg-sidebar);
            border: 1px solid var(--border-sidebar);
            border-radius: 10px;
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.3), var(--card-shadow);
            padding: 0.5rem;
            display: block !important;
            max-height: none !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            z-index: 1000;
            animation: submenuFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .sidebar.collapsed .sidebar-dropdown:hover .sidebar-submenu-list .sidebar-sublink,
          .sidebar.collapsed .sidebar-dropdown.open .sidebar-submenu-list .sidebar-sublink {
            padding: 0.6rem 1rem 0.6rem 1.25rem;
            margin: 2px 0;
          }
          .sidebar.collapsed .sidebar-dropdown:hover .sidebar-submenu-list .sidebar-link-text,
          .sidebar.collapsed .sidebar-dropdown.open .sidebar-submenu-list .sidebar-link-text {
            opacity: 1 !important;
            width: auto !important;
            display: inline !important;
            pointer-events: auto !important;
          }
          @keyframes submenuFadeIn {
            from { opacity: 0; transform: translateX(-8px); }
            to { opacity: 1; transform: translateX(0); }
          }
        }

        /* Mobile Floating PWA Install Container */
        .mobile-pwa-install-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: none;
          align-items: center;
          gap: 8px;
          z-index: 2000;
          animation: floatIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .mobile-pwa-install-btn {
          background: var(--primary);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 10px 18px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .mobile-pwa-install-btn:hover {
          background-color: var(--primary-hover, #4f46e5);
          transform: scale(1.03);
        }

        .mobile-pwa-install-close-btn {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: var(--text-main);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .mobile-pwa-install-close-btn:hover {
          background-color: rgba(255, 255, 255, 0.2);
          transform: scale(1.05);
        }

        @keyframes floatIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .mobile-pwa-install-container {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
