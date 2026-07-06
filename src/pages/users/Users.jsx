import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Key, AlertCircle, CheckCircle, Loader, Upload, X } from 'lucide-react';
import apiService from '../../services/api';
import GenericCRUD from '../../components/Common/GenericCRUD';

const Users = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const getPhotoUrl = (rawPhoto) => {
    if (!rawPhoto) return "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80";
    if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://') || rawPhoto.startsWith('data:')) {
      return rawPhoto;
    }
    const base = import.meta.env.VITE_USER_PHOTO_URL || 'https://localhost:7245/upload/user/photo/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = rawPhoto.startsWith('/') ? rawPhoto.slice(1) : rawPhoto;
    return `${cleanBase}${cleanPath}`;
  };

  const getSignUrl = (rawSign) => {
    if (!rawSign) return "";
    if (rawSign.startsWith('http://') || rawSign.startsWith('https://') || rawSign.startsWith('data:')) {
      return rawSign;
    }
    const base = import.meta.env.VITE_USER_SIGN_URL || 'https://localhost:7245/upload/user/sign/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = rawSign.startsWith('/') ? rawSign.slice(1) : rawSign;
    return `${cleanBase}${cleanPath}`;
  };

  // Password Reset states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Photo & Sign Upload states
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [signFile, setSignFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [signPreview, setSignPreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');

  const handleOpenPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setShowPasswordModal(true);
  };

  const handleClosePasswordModal = () => {
    if (loading) return;
    setShowPasswordModal(false);
    setSelectedUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiService.post('User/update-password', {
        userId: Number(selectedUser.id),
        newPassword: newPassword
      });
      setSuccessMsg('Password updated successfully!');
      setTimeout(() => {
        setShowPasswordModal(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to update password:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to update password. Please try again.';
      setErrorMsg(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPhotoModal = (user) => {
    setSelectedUser(user);
    setPhotoFile(null);
    setSignFile(null);
    setPhotoPreview(getPhotoUrl(user.photoFile || user.photo));
    setSignPreview(getSignUrl(user.signFile || user.sign));
    setPhotoError('');
    setPhotoSuccess('');
    setShowPhotoModal(true);
  };

  const handleClosePhotoModal = () => {
    if (uploadingPhoto) return;
    setShowPhotoModal(false);
    setSelectedUser(null);
    setPhotoFile(null);
    setSignFile(null);
    setPhotoPreview('');
    setSignPreview('');
    setPhotoError('');
    setPhotoSuccess('');
  };

  const handlePhotoSubmit = async (e) => {
    e.preventDefault();
    setPhotoError('');
    setPhotoSuccess('');

    if (!photoFile && !signFile) {
      setPhotoError('Please select at least one file to upload (Photo or Signature).');
      return;
    }

    setUploadingPhoto(true);
    const uploadData = new FormData();
    uploadData.append('UserId', selectedUser.id.toString());
    if (photoFile) uploadData.append('Photo', photoFile);
    if (signFile) uploadData.append('Sign', signFile);

    try {
      const response = await apiService.post('User/upload-photo-sign', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response && response.status === false) {
        setPhotoError(response.message || 'Failed to upload files.');
        return;
      }

      setPhotoSuccess(response.message || 'Photo and Signature uploaded successfully!');
      setRefreshKey(prev => prev + 1); // trigger reload of GenericCRUD
      setTimeout(() => {
        setShowPhotoModal(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to upload photo and signature:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to upload files. Please try again.';
      setPhotoError(errMsg);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const columns = [
    {
      key: 'serialNumber',
      label: 'S.No',
      render: (val, row, index) => index + 1
    },
    {
      key: 'userName',
      label: 'Username / Nickname',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src={getPhotoUrl(row.photoFile || row.photo)}
            alt={val}
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
          />
          <div>
            <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.nickName || 'No Nickname'}</div>
          </div>
        </div>
      )
    },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone Number' },
    {
      key: 'roleName',
      label: 'Role',
      render: (val) => (
        <span className="status-badge user" style={{ fontSize: '0.8rem' }}>
          {val}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <span className={`status-badge ${val ? 'active' : 'inactive'}`}>
          {val ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (val, row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleOpenPasswordModal(row)}
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: 'var(--warning)',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
            }}
          >
            <Key size={13} />
            <span>Password</span>
          </button>

          <button
            type="button"
            className="btn btn-sm"
            onClick={() => handleOpenPhotoModal(row)}
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.6rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              color: '#0ea5e9',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
            }}
          >
            <Upload size={13} />
            <span>Photo/Sign</span>
          </button>
        </div>
      )
    }
  ];

  const fields = [
    { name: 'nickName', label: 'Name', type: 'text', required: false, placeholder: 'E.g. Jimmy', gridSize: 4 },
    { name: 'userName', label: 'Username', type: 'text', required: true, placeholder: 'E.g. jsmith', gridSize: 4 },
    { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'smith@example.com', gridSize: 4 },
    { name: 'phoneNumber', label: 'Phone Number', type: 'text', required: true, placeholder: 'E.g. +1234567890', gridSize: 4 },
    {
      name: 'roleId',
      label: 'Select User Role',
      type: 'select',
      required: true,
      optionsUrl: 'Role',
      optionValue: 'id',
      optionLabel: 'name',
      gridSize: 4
    },
    {
      name: 'status',
      label: 'User Status',
      type: 'boolean',
      required: true,
      defaultValue: true,
      gridSize: 4
    },
    { name: 'address', label: 'Address Details', type: 'textarea', required: false, placeholder: 'Street, City, Country...', gridSize: 12 }
  ];

  return (
    <>
      <GenericCRUD
        key={refreshKey}
        title="User"
        apiUrl="User"
        columns={columns}
        fields={fields}
        searchPlaceholder="Search users by name, email, or phone..."
        modalSize="xl"
      />

      {/* Password Reset Modal */}
      <Modal
        show={showPasswordModal}
        onHide={handleClosePasswordModal}
        centered
        backdropClassName="custom-modal-backdrop"
        contentClassName="glass-panel custom-modal-content"
        style={{ zIndex: 2050 }}
      >
        <Modal.Header closeButton style={{ padding: '0.75rem 1.25rem' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} className="text-warning" />
            <span>Reset Password for {selectedUser?.userName || 'User'}</span>
          </Modal.Title>
        </Modal.Header>

        <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <Modal.Body style={{ padding: '1.25rem', overflowY: 'auto' }}>
            {errorMsg && (
              <div className="auth-error-box" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.85rem' }}>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="auth-success-box" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: 'var(--success, #22c55e)' }}>
                <CheckCircle size={16} />
                <span style={{ fontSize: '0.85rem' }}>{successMsg}</span>
              </div>
            )}

            <div className="form-group mb-3">
              <label className="form-label" htmlFor="new-password" style={{ fontSize: '0.775rem', marginBottom: '0.3rem', fontWeight: 500, display: 'block', color: 'var(--text-main)' }}>
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                className="form-control"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading || !!successMsg}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  width: '100%'
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password" style={{ fontSize: '0.775rem', marginBottom: '0.3rem', fontWeight: 500, display: 'block', color: 'var(--text-main)' }}>
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                type="password"
                className="form-control"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading || !!successMsg}
                style={{
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.875rem',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-main)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-main)',
                  width: '100%'
                }}
              />
            </div>
          </Modal.Body>

          <Modal.Footer style={{ padding: '0.75rem 1.25rem', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClosePasswordModal}
              disabled={loading}
              style={{
                fontSize: '0.825rem',
                padding: '0.4rem 1rem',
                borderRadius: '6px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !!successMsg}
              style={{
                fontSize: '0.825rem',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <Loader className="spin" size={14} />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Photo & Signature Upload Modal */}
      <Modal
        show={showPhotoModal}
        onHide={handleClosePhotoModal}
        centered
        backdropClassName="custom-modal-backdrop"
        contentClassName="glass-panel custom-modal-content"
        style={{ zIndex: 2050 }}
      >
        <Modal.Header closeButton style={{ padding: '0.75rem 1.25rem' }}>
          <Modal.Title style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={18} className="text-info" />
            <span>Upload Photo & Sign for {selectedUser?.userName || 'User'}</span>
          </Modal.Title>
        </Modal.Header>

        <form onSubmit={handlePhotoSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
          <Modal.Body style={{ padding: '1.25rem', overflowY: 'auto' }}>
            {photoError && (
              <div className="auth-error-box" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.85rem' }}>{photoError}</span>
              </div>
            )}

            {photoSuccess && (
              <div className="auth-success-box" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: 'var(--success, #22c55e)' }}>
                <CheckCircle size={16} />
                <span style={{ fontSize: '0.85rem' }}>{photoSuccess}</span>
              </div>
            )}

            <div className="row g-3">
              {/* Photo Input & Preview */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-main)' }}>User Photo</label>
                <div style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '0.75rem'
                }}>
                  {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="Photo preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : photoPreview ? (
                    <img src={photoPreview} alt="User current photo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No photo loaded</span>
                  )}
                </div>
                <input
                  type="file"
                  className="form-control text-light"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setPhotoFile(file);
                  }}
                  disabled={uploadingPhoto || !!photoSuccess}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>

              {/* Signature Input & Preview */}
              <div className="col-md-6">
                <label className="form-label" style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-main)' }}>User Signature</label>
                <div style={{
                  width: '100%',
                  height: '140px',
                  borderRadius: '8px',
                  border: '1px dashed var(--border-color)',
                  backgroundColor: 'var(--bg-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  marginBottom: '0.75rem'
                }}>
                  {signFile ? (
                    <img src={URL.createObjectURL(signFile)} alt="Signature preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : signPreview ? (
                    <img src={signPreview} alt="User current signature" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No signature loaded</span>
                  )}
                </div>
                <input
                  type="file"
                  className="form-control text-light"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setSignFile(file);
                  }}
                  disabled={uploadingPhoto || !!photoSuccess}
                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                />
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer style={{ padding: '0.75rem 1.25rem', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClosePhotoModal}
              disabled={uploadingPhoto}
              style={{
                fontSize: '0.825rem',
                padding: '0.4rem 1rem',
                borderRadius: '6px'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploadingPhoto || (!photoFile && !signFile) || !!photoSuccess}
              style={{
                fontSize: '0.825rem',
                padding: '0.4rem 1rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {uploadingPhoto ? (
                <>
                  <Loader className="spin" size={14} />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Profile</span>
              )}
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </>
  );
};

export default Users;
