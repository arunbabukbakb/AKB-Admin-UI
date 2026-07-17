import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, AlertCircle, CheckCircle, Loader, RotateCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { Modal } from 'react-bootstrap';
import apiService from '../../services/api';
import '../../pages/Pages.css';

const GenericCRUD = ({
  title = 'Master',
  apiUrl,
  columns = [],
  fields = [],
  idField = 'id',
  searchPlaceholder = 'Search records...',
  modalWidth,
  modalSize = 'md'
}) => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search & Modal states
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [dynamicOptions, setDynamicOptions] = useState({});
  const showToastNotification = (message, type = 'success') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const cacheKey = `crud_cache_${apiUrl}`;

  // Seeding initial fallback data in localStorage if offline
  const getFallbackData = () => {
    const stored = localStorage.getItem(cacheKey);
    return stored ? JSON.parse(stored) : [];
  };

  const saveFallbackData = (data) => {
    localStorage.setItem(cacheKey, JSON.stringify(data));
  };

  // Map sm, md, lg, xl sizes to React Bootstrap Modal sizes
  const getModalSize = () => {
    if (modalSize === 'xl') return 'xl';
    if (modalSize === 'lg') return 'lg';
    if (modalSize === 'sm') return 'sm';
    return undefined; // default md
  };

  // Fetch Items
  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.get(apiUrl);

      // Resilient array parsing
      let parsedList = [];
      if (Array.isArray(data)) {
        parsedList = data;
      } else if (data && Array.isArray(data.data)) {
        parsedList = data.data;
      } else if (data && typeof data === 'object') {
        const foundArray = Object.values(data).find(val => Array.isArray(val));
        if (foundArray) parsedList = foundArray;
      }

      setList(parsedList);
      saveFallbackData(parsedList);
    } catch (err) {
      console.warn(`Generic API Fetch to /${apiUrl} failed, loading fallback data:`, err.message);
      const fallback = getFallbackData();
      setList(fallback);
      if (fallback.length === 0) {
        setError(`Failed to retrieve data from API. Please verify endpoint state.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [apiUrl]);

  // Load dynamic select options from API
  useEffect(() => {
    fields.forEach(async (f) => {
      if (f.optionsUrl) {
        try {
          const data = await apiService.get(f.optionsUrl);

          let parsedList = [];
          if (Array.isArray(data)) {
            parsedList = data;
          } else if (data && Array.isArray(data.data)) {
            parsedList = data.data;
          } else if (data && typeof data === 'object') {
            const foundArray = Object.values(data).find(val => Array.isArray(val));
            if (foundArray) parsedList = foundArray;
          }

          const mappedOptions = parsedList.map((item) => ({
            value: item[f.optionValue || 'id'],
            label: item[f.optionLabel || 'name']
          }));

          setDynamicOptions((prev) => ({
            ...prev,
            [f.name]: mappedOptions
          }));
        } catch (err) {
          console.warn(`Generic option loading from /${f.optionsUrl} failed:`, err.message);
          // Auto fallback mapping for standard Role objects
          if (f.optionsUrl === 'Role') {
            const stored = localStorage.getItem('crud_roles');
            const cachedRoles = stored ? JSON.parse(stored) : [];
            const mapped = cachedRoles.map(item => ({
              value: item.id,
              label: item.name
            }));
            setDynamicOptions((prev) => ({ ...prev, [f.name]: mapped }));
          }
        }
      }
    });
  }, [fields]);

  // Resolve options list dynamically (static array, local list filter, or endpoint data)
  const getFieldOptions = (f) => {
    if (f.options) return f.options;

    if (f.optionsFromSelf) {
      const selfMapped = list
        .filter(item => {
          if (f.selfFilter) return f.selfFilter(item);
          return true;
        })
        .map(item => ({
          value: item[f.selfValue || 'id'].toString(),
          label: item[f.selfLabel || 'name']
        }));

      if (f.noneOption) {
        return [f.noneOption, ...selfMapped];
      }
      return selfMapped;
    }

    return dynamicOptions[f.name] || [];
  };

  // Handle local base64 file loads
  const handleFileChange = (fieldName, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: e.target.result // base64 string
      }));
    };
    reader.readAsDataURL(file);
  };

  // Form Initializations
  const getInitialFormData = () => {
    const initial = {};
    fields.forEach((f) => {
      if (f.defaultValue !== undefined) {
        if (f.type === 'boolean' || f.dataType === 'boolean') {
          initial[f.name] = f.defaultValue === 'true' || f.defaultValue === true;
        } else {
          initial[f.name] = f.defaultValue;
        }
      } else if (f.type === 'boolean' || f.dataType === 'boolean') {
        initial[f.name] = false;
      } else {
        initial[f.name] = '';
      }
    });
    return initial;
  };

  const handleOpenAddModal = () => {
    setFormData(getInitialFormData());
    setErrorMsg('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item) => {
    setSelectedItem(item);
    const initial = {};
    fields.forEach((f) => {
      if (item[f.name] !== undefined) {
        if (f.type === 'boolean' || f.dataType === 'boolean') {
          initial[f.name] = item[f.name] === true || item[f.name] === 'true';
        } else {
          initial[f.name] = item[f.name];
        }
      } else {
        initial[f.name] = f.type === 'boolean' || f.dataType === 'boolean' ? false : '';
      }
    });
    setFormData(initial);
    setErrorMsg('');
    setShowEditModal(true);
  };

  const handleOpenDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Operations
  const handleSubmit = async (e, isEdit) => {
    e.preventDefault();
    setErrorMsg('');

    // Pre-parse numerical and boolean entries
    const parsedData = { ...formData };
    fields.forEach((f) => {
      if ((f.type === 'number' || f.dataType === 'number') && parsedData[f.name] !== '') {
        parsedData[f.name] = parseFloat(parsedData[f.name]);
      } else if (f.type === 'boolean' || f.dataType === 'boolean') {
        parsedData[f.name] = parsedData[f.name] === 'true' || parsedData[f.name] === true;
      }
    });

    const currentId = isEdit ? selectedItem[idField] : 0;

    try {
      const response = await apiService.post(apiUrl, {
        [idField]: currentId,
        ...parsedData
      });

      if (response && 'systemMessage' in response) {
        console.log('System Message:', response.systemMessage);
      }

      if (response && response.status === false) {
        showToastNotification(response.message || 'Operation failed', 'danger');
        return;
      }

      showToastNotification(response.message || 'Record saved successfully!', 'success');
      await loadItems();
      if (isEdit) {
        setShowEditModal(false);
      } else {
        setShowAddModal(false);
      }
    } catch (err) {
      console.warn(`Generic API Post failed, executing local fallback:`, err.message);

      const response = err.response?.data;
      if (response && 'systemMessage' in response) {
        console.log('System error details:', response.systemMessage);
      }

      if (response && response.status === false) {
        showToastNotification(response.message || 'Operation failed', 'danger');
        return;
      }

      if (isEdit) {
        // Local fallback for Edit
        const updatedList = list.map((item) =>
          item[idField] === selectedItem[idField] ? { ...item, ...parsedData } : item
        );
        setList(updatedList);
        saveFallbackData(updatedList);
        setShowEditModal(false);
      } else {
        // Local fallback for Add
        const localList = [...list];
        const maxId = localList.length > 0 ? Math.max(...localList.map(item => parseInt(item[idField]) || 0)) : 0;
        const newLocalItem = {
          [idField]: maxId + 1,
          ...parsedData
        };
        localList.push(newLocalItem);
        setList(localList);
        saveFallbackData(localList);
        setShowAddModal(false);
      }
      showToastNotification('Record saved locally (offline).', 'success');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await apiService.delete(`${apiUrl}/${selectedItem[idField]}`);

      if (response && 'systemMessage' in response) {
        console.log('System Message:', response.systemMessage);
      }

      if (response && response.status === false) {
        showToastNotification(response.message || 'Delete operation failed', 'danger');
        return;
      }

      showToastNotification(response.message || 'Record deleted successfully!', 'success');
      setList((prev) => prev.filter((item) => item[idField] !== selectedItem[idField]));
      saveFallbackData(list.filter((item) => item[idField] !== selectedItem[idField]));
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (err) {
      console.warn(`Generic API Delete failed, removing local fallback:`, err.message);

      const response = err.response?.data;
      if (response && 'systemMessage' in response) {
        console.log('System error details:', response.systemMessage);
      }

      if (response && response.status === false) {
        showToastNotification(response.message || 'Delete operation failed', 'danger');
        return;
      }

      // Local fallback
      const updatedList = list.filter((item) => item[idField] !== selectedItem[idField]);
      setList(updatedList);
      saveFallbackData(updatedList);
      setShowDeleteModal(false);
      setSelectedItem(null);
      showToastNotification('Record removed locally.', 'success');
    }
  };

  // Search Filter
  const filteredList = list.filter((item) => {
    if (!searchTerm) return true;
    return fields.some((f) => {
      const value = item[f.name];
      if (value === undefined || value === null) return false;
      return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div>
      {/* Search & Actions Toolbar */}
      {/* Search & Actions Toolbar */}
      <div className="users-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', flexWrap: 'nowrap', marginBottom: '1rem' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '0', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            type="text"
            className="form-control search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              height: '32px',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem 0.25rem 2.25rem',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              borderRadius: '6px',
              width: '100%'
            }}
          />
        </div>
        <div className="toolbar-actions" style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadItems}
            disabled={loading}
            title="Reload Data"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              height: '32px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              borderRadius: '6px'
            }}
          >
            <RotateCw size={14} className={loading ? 'spin' : ''} />
            <span className="toolbar-btn-text">Refresh</span>
          </button>
          <button
            className="btn btn-primary"
            onClick={handleOpenAddModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              height: '32px',
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              borderRadius: '6px'
            }}
          >
            <Plus size={14} />
            <span className="toolbar-btn-text">Add {title}</span>
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem' }}>
          <Loader className="spin" size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
        </div>
      )}

      {error && !loading && (
        <div className="auth-error-box" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Data Table */}
      {/* Desktop Table View */}
      <div className="desktop-table-view table-container">
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filteredList.length > 0 ? (
              filteredList.map((item, index) => (
                <tr key={item[idField]}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item, index) : item[col.key]}
                    </td>
                  ))}
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="action-btn edit"
                        onClick={() => handleOpenEditModal(item)}
                        title={`Edit ${title}`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="action-btn delete"
                        onClick={() => handleOpenDeleteModal(item)}
                        title={`Delete ${title}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : !loading ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No records found matching "{searchTerm}"
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="mobile-card-list-view" style={{ padding: '0.25rem' }}>
        {!loading && filteredList.length > 0 ? (
          filteredList.map((item, index) => (
            <div
              key={item[idField]}
              className="glass-panel mobile-record-card"
              style={{
                padding: '1rem',
                borderRadius: '12px',
                marginBottom: '1rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary)' }}>
                  Record #{index + 1}
                </span>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="action-btn edit"
                    onClick={() => handleOpenEditModal(item)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--text-main)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={`Edit ${title}`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="action-btn delete"
                    onClick={() => handleOpenDeleteModal(item)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: 'var(--danger)',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={`Delete ${title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Card Body Key-Value pairs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {columns.map((col) => {
                  // Skip index/serial column on card because we display Record #index+1
                  if (col.key === 'serialNumber' || col.key === 'sno') return null;

                  return (
                    <div key={col.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', fontSize: '0.825rem' }}>
                      <span style={{ fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.775rem', flexShrink: 0 }}>
                        {col.label}:
                      </span>
                      <span style={{ textAlign: 'right', color: 'var(--text-main)', fontWeight: '500', wordBreak: 'break-all' }}>
                        {col.render ? col.render(item[col.key], item, index) : item[col.key]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : !loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', borderRadius: '12px', border: '1px dashed var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            No records found matching "{searchTerm}"
          </div>
        ) : null}
      </div>

      {/* --- ADD MODAL (BOOTSTRAP MODAL) --- */}
      <Modal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        size={getModalSize()}
        centered
        backdropClassName="custom-modal-backdrop"
        contentClassName="glass-panel custom-modal-content"
        style={{ zIndex: 2050 }}
      >
        <Modal.Header closeButton style={{ padding: '0.75rem 1.25rem' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 600 }}>Add {title}</Modal.Title>
        </Modal.Header>

        <form onSubmit={(e) => handleSubmit(e, false)} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <Modal.Body style={{ padding: '1rem 1.25rem', overflowY: 'auto' }}>
            {errorMsg && (
              <div className="auth-error-box" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="modal-form-grid">
              {fields.map((f) => (
                <div
                  className="form-group"
                  key={f.name}
                  style={{ gridColumn: `span ${f.gridSize || 12}` }}
                >
                  <label className="form-label" htmlFor={`add-${f.name}`}>{f.label}</label>

                  {f.type === 'boolean' || f.dataType === 'boolean' || f.type === 'checkbox' ? (
                    <div style={{ display: 'flex', alignItems: 'center', height: '34px' }}>
                      <input
                        id={`add-${f.name}`}
                        type="checkbox"
                        className="form-check-input"
                        checked={!!formData[f.name]}
                        onChange={(e) => setFormData({ ...formData, [f.name]: e.target.checked })}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  ) : f.type === 'select' || f.optionsUrl || f.optionsFromSelf ? (
                    <select
                      id={`add-${f.name}`}
                      className="form-control"
                      value={formData[f.name] !== undefined && formData[f.name] !== null ? formData[f.name].toString() : ''}
                      onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                      required={f.required}
                    >
                      <option value="">Select option</option>
                      {getFieldOptions(f).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      id={`add-${f.name}`}
                      className="form-control"
                      placeholder={f.placeholder}
                      value={formData[f.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                      required={f.required}
                      rows={3}
                    />
                  ) : f.type === 'file' ? (
                    <div>
                      <input
                        id={`add-${f.name}`}
                        type="file"
                        className="form-control text-light"
                        accept={f.accept || "image/*"}
                        onChange={(e) => handleFileChange(f.name, e.target.files[0])}
                        required={f.required}
                      />
                      {formData[f.name] && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uploaded</span>
                          {formData[f.name].toString().startsWith('data:image') && (
                            <img
                              src={formData[f.name]}
                              alt="preview"
                              style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      id={`add-${f.name}`}
                      type={f.type}
                      className="form-control"
                      placeholder={f.placeholder}
                      value={formData[f.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                      required={f.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </Modal.Body>

          <Modal.Footer style={{ padding: '0.75rem 1.25rem', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* --- EDIT MODAL (BOOTSTRAP MODAL) --- */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size={getModalSize()}
        centered
        backdropClassName="custom-modal-backdrop"
        contentClassName="glass-panel custom-modal-content"
        style={{ zIndex: 2050 }}
      >
        <Modal.Header closeButton style={{ padding: '0.75rem 1.25rem' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 600 }}>Edit {title} Details</Modal.Title>
        </Modal.Header>

        <form onSubmit={(e) => handleSubmit(e, true)} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <Modal.Body style={{ padding: '1rem 1.25rem', overflowY: 'auto' }}>
            {errorMsg && (
              <div className="auth-error-box" style={{ marginBottom: '1rem' }}>
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="modal-form-grid">
              {fields.map((f) => (
                <div
                  className="form-group"
                  key={f.name}
                  style={{ gridColumn: `span ${f.gridSize || 12}` }}
                >
                  <label className="form-label" htmlFor={`edit-${f.name}`}>{f.label}</label>

                  {f.type === 'boolean' || f.dataType === 'boolean' || f.type === 'checkbox' ? (
                    <div style={{ display: 'flex', alignItems: 'center', height: '34px' }}>
                      <input
                        id={`edit-${f.name}`}
                        type="checkbox"
                        className="form-check-input"
                        checked={!!formData[f.name]}
                        onChange={(e) => setFormData({ ...formData, [f.name]: e.target.checked })}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  ) : f.type === 'select' || f.optionsUrl || f.optionsFromSelf ? (
                    <select
                      id={`edit-${f.name}`}
                      className="form-control"
                      value={formData[f.name] !== undefined && formData[f.name] !== null ? formData[f.name].toString() : ''}
                      onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                      required={f.required}
                    >
                      <option value="">Select option</option>
                      {getFieldOptions(f).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea
                      id={`edit-${f.name}`}
                      className="form-control"
                      value={formData[f.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                      required={f.required}
                      rows={3}
                    />
                  ) : f.type === 'file' ? (
                    <div>
                      <input
                        id={`edit-${f.name}`}
                        type="file"
                        className="form-control text-light"
                        accept={f.accept || "image/*"}
                        onChange={(e) => handleFileChange(f.name, e.target.files[0])}
                      />
                      {formData[f.name] && (
                        <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uploaded</span>
                          {formData[f.name].toString().startsWith('data:image') && (
                            <img
                              src={formData[f.name]}
                              alt="preview"
                              style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      id={`edit-${f.name}`}
                      type={f.type}
                      className="form-control"
                      value={formData[f.name] || ''}
                      onChange={(e) => setFormData({ ...formData, [f.name]: e.target.value })}
                      required={f.required}
                    />
                  )}
                </div>
              ))}
            </div>
          </Modal.Body>

          <Modal.Footer style={{ padding: '0.75rem 1.25rem', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* --- DELETE CONFIRMATION MODAL (BOOTSTRAP MODAL) --- */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
        backdropClassName="custom-modal-backdrop"
        contentClassName="glass-panel custom-modal-content"
        style={{ zIndex: 2050 }}
      >
        <Modal.Header closeButton style={{ padding: '0.75rem 1.25rem' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--danger)' }}>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '1.25rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
          <p style={{ margin: 0, lineHeight: 1.5 }}>
            Are you sure you want to permanently delete this {title} record? This operation cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer style={{ padding: '0.75rem 1.25rem', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDeleteConfirm}>
            Delete Record
          </button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .custom-modal-backdrop {
          background-color: rgba(0, 0, 0, 0.6) !important;
          backdrop-filter: blur(4px) !important;
          -webkit-backdrop-filter: blur(4px) !important;
          opacity: 1 !important;
        }
        .custom-modal-content {
          border-radius: 12px !important;
          border: 1px solid var(--border-color) !important;
          max-height: 85vh !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.3) !important;
        }
        .modal-header {
          border-bottom: 1px solid var(--border-color) !important;
          background-color: var(--bg-card) !important;
          color: var(--text-main) !important;
          flex-shrink: 0 !important;
        }
        .modal-body {
          background-color: var(--bg-card) !important;
          color: var(--text-main) !important;
          overflow-y: auto !important;
          flex: 1 !important;
        }
        .modal-footer {
          border-top: 1px solid var(--border-color) !important;
          background-color: var(--bg-card) !important;
          color: var(--text-main) !important;
          flex-shrink: 0 !important;
        }
        .modal-form-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 0.65rem;
        }
        .modal-form-grid .form-group {
          margin-bottom: 0 !important;
        }
        .modal-form-grid .form-label {
          font-size: 0.775rem !important;
          margin-bottom: 0.2rem !important;
          font-weight: 500 !important;
          color: var(--text-main) !important;
        }
        .modal-form-grid .form-control {
          padding: 0.4rem 0.6rem !important;
          font-size: 0.825rem !important;
          height: 34px !important;
          border-radius: 6px !important;
          background-color: var(--bg-main) !important;
          border: 1px solid var(--border-color) !important;
          color: var(--text-main) !important;
        }
        .modal-form-grid .form-control:focus {
          outline: none !important;
          border-color: var(--primary) !important;
          box-shadow: 0 0 0 2px var(--primary-glow) !important;
        }
        .modal-form-grid select.form-control option {
          background-color: var(--bg-card) !important;
          color: var(--text-main) !important;
        }
        .modal-form-grid textarea.form-control {
          height: auto !important;
          padding: 0.4rem 0.6rem !important;
        }
        .modal-form-grid div > input[type="file"] {
          padding: 0.25rem 0.5rem !important;
          height: 34px !important;
          font-size: 0.75rem !important;
        }
        .modal-form-grid .form-check-input {
          background-color: var(--bg-main) !important;
          border: 1px solid var(--border-color) !important;
        }
        .modal-form-grid .form-check-input:checked {
          background-color: var(--primary) !important;
          border-color: var(--primary) !important;
        }
        .modal-form-grid .form-check-input:focus {
          box-shadow: 0 0 0 2px var(--primary-glow) !important;
          border-color: var(--primary) !important;
        }
        
        /* Dark mode support close button */
        [data-theme="dark"] .btn-close,
        [data-theme="midnight"] .btn-close,
        [data-theme="carbon"] .btn-close {
          filter: invert(1) grayscale(1) brightness(2) !important;
        }

        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 576px) {
          .modal-form-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 0.65rem !important;
          }
          .modal-form-grid > .form-group {
            grid-column: span 12 !important;
          }
          
          /* Compact toolbar actions */
          .users-toolbar {
            flex-direction: row !important;
            gap: 0.35rem !important;
            padding: 0.25rem 0 !important;
          }
          .toolbar-btn-text {
            display: none !important;
          }
          .toolbar-actions {
            margin-top: 0 !important;
          }
          .toolbar-actions .btn {
            width: 32px !important;
            height: 32px !important;
            padding: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        }

        /* Responsive Table styling */
        .desktop-table-view {
          display: block;
        }
        .mobile-card-list-view {
          display: none;
        }
        @media (max-width: 767px) {
          .desktop-table-view {
            display: none !important;
          }
          .mobile-card-list-view {
            display: block !important;
          }
        }
      `}</style>


    </div>
  );
};

export default GenericCRUD;
