import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ChevronLeft, ChevronRight, ChevronDown, Palette } from 'lucide-react';
import { toggleSidebar } from '../../store/themeSlice';

const Sidebar = ({
  sidebarCollapsed,
  mobileOpen,
  setMobileOpen,
  menuItems,
  expandedMenus,
  toggleExpand,
  getMenuIcon,
  getResolvedPath,
  user,
  getUserPhotoUrl,
  collapseAllMenus
}) => {
  const dispatch = useDispatch();

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-brand" onClick={() => setMobileOpen(false)}>
          <Palette size={26} />
          <span className="sidebar-brand-text">AuraAdmin</span>
        </Link>
      </div>

      <nav style={{ flex: 1, overflowY: sidebarCollapsed ? 'visible' : 'auto', overflowX: sidebarCollapsed ? 'visible' : 'hidden', paddingRight: '4px' }}>
        <ul className="sidebar-menu">
          {menuItems.map((item) => {
            const MenuIcon = getMenuIcon(item.icon);
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = !!expandedMenus[item.menuId];

            if (hasChildren) {
              return (
                <li key={item.menuId} className={`sidebar-dropdown ${isExpanded ? 'open' : ''}`}>
                  <button
                    className="sidebar-link dropdown-toggle-btn"
                    onClick={() => toggleExpand(item.menuId)}
                    title={sidebarCollapsed ? item.title : undefined}
                    style={{
                      background: 'none',
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <MenuIcon size={20} />
                      <span className="sidebar-link-text">{item.title}</span>
                    </div>
                    {!sidebarCollapsed && (
                      isExpanded ? <ChevronDown size={14} style={{ opacity: 0.7 }} /> : <ChevronRight size={14} style={{ opacity: 0.7 }} />
                    )}
                  </button>

                  {/* Collapsible Children lists */}
                  <ul className={`sidebar-submenu-list ${isExpanded ? 'visible' : 'collapsed'}`}>
                    {item.children.map((child) => (
                      <li key={child.menuId}>
                        <NavLink
                          to={getResolvedPath(item, child)}
                          className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            setMobileOpen(false);
                            collapseAllMenus();
                          }}
                        >
                          <span className="sidebar-sublink-bullet"></span>
                          <span className="sidebar-link-text">{child.title}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            // Normal single links
            return (
              <li key={item.menuId}>
                <NavLink
                  to={getResolvedPath(item, null)}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setMobileOpen(false);
                    collapseAllMenus();
                  }}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  <MenuIcon size={20} />
                  <span className="sidebar-link-text">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar User Info */}
      {user && (
        <Link to="/profile" className="sidebar-user" style={{ textDecoration: 'none' }} title="View Profile">
          <img
            src={getUserPhotoUrl(user?.photoFile || user?.photo || user?.avatar, user?.nickName, user?.userName)}
            alt={user?.nickName || user?.userName}
            className="sidebar-user-avatar"
          />
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.nickName || user?.userName || 'User'}</span>
            <span className="sidebar-user-role">{user?.role?.name || 'Member'}</span>
          </div>
        </Link>
      )}

      {/* Sidebar Bottom Toggle */}
      <div className="sidebar-bottom">
        <button
          className="sidebar-bottom-toggle-btn"
          onClick={() => dispatch(toggleSidebar())}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className="sidebar-link-text">Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
