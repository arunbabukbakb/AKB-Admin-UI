import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GitBranch, Save, RotateCw, AlertCircle, CheckCircle, Loader, X, Star } from 'lucide-react';
import apiService from '../../services/api';

const UserBranch = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [branches, setBranches] = useState([]);
  const [selectedBranchIds, setSelectedBranchIds] = useState([]);
  const [defaultBranchId, setDefaultBranchId] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingMapping, setLoadingMapping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToastNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, 4000);
  };

  // Fetch Users and Branches on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Fetch Users
        const usersResponse = await apiService.get('User');
        let parsedUsers = [];
        if (Array.isArray(usersResponse)) parsedUsers = usersResponse;
        else if (usersResponse && Array.isArray(usersResponse.data)) parsedUsers = usersResponse.data;
        else if (usersResponse && typeof usersResponse === 'object' && Array.isArray(usersResponse.data?.data)) parsedUsers = usersResponse.data.data;
        setUsers(parsedUsers);

        // Fetch Branches
        const branchesResponse = await apiService.get('Branch');
        let parsedBranches = [];
        if (Array.isArray(branchesResponse)) parsedBranches = branchesResponse;
        else if (branchesResponse && Array.isArray(branchesResponse.data)) parsedBranches = branchesResponse.data;
        else if (branchesResponse && typeof branchesResponse === 'object' && Array.isArray(branchesResponse.data?.data)) parsedBranches = branchesResponse.data.data;
        setBranches(parsedBranches);

        if (parsedUsers.length > 0) {
          setSelectedUserId(parsedUsers[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        showToastNotification('Failed to load users or branches list.', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch User's existing branch mappings when selected user changes
  useEffect(() => {
    if (!selectedUserId) {
      setSelectedBranchIds([]);
      setDefaultBranchId('');
      return;
    }

    const fetchUserBranches = async () => {
      setLoadingMapping(true);
      try {
        // GET UserBranch/id?id={userId}
        const response = await apiService.get(`UserBranch/id?id=${selectedUserId}`);
        let mappings = [];
        if (response && Array.isArray(response.data)) {
          mappings = response.data;
        } else if (response && Array.isArray(response)) {
          mappings = response;
        }

        const branchIds = mappings.map(m => m.branchId);
        setSelectedBranchIds(branchIds);

        // Identify default branch
        const defaultMapping = mappings.find(m => m.isDefault);
        if (defaultMapping) {
          setDefaultBranchId(defaultMapping.branchId.toString());
        } else if (branchIds.length > 0) {
          setDefaultBranchId(branchIds[0].toString());
        } else {
          setDefaultBranchId('');
        }
      } catch (err) {
        console.error('Failed to load user branch mappings:', err);
        showToastNotification('Failed to load assigned branches for this user.', 'danger');
      } finally {
        setLoadingMapping(false);
      }
    };

    fetchUserBranches();
  }, [selectedUserId]);

  const handleBranchToggle = (branchId) => {
    setSelectedBranchIds(prev => {
      const isSelected = prev.includes(branchId);
      let updated;
      if (isSelected) {
        updated = prev.filter(id => id !== branchId);
        // If the default branch was deselected, set default to the first remaining selected branch (if any)
        if (defaultBranchId === branchId.toString()) {
          setDefaultBranchId(updated.length > 0 ? updated[0].toString() : '');
        }
      } else {
        updated = [...prev, branchId];
        // If there was no default branch, set this newly selected branch as default
        if (!defaultBranchId) {
          setDefaultBranchId(branchId.toString());
        }
      }
      return updated;
    });
  };

  const handleSelectAll = () => {
    const allIds = branches.map(b => b.id);
    setSelectedBranchIds(allIds);
    if (allIds.length > 0 && !defaultBranchId) {
      setDefaultBranchId(allIds[0].toString());
    }
  };

  const handleDeselectAll = () => {
    setSelectedBranchIds([]);
    setDefaultBranchId('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      showToastNotification('Please select a user.', 'danger');
      return;
    }

    if (selectedBranchIds.length === 0) {
      showToastNotification('Please select at least one branch.', 'danger');
      return;
    }

    if (!defaultBranchId) {
      showToastNotification('Please designate a default branch.', 'danger');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        userId: Number(selectedUserId),
        branchIds: selectedBranchIds.map(Number),
        defaultBranchId: Number(defaultBranchId)
      };

      const response = await apiService.post('UserBranch', payload);

      if (response && 'systemMessage' in response) {
        console.log('System Message:', response.systemMessage);
      }

      if (response && response.status === false) {
        showToastNotification(response.message || 'Failed to save user branches.', 'danger');
        return;
      }

      showToastNotification(response.message || 'User branch assignment saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save user branch mappings:', err);
      const response = err.response?.data;
      if (response && 'systemMessage' in response) {
        console.log('System error details:', response.systemMessage);
      }
      const errMsg = response?.message || err.message || 'Failed to save branch assignments.';
      showToastNotification(errMsg, 'danger');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Title Header */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
        <div className="user-header-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-glow)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GitBranch size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>User Branch Mapping</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Assign authorized branches and designate default site profiles</p>
            </div>
          </div>

          <div className="user-select-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label htmlFor="user-select" style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-main)' }}>Select User:</label>
            <select
              id="user-select"
              className="form-control"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loading || saving}
              style={{
                width: '240px',
                height: '36px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              <option value="">Select User</option>
              {users.map(u => (
                <option key={u.id} value={u.id.toString()}>{u.userName} ({u.nickName || 'No Name'})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <Loader className="spin" size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="row g-4">
          {/* Branch Check List Card */}
          <div className="col-md-8">
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                  Authorized Branch Assignments
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleSelectAll}
                    disabled={saving || loadingMapping || branches.length === 0}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={handleDeselectAll}
                    disabled={saving || loadingMapping || branches.length === 0}
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {loadingMapping ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
                  <Loader className="spin" size={24} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : branches.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  No branches found in database. Please configure branches first.
                </div>
              ) : (
                <div className="row g-2" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {branches.map((b) => {
                    const isChecked = selectedBranchIds.includes(b.id);
                    const isDefault = defaultBranchId === b.id.toString();
                    return (
                      <div className="col-sm-6" key={b.id}>
                        <div
                          className="branch-toggle-card"
                          onClick={() => handleBranchToggle(b.id)}
                          style={{
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            border: `1px solid ${isDefault ? 'var(--warning)' : isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                            backgroundColor: isDefault ? 'rgba(245, 158, 11, 0.04)' : isChecked ? 'var(--primary-glow)' : 'var(--bg-main)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.2s ease',
                            boxShadow: isChecked ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <input
                              type="checkbox"
                              className="form-check-input branch-check-input"
                              checked={isChecked}
                              readOnly
                              style={{ width: '16px', height: '16px', cursor: 'pointer', margin: 0 }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span className="branch-card-name" style={{ fontSize: '0.85rem', fontWeight: isChecked ? '600' : '500', color: 'var(--text-main)' }}>{b.name}</span>
                              <span className="branch-card-details" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code: {b.code} | {b.city}</span>
                            </div>
                          </div>

                          {isChecked && (
                            <button
                              type="button"
                              className="branch-star-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDefaultBranchId(b.id.toString());
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: isDefault ? 'var(--warning)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: '0.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'all 0.2s ease'
                              }}
                              title={isDefault ? "Designated Default Branch" : "Set as Default Branch"}
                            >
                              <Star size={16} fill={isDefault ? 'var(--warning)' : 'none'} className="star-icon" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Config Summary & Controls Card */}
          <div className="col-md-4">
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  Default Branch Assignment
                </h3>

                <form onSubmit={handleSave}>
                  <div className="form-group mb-3">
                    <label htmlFor="default-branch-select" className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Default Site Profile</label>
                    <select
                      id="default-branch-select"
                      className="form-control"
                      value={defaultBranchId}
                      onChange={(e) => setDefaultBranchId(e.target.value)}
                      disabled={saving || selectedBranchIds.length === 0}
                      style={{
                        padding: '0.45rem 0.6rem',
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)'
                      }}
                    >
                      <option value="">Select Default Branch</option>
                      {branches
                        .filter(b => selectedBranchIds.includes(b.id))
                        .map(b => (
                          <option key={b.id} value={b.id.toString()}>{b.name} ({b.code})</option>
                        ))}
                    </select>
                  </div>

                  <div style={{ marginTop: '1.5rem', padding: '0.75rem', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Sites:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>{selectedBranchIds.length} branch(es)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Default Branch:</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {defaultBranchId ? branches.find(b => b.id.toString() === defaultBranchId)?.name || 'Unknown' : 'Not Set'}
                      </span>
                    </div>
                  </div>
                </form>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={saving || !selectedUserId}
                  onClick={() => setSelectedUserId(selectedUserId)} // triggers re-fetch
                  style={{
                    flex: 1,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem',
                    borderRadius: '6px'
                  }}
                >
                  <RotateCw size={15} />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={saving || selectedBranchIds.length === 0 || !defaultBranchId || !selectedUserId}
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem',
                    borderRadius: '6px'
                  }}
                >
                  {saving ? (
                    <>
                      <Loader className="spin" size={15} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      <span>Save Mapping</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Popup Notification */}
      {toast && createPortal(
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 999999,
            minWidth: '300px',
            maxWidth: '450px',
            padding: '1rem',
            borderRadius: '10px',
            backgroundColor: 'var(--bg-card)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideIn 0.3s ease forwards',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)'
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={20} style={{ color: 'var(--success, #22c55e)', flexShrink: 0 }} />
          ) : (
            <AlertCircle size={20} style={{ color: 'var(--danger, #ef4444)', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-main)' }}>
              {toast.type === 'success' ? 'Success' : 'Error'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {toast.message}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>,
        document.body
      )}

      <style>{`
        .form-check-input {
          background-color: var(--bg-main) !important;
          border: 1px solid var(--border-color) !important;
        }
        .form-check-input:checked {
          background-color: var(--primary) !important;
          border-color: var(--primary) !important;
        }
        .form-check-input:focus {
          box-shadow: 0 0 0 2px var(--primary-glow) !important;
          border-color: var(--primary) !important;
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Mobile styles */
        @media (max-width: 768px) {
          .user-header-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.75rem !important;
          }
          .user-select-container {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 0.5rem !important;
          }
          .user-select-container label {
            white-space: nowrap !important;
            margin-bottom: 0 !important;
            font-size: 0.75rem !important;
          }
          .user-select-container select {
            flex: 1 !important;
            width: 100% !important;
            height: 32px !important;
            font-size: 0.75rem !important;
          }

          .glass-panel {
            padding: 0.75rem !important;
            margin-bottom: 1rem !important;
            border-radius: 8px !important;
          }
          .glass-panel h2 {
            font-size: 0.95rem !important;
          }
          .glass-panel p {
            font-size: 0.65rem !important;
          }
          label {
            font-size: 0.75rem !important;
          }
          .glass-panel h3 {
            font-size: 0.825rem !important;
          }
          .btn-sm {
            font-size: 0.65rem !important;
            padding: 0.15rem 0.4rem !important;
          }
          .branch-toggle-card {
            padding: 0.5rem 0.75rem !important;
            border-radius: 6px !important;
          }
          .branch-check-input {
            width: 14px !important;
            height: 14px !important;
          }
          .branch-card-name {
            font-size: 0.75rem !important;
          }
          .branch-card-details {
            font-size: 0.65rem !important;
          }
          .branch-star-btn {
            padding: 0.15rem !important;
          }
          .branch-star-btn .star-icon {
            width: 13px !important;
            height: 13px !important;
          }
          .btn-primary, .btn-secondary {
            font-size: 0.75rem !important;
            padding: 0.35rem !important;
            height: 32px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
};

export default UserBranch;
