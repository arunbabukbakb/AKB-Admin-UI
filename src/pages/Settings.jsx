import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { setTheme, setPreset, setSidebarBg, setHeaderBg, resetTheme } from '../store/themeSlice';
import './Pages.css';


const Settings = () => {
  const dispatch = useDispatch();
  const { theme, preset, sidebarBg, headerBg } = useSelector((state) => state.theme);
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


    </div>
  );
};

export default Settings;
