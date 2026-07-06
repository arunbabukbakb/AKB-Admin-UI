import React, { useState, useEffect } from 'react';
import { Shield, Save, RotateCw, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import apiService from '../../services/api';

const MenuPermission = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [menus, setMenus] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch Roles and Menus on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        // Fetch Roles
        const rolesData = await apiService.get('Role');
        let parsedRoles = [];
        if (Array.isArray(rolesData)) parsedRoles = rolesData;
        else if (rolesData && Array.isArray(rolesData.data)) parsedRoles = rolesData.data;
        setRoles(parsedRoles);

        // Fetch Menus
        const menusData = await apiService.get('Menu');
        let parsedMenus = [];
        if (Array.isArray(menusData)) parsedMenus = menusData;
        else if (menusData && Array.isArray(menusData.data)) parsedMenus = menusData.data;
        setMenus(parsedMenus);

        if (parsedRoles.length > 0) {
          setSelectedRoleId(parsedRoles[0].id.toString());
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setErrorMsg('Failed to load roles or menus list.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch Permissions when selected Role changes
  useEffect(() => {
    if (!selectedRoleId) return;

    const fetchPermissions = async () => {
      setLoading(true);
      setErrorMsg('');
      setSuccessMsg('');
      try {
        const response = await apiService.get(`MenuPermission/by-role/${selectedRoleId}`);
        let parsedPermissions = [];
        if (Array.isArray(response)) parsedPermissions = response;
        else if (response && Array.isArray(response.data)) parsedPermissions = response.data;
        else if (response && response.data && Array.isArray(response.data.data)) parsedPermissions = response.data.data;

        // Build list of permissions. For any menu not present, create default false permission
        const combined = menus.map(menu => {
          const existing = parsedPermissions.find(p => p.menuId === menu.id);
          return {
            id: existing ? existing.id : 0,
            menuId: menu.id,
            roleId: Number(selectedRoleId),
            canView: existing ? (existing.canView === true || existing.canView === 'true') : false,
            canAdd: existing ? (existing.canAdd === true || existing.canAdd === 'true') : false,
            canEdit: existing ? (existing.canEdit === true || existing.canEdit === 'true') : false,
            canDelete: existing ? (existing.canDelete === true || existing.canDelete === 'true') : false,
            showInHome: existing ? (existing.showInHome === true || existing.showInHome === 'true') : false,
            // local helper attributes to display menu details
            menuTitle: menu.title,
            menuPath: menu.path,
            isParent: menu.isParent === true || menu.isParent === 'true',
            parentMenuId: menu.parentMenuId
          };
        });

        setPermissions(combined);
      } catch (err) {
        console.error('Failed to load menu permissions:', err);
        setErrorMsg('Failed to load menu permissions for selected role.');
      } finally {
        setLoading(false);
      }
    };

    if (menus.length > 0) {
      fetchPermissions();
    }
  }, [selectedRoleId, menus]);

  const handlePermissionChange = (menuId, field) => {
    setPermissions(prev => prev.map(p => {
      if (p.menuId === menuId) {
        return { ...p, [field]: !p[field] };
      }
      return p;
    }));
  };

  const handleToggleRow = (menuId) => {
    setPermissions(prev => prev.map(p => {
      if (p.menuId === menuId) {
        const allChecked = p.canView && p.canAdd && p.canEdit && p.canDelete && p.showInHome;
        const targetValue = !allChecked;
        return {
          ...p,
          canView: targetValue,
          canAdd: targetValue,
          canEdit: targetValue,
          canDelete: targetValue,
          showInHome: targetValue
        };
      }
      return p;
    }));
  };

  const handleToggleAllColumn = (field, checked) => {
    setPermissions(prev => prev.map(p => ({
      ...p,
      [field]: checked
    })));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Format payload to strip local UI helper attributes
    const payload = permissions.map(p => ({
      id: p.id,
      menuId: p.menuId,
      roleId: p.roleId,
      canView: p.canView,
      canAdd: p.canAdd,
      canEdit: p.canEdit,
      canDelete: p.canDelete,
      showInHome: p.showInHome
    }));

    try {
      const response = await apiService.post('MenuPermission/save', payload);
      
      if (response && response.status === false) {
        setErrorMsg(response.message || 'Failed to save menu permissions.');
        return;
      }
      
      setSuccessMsg(response.message || 'Menu permissions saved successfully!');
      
      // Reload permissions
      const updatedResponse = await apiService.get(`MenuPermission/by-role/${selectedRoleId}`);
      let parsed = [];
      if (Array.isArray(updatedResponse)) parsed = updatedResponse;
      else if (updatedResponse && Array.isArray(updatedResponse.data)) parsed = updatedResponse.data;
      
      setPermissions(prev => prev.map(p => {
        const saved = parsed.find(item => item.menuId === p.menuId);
        if (saved) {
          return { ...p, id: saved.id };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to save menu permissions:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to save permissions. Please try again.';
      setErrorMsg(errMsg);
    } finally {
      setSaving(false);
    }
  };

  // Helper check to determine if all checkboxes of a column are checked
  const isAllChecked = (field) => {
    if (permissions.length === 0) return false;
    return permissions.every(p => p[field]);
  };

  return (
    <div className="menu-permission-container" style={{ padding: '0.5rem' }}>
      {/* Control Card Header */}
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
              <Shield size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Menu Permissions</h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Configure access levels for user roles</p>
            </div>
          </div>

          <div className="user-select-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label htmlFor="role-select" style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-main)' }}>Select Role:</label>
            <select
              id="role-select"
              className="form-control"
              value={selectedRoleId}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              disabled={loading || saving}
              style={{
                width: '200px',
                height: '36px',
                padding: '0.25rem 0.5rem',
                fontSize: '0.85rem',
                borderRadius: '6px',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)'
              }}
            >
              <option value="">Select Role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id.toString()}>{role.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alert boxes */}
      {errorMsg && (
        <div className="auth-error-box" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
          <AlertCircle size={16} />
          <span style={{ fontSize: '0.85rem' }}>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="auth-success-box" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: 'var(--success, #22c55e)' }}>
          <CheckCircle size={16} />
          <span style={{ fontSize: '0.85rem' }}>{successMsg}</span>
        </div>
      )}

      {/* Loading state indicator */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <Loader className="spin" size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        permissions.length > 0 && (
          <>
            {/* Desktop Table View */}
            <div className="desktop-permission-view table-container" style={{ borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <table className="table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>S.No</th>
                    <th>Menu Details</th>
                    <th style={{ textAlign: 'center', width: '120px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span>View</span>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isAllChecked('canView')}
                          onChange={(e) => handleToggleAllColumn('canView', e.target.checked)}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                      </div>
                    </th>
                    <th style={{ textAlign: 'center', width: '120px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span>Add</span>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isAllChecked('canAdd')}
                          onChange={(e) => handleToggleAllColumn('canAdd', e.target.checked)}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                      </div>
                    </th>
                    <th style={{ textAlign: 'center', width: '120px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span>Edit</span>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isAllChecked('canEdit')}
                          onChange={(e) => handleToggleAllColumn('canEdit', e.target.checked)}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                      </div>
                    </th>
                    <th style={{ textAlign: 'center', width: '120px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span>Delete</span>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isAllChecked('canDelete')}
                          onChange={(e) => handleToggleAllColumn('canDelete', e.target.checked)}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                      </div>
                    </th>
                    <th style={{ textAlign: 'center', width: '120px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span>Show In Home</span>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isAllChecked('showInHome')}
                          onChange={(e) => handleToggleAllColumn('showInHome', e.target.checked)}
                          style={{ width: '15px', height: '15px', cursor: 'pointer' }}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p, index) => (
                    <tr key={p.menuId}>
                      <td>{index + 1}</td>
                      <td>
                        <div
                          onClick={() => handleToggleRow(p.menuId)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            userSelect: 'none',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            transition: 'background-color 0.25s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <span style={{
                            fontWeight: p.isParent ? '600' : '500',
                            color: p.isParent ? 'var(--primary)' : 'var(--text-main)',
                            paddingLeft: p.isParent ? '0' : '1.25rem'
                          }}>
                            {p.isParent ? '' : '• '}{p.menuTitle}
                          </span>
                          <span style={{
                            fontSize: '0.725rem',
                            color: 'var(--text-muted)',
                            paddingLeft: p.isParent ? '0' : '1.25rem'
                          }}>
                            {p.menuPath}
                          </span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={p.canView}
                          onChange={() => handlePermissionChange(p.menuId, 'canView')}
                          style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={p.canAdd}
                          onChange={() => handlePermissionChange(p.menuId, 'canAdd')}
                          style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={p.canEdit}
                          onChange={() => handlePermissionChange(p.menuId, 'canEdit')}
                          style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={p.canDelete}
                          onChange={() => handlePermissionChange(p.menuId, 'canDelete')}
                          style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={p.showInHome}
                          onChange={() => handlePermissionChange(p.menuId, 'showInHome')}
                          style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Permission View */}
            <div className="mobile-permission-view" style={{ marginBottom: '1.5rem' }}>
              {/* Bulk Column Toggles for Mobile */}
              <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Toggle All Permissions:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[
                    { key: 'canView', label: 'View' },
                    { key: 'canAdd', label: 'Add' },
                    { key: 'canEdit', label: 'Edit' },
                    { key: 'canDelete', label: 'Delete' },
                    { key: 'showInHome', label: 'Home' }
                  ].map((col) => {
                    const checked = isAllChecked(col.key);
                    return (
                      <button
                        key={col.key}
                        type="button"
                        onClick={() => handleToggleAllColumn(col.key, !checked)}
                        style={{
                          fontSize: '0.7rem',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: checked ? 'var(--primary-glow)' : 'var(--bg-main)',
                          border: `1px solid ${checked ? 'var(--primary)' : 'var(--border-color)'}`,
                          color: checked ? 'var(--primary)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          fontWeight: checked ? '600' : 'normal',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.15rem'
                        }}
                      >
                        {checked && <span>✓ </span>}
                        <span>{col.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stacked Card list */}
              {permissions.map((p, index) => (
                <div
                  key={p.menuId}
                  className="glass-panel"
                  style={{
                    padding: '0.75rem',
                    borderRadius: '10px',
                    marginBottom: '0.75rem',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  {/* Card Header */}
                  <div
                    onClick={() => handleToggleRow(p.menuId)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      paddingBottom: '0.5rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{
                        fontSize: '0.8rem',
                        fontWeight: p.isParent ? '600' : '500',
                        color: p.isParent ? 'var(--primary)' : 'var(--text-main)',
                        paddingLeft: p.isParent ? '0' : '0.5rem'
                      }}>
                        {p.isParent ? '' : '• '}{p.menuTitle}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        color: 'var(--text-muted)',
                        paddingLeft: p.isParent ? '0' : '0.5rem'
                      }}>
                        {p.menuPath}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Toggle Row
                    </span>
                  </div>

                  {/* Checkbox Grid */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', padding: '0.25rem' }}>
                    {[
                      { key: 'canView', label: 'View' },
                      { key: 'canAdd', label: 'Add' },
                      { key: 'canEdit', label: 'Edit' },
                      { key: 'canDelete', label: 'Delete' },
                      { key: 'showInHome', label: 'Home' }
                    ].map(opt => (
                      <label
                        key={opt.key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          userSelect: 'none',
                          margin: 0
                        }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={p[opt.key]}
                          onChange={() => handlePermissionChange(p.menuId, opt.key)}
                          style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Bar Footer */}
            <div className="glass-panel sticky-footer" style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              borderRadius: '12px'
            }}>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={saving}
                onClick={() => setSelectedRoleId(selectedRoleId)} // triggers re-fetch
                style={{
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 1.1rem',
                  borderRadius: '6px'
                }}
              >
                <RotateCw size={15} />
                <span>Reset</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={saving}
                onClick={handleSave}
                style={{
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 1.25rem',
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
                    <span>Save Permissions</span>
                  </>
                )}
              </button>
            </div>
          </>
        )
      )}

      <style>{`
        .menu-permission-container select.form-control option {
          background-color: var(--bg-card) !important;
          color: var(--text-main) !important;
        }
        .menu-permission-container .form-check-input {
          background-color: var(--bg-main) !important;
          border: 1px solid var(--border-color) !important;
        }
        .menu-permission-container .form-check-input:checked {
          background-color: var(--primary) !important;
          border-color: var(--primary) !important;
        }
        .menu-permission-container .form-check-input:focus {
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
        .desktop-permission-view {
          display: block;
        }
        .mobile-permission-view {
          display: none;
        }
        .sticky-footer {
          position: sticky !important;
          bottom: 1rem;
          z-index: 100;
          box-shadow: 0 -8px 24px -6px rgba(0, 0, 0, 0.15) !important;
          backdrop-filter: blur(8px) !important;
          WebkitBackdropFilter: blur(8px) !important;
          border: 1px solid var(--border-color) !important;
          margin-top: 1.5rem !important;
        }
        @media (max-width: 768px) {
          .sticky-footer {
            bottom: 0.5rem;
            padding: 0.75rem 1rem !important;
            margin-top: 1rem !important;
          }
          .desktop-permission-view {
            display: none !important;
          }
          .mobile-permission-view {
            display: block !important;
          }
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
          .btn-primary, .btn-secondary {
            font-size: 0.75rem !important;
            padding: 0.35rem 0.75rem !important;
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

export default MenuPermission;
