import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User, Mail, Phone, Tag, MapPin,
  Camera, PenLine, Lock, Upload,
  AlertCircle, CheckCircle, Loader,
  Eye, EyeOff
} from 'lucide-react';
import apiService from '../../services/api';
import { loginSuccess } from '../../store/authSlice';
import '../Pages.css';

// ─── helpers ──────────────────────────────────────────────────────────────────

const getPhotoUrl = (rawPhoto) => {
  if (!rawPhoto) return null;
  if (rawPhoto.startsWith('http://') || rawPhoto.startsWith('https://') || rawPhoto.startsWith('data:')) return rawPhoto;
  const base = import.meta.env.VITE_USER_PHOTO_URL || 'https://localhost:7245/upload/user/photo/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${rawPhoto.startsWith('/') ? rawPhoto.slice(1) : rawPhoto}`;
};

const getSignUrl = (rawSign) => {
  if (!rawSign) return null;
  if (rawSign.startsWith('http://') || rawSign.startsWith('https://') || rawSign.startsWith('data:')) return rawSign;
  const base = import.meta.env.VITE_USER_SIGN_URL || 'https://localhost:7245/upload/user/sign/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${rawSign.startsWith('/') ? rawSign.slice(1) : rawSign}`;
};

const inputStyle = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  borderRadius: '8px',
  backgroundColor: 'var(--bg-main)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-main)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '0.35rem',
  display: 'block',
};

const sectionCardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '1.75rem',
  marginBottom: '1.5rem',
  boxShadow: 'var(--card-shadow)',
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  marginBottom: '1.5rem',
  paddingBottom: '1rem',
  borderBottom: '1px solid var(--border-color)',
};

const AlertBox = ({ type, message }) => {
  if (!message) return null;
  const isSuccess = type === 'success';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      borderRadius: '8px',
      backgroundColor: isSuccess ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${isSuccess ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
      color: isSuccess ? '#22c55e' : 'var(--danger)',
      fontSize: '0.85rem',
      marginBottom: '1rem',
      whiteSpace: 'pre-line',
    }}>
      {isSuccess ? <CheckCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} /> : <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />}
      <span>{message}</span>
    </div>
  );
};

