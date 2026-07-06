import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Terminal, ShieldAlert, Key, Clipboard, Check, BookOpen,
  ArrowRight, ShieldCheck, Database, Server, GitMerge
} from 'lucide-react';
import './Pages.css';

const ApiDoc = () => {
  const { user } = useSelector((state) => state.auth?.user || {});
  const isAdmin = user?.role?.name?.toLowerCase() === 'admin';

  const [activeTab, setActiveTab] = useState('auth');
  const [copiedText, setCopiedText] = useState('');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  // If user is not admin, show premium access denied page
  if (!isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div className="glass-panel" style={{
          maxWidth: '500px',
          padding: '2.5rem 2rem',
          borderRadius: '16px',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          background: 'var(--bg-card)',
          boxShadow: '0 8px 32px rgba(239, 68, 68, 0.05)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.15)'
          }}>
            <ShieldAlert size={32} color="#ef4444" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            Access Denied
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            This resource contains system database mapping configurations and developer tools. Access is restricted to system administrators only.
          </p>
          <Link to="/" className="btn btn-primary" style={{ padding: '0.6rem 2rem', borderRadius: '8px', fontSize: '0.9rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'auth', label: 'Authentication', icon: <Key size={14} /> },
    { id: 'crud', label: 'Master CRUD APIs', icon: <Database size={14} /> },
    { id: 'core', label: 'Core Operations', icon: <Server size={14} /> },
    { id: 'permissions', label: 'Mappings & Security', icon: <GitMerge size={14} /> }
  ];

  const apiEndpoints = {
    auth: [
      {
        method: 'POST',
        path: 'Home/login',
        desc: 'Authenticates user credentials and signs JWT token.',
        payload: { userName: 'admin', password: 'password123' },
        response: { status: true, message: 'Login successful', data: { token: 'jwt_token_payload', username: 'admin' } }
      },
      {
        method: 'POST',
        path: 'User/register',
        desc: 'Submits user registration request needing administrator review.',
        payload: { userName: 'newuser', password: 'SecurePassword1', email: 'user@example.com', phoneNumber: '1234567890', nickName: 'Newbie' },
        response: { status: true, message: 'Registration submitted successfully. Pending administrator validation.', data: null }
      }
    ],
    crud: [
      {
        method: 'GET',
        path: 'User',
        desc: 'List all system users with role names and active statuses.',
        payload: null,
        response: { status: true, data: [{ id: 1, userName: 'admin', email: 'admin@domain.com', role: 'admin', status: true }] }
      },
      {
        method: 'POST',
        path: 'User',
        desc: 'Save, create, or update user credentials and mapping attributes.',
        payload: { id: 0, userName: 'staffuser', email: 'staff@domain.com', phoneNumber: '0987654321', roleId: 2, status: true },
        response: { status: true, message: 'User record saved successfully.', data: null }
      },
      {
        method: 'DELETE',
        path: 'User/{id}',
        desc: 'Completely remove a user record from the database registry.',
        payload: null,
        response: { status: true, message: 'User deleted successfully.', data: null }
      },
      {
        method: 'GET',
        path: 'Role',
        desc: 'Retrieve active authorization roles configuration.',
        payload: null,
        response: { status: true, data: [{ id: 1, code: 'ADM', name: 'admin', status: true }] }
      },
      {
        method: 'POST',
        path: 'Role',
        desc: 'Save or update authorization roles.',
        payload: { id: 0, code: 'STF', name: 'staff', status: true },
        response: { status: true, message: 'Role saved successfully.' }
      },
      {
        method: 'GET',
        path: 'Menu',
        desc: 'Fetches dynamic menu tree elements used by layout navigation.',
        payload: null,
        response: { status: true, data: [{ id: 1, title: 'Dashboard', path: '/dashboard', isParent: true }] }
      }
    ],
    core: [
      {
        method: 'POST',
        path: 'User/update-password',
        desc: 'Forces password update resets for specified user identifier.',
        payload: { userId: 4, newPassword: 'SuperSecretPassword123' },
        response: { status: true, message: 'Password updated successfully!' }
      },
      {
        method: 'POST',
        path: 'User/upload-photo-sign',
        desc: 'Saves user profile image or signature validation files (multipart/form-data).',
        payload: 'FormData: { UserId: 4, Photo: [binary], Sign: [binary] }',
        response: { status: true, message: 'Photo and signature uploaded successfully!' }
      },
      {
        method: 'GET',
        path: 'Company',
        desc: 'Loads corporate entity profile values (reads index 0).',
        payload: null,
        response: { id: 1, name: 'AuraAdmin Corp', streetAddress: '128 Tech Drive', status: true }
      },
      {
        method: 'POST',
        path: 'Company/upload-logo',
        desc: 'Uploads enterprise logo branding graphics (multipart/form-data).',
        payload: 'FormData: { CompanyId: 1, LogoFile: [binary] }',
        response: { status: true, message: 'Company logo uploaded successfully!' }
      }
    ],
    permissions: [
      {
        method: 'GET',
        path: 'MenuPermission/by-role/{roleId}',
        desc: 'Retrieve visibility and mapping configurations for specific role ID.',
        payload: null,
        response: [{ id: 15, roleId: 2, menuId: 5, canView: true, canAdd: false, canEdit: false, canDelete: false, showInHome: true }]
      },
      {
        method: 'POST',
        path: 'MenuPermission/save',
        desc: 'Bulk save and commit updated navigation access rights.',
        payload: [{ id: 15, roleId: 2, menuId: 5, canView: true, canAdd: true, canEdit: true, canDelete: false, showInHome: true }],
        response: { status: true, message: 'Menu permissions updated successfully!' }
      },
      {
        method: 'GET',
        path: 'UserBranch/id?id={userId}',
        desc: 'Retrieves branch scopes assigned to user.',
        payload: null,
        response: { status: true, data: [{ branchId: 1, branchName: 'Main office', isDefault: true }] }
      },
      {
        method: 'POST',
        path: 'UserBranch',
        desc: 'Saves user branch mappings and assigns primary context flag.',
        payload: { userId: 4, branchIds: [1, 2], defaultBranchId: 1 },
        response: { status: true, message: 'User branch mappings saved.' }
      }
    ]
  };

  const getBadgeStyle = (method) => {
    const isPost = method === 'POST';
    const isDelete = method === 'DELETE';
    const isPut = method === 'PUT';

    let bg = 'rgba(59, 130, 246, 0.1)';
    let color = '#3b82f6';

    if (isPost) {
      bg = 'rgba(16, 185, 129, 0.1)';
      color = '#10b981';
    } else if (isDelete) {
      bg = 'rgba(239, 68, 68, 0.1)';
      color = '#ef4444';
    } else if (isPut) {
      bg = 'rgba(245, 158, 11, 0.1)';
      color = '#f59e0b';
    }

    return {
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.72rem',
      fontWeight: 700,
      backgroundColor: bg,
      color: color,
      display: 'inline-block',
      fontFamily: 'monospace'
    };
  };

  return (
    <div style={{ padding: '0.5rem 0 2rem' }}>

      {/* Header Panel */}
      <div className="glass-panel" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: 44, height: 44,
            borderRadius: 12,
            background: 'var(--primary-glow)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Terminal size={20} color="var(--primary)" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Developer API Documentation
            </h2>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Explore and copy backend REST API route models integrated with your AuraAdmin components.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <ShieldCheck size={14} />
          <span style={{ fontWeight: 600 }}>Administrator Session Verified</span>
        </div>
      </div>

      {/* Tabs list bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: activeTab === tab.id ? 'var(--primary-glow)' : 'transparent',
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              borderRadius: '6px 6px 0 0'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* API cards List */}
      <div style={{ display: 'grid', gap: '1.25rem' }}>
        {apiEndpoints[activeTab].map((api, idx) => {
          const fullCopyVal = `${api.method} ${api.path}`;
          const isCopied = copiedText === fullCopyVal;

          return (
            <div key={idx} className="glass-panel" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>

              {/* Endpoint Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={getBadgeStyle(api.method)}>{api.method}</span>
                  <strong style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                    /{api.path}
                  </strong>
                </div>

                <button
                  onClick={() => handleCopy(fullCopyVal)}
                  className="nav-action-btn"
                  title="Copy Request Details"
                  style={{
                    height: '28px',
                    padding: '0 0.6rem',
                    fontSize: '0.75rem',
                    gap: '0.4rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  {isCopied ? <Check size={12} color="#10b981" /> : <Clipboard size={12} />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Endpoint Description */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 1.25rem' }}>
                {api.desc}
              </p>

              {/* Payload & Response Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1rem'
              }}>

                {/* Request Payload JSON */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Request Body
                  </div>
                  <pre style={{
                    margin: 0,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.78rem',
                    color: 'var(--text-main)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {api.payload ? (
                      typeof api.payload === 'string' ? api.payload : JSON.stringify(api.payload, null, 2)
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No request body required</span>
                    )}
                  </pre>
                </div>

                {/* Response Payload JSON */}
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Expected Response
                  </div>
                  <pre style={{
                    margin: 0,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.78rem',
                    color: 'var(--text-main)',
                    maxHeight: '180px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {JSON.stringify(api.response, null, 2)}
                  </pre>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ApiDoc;
