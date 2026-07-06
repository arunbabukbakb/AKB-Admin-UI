import React from 'react';
import './Layout.css';
import { Shield } from 'lucide-react';

const AuthLayout = ({ children, subtitle }) => {
  return (
    <div className="auth-wrapper">
      <div className="auth-bg-glowing"></div>
      <div className="auth-bg-glowing-secondary"></div>
      
      <div className="auth-card glass-panel fade-in">
        <div className="auth-header">
          <div className="auth-logo">
            <Shield size={32} />
            <span>AuraAdmin</span>
          </div>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