// ─── Profile Page ─────────────────────────────────────────────────────────────

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // ── Section 1: Photo & Sign ──────────────────────────────────────────────
  const [photoFile, setPhotoFile] = useState(null);
  const [signFile, setSignFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [signPreview, setSignPreview] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState('');
  const [mediaSuccess, setMediaSuccess] = useState('');
  const photoInputRef = useRef();
  const signInputRef = useRef();

  // ── Section 2: Basic Info ────────────────────────────────────────────────
  const [basicForm, setBasicForm] = useState({
    nickName: '', userName: '', email: '', phoneNumber: '', address: ''
  });
  const [savingBasic, setSavingBasic] = useState(false);
  const [basicError, setBasicError] = useState('');
  const [basicSuccess, setBasicSuccess] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  // ── Section 3: Password ──────────────────────────────────────────────────
  const [pwdForm, setPwdForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  // ── Resolve user ID from multiple possible field names ──────────────────
  const userId = user?.id ?? user?.userId ?? user?.Id ?? user?.UserId;

  // ── Load user data on mount ──────────────────────────────────────────────
  useEffect(() => {
    // Always populate immediately from Redux store so form is never empty
    setBasicForm({
      nickName: user?.nickName || '',
      userName: user?.userName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      address: user?.address || '',
    });
    setPhotoPreview(getPhotoUrl(user?.photoFile || user?.photo) || '');
    setSignPreview(getSignUrl(user?.signFile || user?.sign) || '');

    if (!userId) {
      setProfileLoading(false);
      return;
    }

    // Then try to fetch fresher data from the API
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const resp = await apiService.get(`User/${userId}`);
        // Handle both { data: {...} } and flat object responses
        const data = (resp?.data && typeof resp.data === 'object' && !Array.isArray(resp.data))
          ? resp.data
          : (typeof resp === 'object' && !Array.isArray(resp) ? resp : null);

        if (data && (data.userName || data.nickName || data.email)) {
          setBasicForm({
            nickName: data.nickName ?? user?.nickName ?? '',
            userName: data.userName ?? user?.userName ?? '',
            email: data.email ?? user?.email ?? '',
            phoneNumber: data.phoneNumber ?? user?.phoneNumber ?? '',
            address: data.address ?? user?.address ?? '',
          });
          if (data.photoFile || data.photo)
            setPhotoPreview(getPhotoUrl(data.photoFile || data.photo) || '');
          if (data.signFile || data.sign)
            setSignPreview(getSignUrl(data.signFile || data.sign) || '');
        }
      } catch (err) {
        // Store values already populated above — nothing extra to do
        console.warn('Profile API fetch failed, using store values:', err.message);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Avatar src – prefer live preview or current stored photo
  const avatarSrc =
    (photoFile && URL.createObjectURL(photoFile)) ||
    photoPreview ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.nickName || user?.userName || 'U')}&background=6366f1&color=fff&size=128`;

  // ── Section 1 handlers ───────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoFile(file);
    setMediaError(''); setMediaSuccess('');
  };

  const handleSignChange = (e) => {
    const file = e.target.files[0];
    if (file) setSignFile(file);
    setMediaError(''); setMediaSuccess('');
  };

  const handleMediaSubmit = async (e) => {
    e.preventDefault();
    setMediaError(''); setMediaSuccess('');

    if (!photoFile && !signFile) {
      setMediaError('Please select at least one file to upload (Photo or Signature).');
      return;
    }

    setUploadingMedia(true);
    const formData = new FormData();
    formData.append('UserId', userId.toString());
    if (photoFile) formData.append('Photo', photoFile);
    if (signFile) formData.append('Sign', signFile);

    try {
      const resp = await apiService.post('User/upload-photo-sign', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (resp?.status === false) {
        setMediaError(resp.message || 'Upload failed.');
        return;
      }

      setMediaSuccess(resp?.message || 'Photo and signature uploaded successfully!');
      // Clear file selections
      setPhotoFile(null);
      setSignFile(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
      if (signInputRef.current) signInputRef.current.value = '';
    } catch (err) {
      setMediaError(err.message || 'Failed to upload files. Please try again.');
    } finally {
      setUploadingMedia(false);
    }
  };

  // ── Section 2 handlers ───────────────────────────────────────────────────
  const handleBasicChange = (field) => (e) => {
    setBasicForm((prev) => ({ ...prev, [field]: e.target.value }));
    setBasicError(''); setBasicSuccess('');
  };

  const handleBasicSubmit = async (e) => {
    e.preventDefault();
    setBasicError(''); setBasicSuccess('');

    if (!basicForm.userName.trim()) {
      setBasicError('Username is required.');
      return;
    }

    setSavingBasic(true);
    try {
      const resp = await apiService.post('User', {
        id: Number(userId),
        nickName: basicForm.nickName,
        userName: basicForm.userName,
        email: basicForm.email,
        phoneNumber: basicForm.phoneNumber,
        address: basicForm.address,
        // preserve existing role/status from user store
        roleId: user?.roleId,
        status: user?.status,
      });

      if (resp?.status === false) {
        setBasicError(resp.message || 'Update failed.');
        return;
      }

      setBasicSuccess(resp?.message || 'Profile updated successfully!');

      // Patch the Redux store so sidebar / header reflect new values
      const updated = {
        ...user,
        nickName: basicForm.nickName,
        userName: basicForm.userName,
        email: basicForm.email,
        phoneNumber: basicForm.phoneNumber,
        address: basicForm.address,
      };
      dispatch(loginSuccess(updated));
    } catch (err) {
      setBasicError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setSavingBasic(false);
    }
  };

  // ── Section 3 handlers ───────────────────────────────────────────────────
  const handlePwdChange = (field) => (e) => {
    setPwdForm((prev) => ({ ...prev, [field]: e.target.value }));
    setPwdError(''); setPwdSuccess('');
  };

  const handlePwdSubmit = async (e) => {
    e.preventDefault();
    setPwdError(''); setPwdSuccess('');

    if (!pwdForm.newPassword || !pwdForm.confirmPassword) {
      setPwdError('All fields are required.');
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('Passwords do not match.');
      return;
    }

    setSavingPwd(true);
    try {
      const resp = await apiService.post('User/update-password', {
        userId: Number(userId),
        newPassword: pwdForm.newPassword,
      });

      if (resp?.status === false) {
        setPwdError(resp.message || 'Password update failed.');
        return;
      }

      setPwdSuccess(resp?.message || 'Password updated successfully!');
      setPwdForm({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setSavingPwd(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', gap: '0.75rem', color: 'var(--text-muted)' }}>
        <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
        <span>Loading profile…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0.5rem 0 2rem' }}>

      {/* ══════════════════════════════════════════════════════════════════
          Section 1 — Photo & Signature
      ══════════════════════════════════════════════════════════════════ */}
      <div style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={18} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Photo &amp; Signature</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Upload your profile photo and signature image</p>
          </div>
        </div>

        <form onSubmit={handleMediaSubmit}>
          <AlertBox type="error" message={mediaError} />
          <AlertBox type="success" message={mediaSuccess} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

            {/* Photo */}
            <div>
              <label style={labelStyle}>Profile Photo</label>
              {/* Preview box */}
              <div
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '12px',
                  border: '2px dashed var(--border-color)',
                  background: 'var(--bg-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  marginBottom: '0.75rem',
                  position: 'relative',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {photoFile || photoPreview ? (
                  <>
                    <img
                      src={photoFile ? URL.createObjectURL(photoFile) : photoPreview}
                      alt="Photo preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'opacity 0.2s', color: '#fff', fontSize: '0.8rem', gap: '4px'
                    }}
                      className="photo-hover-overlay"
                    >
                      <Upload size={20} />
                      <span>Click to change</span>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Upload size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.8rem' }}>Click to upload photo</div>
                    <div style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.7 }}>PNG, JPG, JPEG</div>
                  </div>
                )}
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
                disabled={uploadingMedia || !!mediaSuccess}
              />
              {photoFile && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Selected: {photoFile.name}
                </p>
              )}
            </div>

            {/* Signature */}
            <div>
              <label style={labelStyle}>Signature Image</label>
              <div
                onClick={() => signInputRef.current?.click()}
                style={{
                  width: '100%',
                  height: '180px',
                  borderRadius: '12px',
                  border: '2px dashed var(--border-color)',
                  background: 'var(--bg-main)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  marginBottom: '0.75rem',
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
              >
                {signFile || signPreview ? (
                  <img
                    src={signFile ? URL.createObjectURL(signFile) : signPreview}
                    alt="Signature preview"
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '0.5rem' }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    <PenLine size={28} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                    <div style={{ fontSize: '0.8rem' }}>Click to upload signature</div>
                    <div style={{ fontSize: '0.7rem', marginTop: '2px', opacity: 0.7 }}>PNG, JPG, JPEG</div>
                  </div>
                )}
              </div>
              <input
                ref={signInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleSignChange}
                disabled={uploadingMedia || !!mediaSuccess}
              />
              {signFile && (
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                  Selected: {signFile.name}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploadingMedia || !!mediaSuccess || (!photoFile && !signFile)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
            >
              {uploadingMedia ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /><span>Uploading…</span></> : <><Upload size={15} /><span>Upload Files</span></>}
            </button>
          </div>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 2 — Basic Info
      ══════════════════════════════════════════════════════════════════ */}
      <div style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Basic Information</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Update your name, contact and address details</p>
          </div>
        </div>

        <form onSubmit={handleBasicSubmit}>
          <AlertBox type="error" message={basicError} />
          <AlertBox type="success" message={basicSuccess} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

            {/* Nickname */}
            <div>
              <label style={labelStyle} htmlFor="profile-nickname">
                <Tag size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Name / Nickname
              </label>
              <input
                id="profile-nickname"
                type="text"
                style={inputStyle}
                placeholder="Display name"
                value={basicForm.nickName}
                onChange={handleBasicChange('nickName')}
                disabled={savingBasic}
              />
            </div>

            {/* Username */}
            <div>
              <label style={labelStyle} htmlFor="profile-username">
                <User size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Username <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="profile-username"
                type="text"
                style={inputStyle}
                placeholder="Login username"
                value={basicForm.userName}
                onChange={handleBasicChange('userName')}
                disabled={savingBasic}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label style={labelStyle} htmlFor="profile-email">
                <Mail size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Email Address
              </label>
              <input
                id="profile-email"
                type="email"
                style={inputStyle}
                placeholder="you@example.com"
                value={basicForm.email}
                onChange={handleBasicChange('email')}
                disabled={savingBasic}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={labelStyle} htmlFor="profile-phone">
                <Phone size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                style={inputStyle}
                placeholder="+1 234 567 890"
                value={basicForm.phoneNumber}
                onChange={handleBasicChange('phoneNumber')}
                disabled={savingBasic}
              />
            </div>
          </div>

          {/* Address */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle} htmlFor="profile-address">
              <MapPin size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Address
            </label>
            <textarea
              id="profile-address"
              rows={3}
              style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
              placeholder="Street, City, Country..."
              value={basicForm.address}
              onChange={handleBasicChange('address')}
              disabled={savingBasic}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingBasic}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
            >
              {savingBasic ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /><span>Saving…</span></> : <span>Save Changes</span>}
            </button>
          </div>
        </form>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          Section 3 — Change Password
      ══════════════════════════════════════════════════════════════════ */}
      <div style={sectionCardStyle}>
        <div style={sectionHeaderStyle}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lock size={18} color="var(--danger)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Change Password</h3>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Set a new password for your account</p>
          </div>
        </div>

        <form onSubmit={handlePwdSubmit}>
          <AlertBox type="error" message={pwdError} />
          <AlertBox type="success" message={pwdSuccess} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>

            {/* New Password */}
            <div>
              <label style={labelStyle} htmlFor="profile-new-pwd">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-new-pwd"
                  type={showPwd ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  placeholder="Minimum 6 characters"
                  value={pwdForm.newPassword}
                  onChange={handlePwdChange('newPassword')}
                  disabled={savingPwd || !!pwdSuccess}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label style={labelStyle} htmlFor="profile-confirm-pwd">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="profile-confirm-pwd"
                  type={showConfirm ? 'text' : 'password'}
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  placeholder="Re-enter new password"
                  value={pwdForm.confirmPassword}
                  onChange={handlePwdChange('confirmPassword')}
                  disabled={savingPwd || !!pwdSuccess}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn"
              disabled={savingPwd || !!pwdSuccess}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.5rem 1.5rem', fontSize: '0.875rem',
                background: 'rgba(239,68,68,0.9)', color: '#fff',
                border: 'none', borderRadius: '8px', cursor: 'pointer',
              }}
            >
              {savingPwd ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /><span>Updating…</span></> : <><Lock size={15} /><span>Update Password</span></>}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .photo-hover-overlay:hover { opacity: 1 !important; }
        div:hover > .photo-hover-overlay { opacity: 1 !important; }
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;
