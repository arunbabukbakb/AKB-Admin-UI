import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from 'react-bootstrap';
import { Sun, Moon, Palette, Check, AlertTriangle } from 'lucide-react';
import { setTheme, setPreset, setSidebarBg, setHeaderBg, resetTheme } from '../store/themeSlice';
import { logout } from '../store/authSlice';
import apiService from '../services/api';
import { toast } from 'react-toastify';
import './Pages.css';


const Settings = () => {
  const dispatch = useDispatch();
  const { theme, preset, sidebarBg, headerBg } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);
  const [resetting, setResetting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmTextInput, setConfirmTextInput] = useState('');

  // Check if role is admin
  const isAdmin = user?.role?.codeName?.toLowerCase() === 'admin' || 
                  user?.role?.name?.toLowerCase() === 'admin' ||
                  user?.roleName?.toLowerCase() === 'admin';

  const handleDatabaseReset = () => {
    setConfirmTextInput('');
    setShowConfirmModal(true);
  };

  const executeDatabaseReset = async () => {
    if (confirmTextInput !== 'RESET') return;

    setShowConfirmModal(false);
    setResetting(true);
    try {
      const response = await apiService.post('Home/reset-database', {}, { timeout: 60000 });
      if (response && response.status !== false) {
        toast.success(response.message || "Database reset to defaults successfully! Logging out...");
        setTimeout(() => {
          dispatch(logout());
          window.location.href = '/login';
        }, 1500);
      } else {
        toast.error(response?.message || "Failed to reset database.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "An error occurred while resetting the database.");
    } finally {
      setResetting(false);
    }
  };

  const presets = [
    { id: 'blue', name: 'cyber blue', colorClass: 'blue' },
    { id: 'purple', name: 'electric violet', colorClass: 'purple' },
    { id: 'emerald', name: 'deep emerald', colorClass: 'emerald' },
    { id: 'gold', name: 'sunset amber', colorClass: 'gold' },
  ];

  return (
    <div className="fade-in" style={{ maxWidth: '800px' }}>
      
      {/* Visual Customize Theme Block */}
      <section className="settings-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
          <h2 style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Palette size={20} style={{ color: 'var(--primary)' }} />
            <span>Layout Customization</span>
          </h2>
          <button 
            id="reset-theme-btn"
            className="btn btn-secondary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto' }}
            onClick={() => dispatch(resetTheme())}
          >
            Reset to Default
          </button>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Personalize your system workspace parameters in real-time. Changes are saved locally.
        </p>

        {/* Theme select options */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
          Interface Display Mode
        </h3>
        <div className="theme-options-grid" style={{ marginBottom: '2rem' }}>
          <div 
            id="theme-light-card"
            className={`theme-card ${theme === 'light' ? 'active' : ''}`}
            onClick={() => dispatch(setTheme('light'))}
          >
            <Sun size={20} style={{ color: '#f59e0b' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Light Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clean and bright view</div>
            </div>
          </div>

          <div 
            id="theme-dark-card"
            className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => dispatch(setTheme('dark'))}
          >
            <Moon size={20} style={{ color: '#8b5cf6' }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dark Mode</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Premium glowing design</div>
            </div>
          </div>
        </div>

        {/* Color Presets select */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
          Color Accent Presets
        </h3>
        <div className="preset-grid" style={{ marginBottom: '2rem' }}>
          {presets.map((p) => (
            <div
              id={`preset-${p.id}-card`}
              key={p.id}
              className={`preset-card ${preset === p.id ? 'active' : ''}`}
              onClick={() => dispatch(setPreset(p.id))}
            >
              <div className={`preset-indicator ${p.colorClass}`}>
                {preset === p.id && <Check size={14} />}
              </div>
              <span className="preset-name">{p.name}</span>
            </div>
          ))}
        </div>

        {/* Sidebar Background Color Options */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
          Left Sidebar Background Style
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { id: 'default', name: 'Default' },
            { id: 'light', name: 'Light Mode' },
            { id: 'dark', name: 'Dark Mode' },
            { id: 'carbon', name: 'Carbon Sleek' },
            { id: 'midnight', name: 'Deep Midnight' },
            { id: 'primary', name: 'Primary Tint' },
            { id: 'glass', name: 'Glassmorphic' },
          ].map((bg) => (
            <div
              id={`sidebar-bg-${bg.id}-card`}
              key={bg.id}
              className={`preset-card ${sidebarBg === bg.id ? 'active' : ''}`}
              onClick={() => dispatch(setSidebarBg(bg.id))}
              style={{ padding: '1rem 0.5rem', gap: '0.5rem', minHeight: '60px', justifyContent: 'center' }}
            >
              <span className="preset-name" style={{ fontSize: '0.85rem', color: sidebarBg === bg.id ? 'var(--primary)' : 'var(--text-main)', textAlign: 'center' }}>
                {bg.name}
              </span>
            </div>
          ))}
        </div>

        {/* Header Background Color Options */}
        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
          Header Navbar Background Style
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '1rem' }}>
          {[
            { id: 'default', name: 'Default' },
            { id: 'light', name: 'Light Mode' },
            { id: 'dark', name: 'Dark Mode' },
            { id: 'solid', name: 'Solid Flat' },
            { id: 'primary', name: 'Accent Color' },
            { id: 'glass', name: 'Glassmorphic' },
          ].map((bg) => (
            <div
              id={`header-bg-${bg.id}-card`}
              key={bg.id}
              className={`preset-card ${headerBg === bg.id ? 'active' : ''}`}
              onClick={() => dispatch(setHeaderBg(bg.id))}
              style={{ padding: '1rem 0.5rem', gap: '0.5rem', minHeight: '60px', justifyContent: 'center' }}
            >
              <span className="preset-name" style={{ fontSize: '0.85rem', color: headerBg === bg.id ? 'var(--primary)' : 'var(--text-main)', textAlign: 'center' }}>
                {bg.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* System Settings & Actions */}
      {isAdmin && (
        <section className="settings-section" style={{ marginTop: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
            <h2 style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
              <AlertTriangle size={20} />
              <span>System Administration</span>
            </h2>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Perform sensitive administrative and maintenance operations. Wiping data cannot be undone.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.25)', backgroundColor: 'rgba(239, 68, 68, 0.02)' }}>
              <div style={{ paddingRight: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Reset Database to Default
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Wipes all transaction tables, user logs, branches, and custom data, restoring initial template seeded tables.
                </p>
              </div>
              <button
                className="btn btn-danger"
                onClick={handleDatabaseReset}
                disabled={resetting}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.85)',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1.25rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                {resetting ? 'Resetting...' : 'Reset Database'}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Confirmation Modal */}
      <Modal 
        show={showConfirmModal} 
        onHide={() => setShowConfirmModal(false)}
        centered
        backdrop="static"
        contentClassName="glass-panel"
        style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-color)', background: 'transparent' }}>
          <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', fontSize: '1.1rem', fontWeight: 700 }}>
            <AlertTriangle size={20} />
            <span>Confirm Database Reset</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'transparent', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ color: 'var(--danger)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                <strong>WARNING:</strong> This action is highly destructive and irreversible. It will drop the entire database schema and delete all companies, branches, logs, customers, and custom user data.
              </div>
            </div>
            
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
              To confirm this action, please type the word <strong style={{ color: 'var(--text-main)' }}>RESET</strong> in the box below:
            </p>

            <input
              type="text"
              className="form-control"
              value={confirmTextInput}
              onChange={(e) => setConfirmTextInput(e.target.value)}
              placeholder="Type RESET to confirm"
              style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid var(--border-color)', background: 'transparent', padding: '1rem 1.5rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowConfirmModal(false)}
            style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '6px' }}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            onClick={executeDatabaseReset}
            disabled={confirmTextInput !== 'RESET' || resetting}
            style={{ 
              fontSize: '0.8rem', 
              padding: '0.4rem 1.25rem', 
              borderRadius: '6px', 
              backgroundColor: confirmTextInput === 'RESET' ? 'var(--danger)' : 'rgba(239, 68, 68, 0.4)', 
              border: 'none',
              color: 'white'
            }}
          >
            {resetting ? 'Resetting...' : 'Yes, Delete and Reset'}
          </button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Settings;
