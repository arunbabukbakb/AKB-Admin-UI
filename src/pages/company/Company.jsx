import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Building, Upload, Save, RotateCw, AlertCircle, CheckCircle, Loader, Globe, MapPin, Mail, Phone, X } from 'lucide-react';
import apiService from '../../services/api';

const Company = () => {
  const [formData, setFormData] = useState({
    id: 0,
    code: '',
    name: '',
    shortName: '',
    registrationNumber: '',
    gstNumber: '',
    email: '',
    phoneNumber: '',
    website: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    prefix: '',
    suffix: '',
    status: true
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [toast, setToast] = useState(null);

  const showToastNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, 4000);
  };

  const loadCompany = async () => {
    setLoading(true);
    try {
      const data = await apiService.get('Company');
      let companyObj = null;
      if (Array.isArray(data) && data.length > 0) {
        companyObj = data[0];
      } else if (data && Array.isArray(data.data) && data.data.length > 0) {
        companyObj = data.data[0];
      } else if (data && typeof data === 'object') {
        companyObj = data.data || data;
      }

      if (companyObj && companyObj.id) {
        const mapped = {
          id: companyObj.id || 0,
          code: companyObj.code || '',
          name: companyObj.name || '',
          shortName: companyObj.shortName || '',
          registrationNumber: companyObj.registrationNumber || '',
          gstNumber: companyObj.gstNumber || '',
          email: companyObj.email || '',
          phoneNumber: companyObj.phoneNumber || '',
          website: companyObj.website || '',
          streetAddress: companyObj.streetAddress || '',
          city: companyObj.city || '',
          state: companyObj.state || '',
          postalCode: companyObj.postalCode || '',
          country: companyObj.country || '',
          prefix: companyObj.prefix || '',
          suffix: companyObj.suffix || '',
          status: companyObj.status === true || companyObj.status === 'true'
        };
        setFormData(mapped);
        localStorage.setItem('company_profile', JSON.stringify(mapped));
        
        const rawLogo = companyObj.logoFile || companyObj.logo;
        if (rawLogo) {
          if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:')) {
            setLogoUrl(rawLogo);
          } else {
            const baseUrl = import.meta.env.VITE_LOGO_URL || 'https://localhost:7245/upload/logo/';
            const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
            const cleanLogo = rawLogo.startsWith('/') ? rawLogo.slice(1) : rawLogo;
            setLogoUrl(`${cleanBase}${cleanLogo}`);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load company profile:', err.message);
      const cached = localStorage.getItem('company_profile');
      if (cached) {
        setFormData(JSON.parse(cached));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        id: Number(formData.id),
        status: Boolean(formData.status)
      };

      const response = await apiService.post('Company', payload);

      if (response && 'systemMessage' in response) {
        console.log('System Message:', response.systemMessage);
      }

      if (response && response.status === false) {
        showToastNotification(response.message || 'Failed to save company details.', 'danger');
        return;
      }

      showToastNotification(response.message || 'Company details saved successfully!', 'success');
      
      // Reload company profile to fetch updated values
      await loadCompany();
    } catch (err) {
      console.error('Failed to save company details:', err);
      const response = err.response?.data;
      if (response && 'systemMessage' in response) {
        console.log('System error details:', response.systemMessage);
      }
      const errMsg = response?.message || err.message || 'Failed to save company details.';
      showToastNotification(errMsg, 'danger');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
    }
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return;

    if (!formData.id || formData.id === 0) {
      showToastNotification('Please save the main company profile details first.', 'danger');
      return;
    }

    setUploadingLogo(true);
    const uploadData = new FormData();
    uploadData.append('CompanyId', formData.id.toString());
    uploadData.append('LogoFile', logoFile);

    try {
      const response = await apiService.post('Company/upload-logo', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response && 'systemMessage' in response) {
        console.log('System Message:', response.systemMessage);
      }

      if (response && response.status === false) {
        showToastNotification(response.message || 'Failed to upload logo.', 'danger');
        return;
      }

      showToastNotification(response.message || 'Logo uploaded successfully!', 'success');
      setLogoFile(null);
      await loadCompany();
    } catch (err) {
      console.error('Failed to upload logo:', err);
      const response = err.response?.data;
      if (response && 'systemMessage' in response) {
        console.log('System error details:', response.systemMessage);
      }
      const errMsg = response?.message || err.message || 'Failed to upload logo.';
      showToastNotification(errMsg, 'danger');
    } finally {
      setUploadingLogo(false);
    }
  };

  return (
    <div style={{ padding: '0.5rem' }}>
      {/* Title Header */}
      <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
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
            <Building size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>Company Settings</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Manage core organization profile details and branding</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
          <Loader className="spin" size={32} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="row g-4">
          {/* Main Details Form */}
          <div className="col-lg-8">
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Profile Details
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Company Code</label>
                    <input
                      type="text"
                      name="code"
                      className="form-control"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      placeholder="E.g. COMP-01"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>
                  
                  <div className="col-md-8">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Company Name</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="E.g. Aura Global Corp"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Short Name</label>
                    <input
                      type="text"
                      name="shortName"
                      className="form-control"
                      value={formData.shortName}
                      onChange={handleChange}
                      required
                      placeholder="E.g. AGC"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Registration Number</label>
                    <input
                      type="text"
                      name="registrationNumber"
                      className="form-control"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      placeholder="E.g. REG-987654"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>GST Number</label>
                    <input
                      type="text"
                      name="gstNumber"
                      className="form-control"
                      value={formData.gstNumber}
                      onChange={handleChange}
                      placeholder="E.g. 29AAAAA1111A1Z1"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Mail size={14} /></span>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="you@company.com"
                        style={{ padding: '0.45rem 0.6rem 0.45rem 2rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Phone Number</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Phone size={14} /></span>
                      <input
                        type="text"
                        name="phoneNumber"
                        className="form-control"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="+1 (234) 567-8901"
                        style={{ padding: '0.45rem 0.6rem 0.45rem 2rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Website URL</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}><Globe size={14} /></span>
                      <input
                        type="url"
                        name="website"
                        className="form-control"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://company.com"
                        style={{ padding: '0.45rem 0.6rem 0.45rem 2rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Doc Prefix</label>
                    <input
                      type="text"
                      name="prefix"
                      className="form-control"
                      value={formData.prefix}
                      onChange={handleChange}
                      placeholder="Prefix"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Doc Suffix</label>
                    <input
                      type="text"
                      name="suffix"
                      className="form-control"
                      value={formData.suffix}
                      onChange={handleChange}
                      placeholder="Suffix"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', height: '34px' }}>
                      <input
                        type="checkbox"
                        name="status"
                        className="form-check-input"
                        checked={formData.status}
                        onChange={handleChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Active</span>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Street Address</label>
                    <textarea
                      name="streetAddress"
                      className="form-control"
                      value={formData.streetAddress}
                      onChange={handleChange}
                      required
                      placeholder="123 Business Rd, Suite 100"
                      rows={2}
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>City</label>
                    <input
                      type="text"
                      name="city"
                      className="form-control"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="City"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>State/Province</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      placeholder="State"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      className="form-control"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      placeholder="ZIP/Postal Code"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Country</label>
                    <input
                      type="text"
                      name="country"
                      className="form-control"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      placeholder="Country"
                      style={{ padding: '0.45rem 0.6rem', fontSize: '0.825rem', borderRadius: '6px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                    style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 1.25rem', borderRadius: '6px' }}
                  >
                    {saving ? (
                      <>
                        <Loader className="spin" size={15} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={15} />
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Logo Upload Section */}
          <div className="col-lg-4">
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', height: '100%' }}>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Company Logo
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
                {/* Logo Preview box */}
                <div style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '12px',
                  border: '2px dashed var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-main)',
                  position: 'relative'
                }}>
                  {logoFile ? (
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Logo Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Company Logo"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                      <Building size={36} style={{ opacity: 0.3 }} />
                      <span style={{ fontSize: '0.75rem' }}>No Logo Uploaded</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleLogoUpload} style={{ width: '100%' }}>
                  <div className="form-group mb-3">
                    <label className="form-label" style={{ fontSize: '0.775rem', color: 'var(--text-main)', fontWeight: 500 }}>Select New Logo</label>
                    <input
                      type="file"
                      className="form-control text-light"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploadingLogo || !formData.id}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-main)',
                        borderRadius: '6px'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={uploadingLogo || !logoFile || !formData.id}
                    style={{
                      width: '100%',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.45rem',
                      borderRadius: '6px'
                    }}
                  >
                    {uploadingLogo ? (
                      <>
                        <Loader className="spin" size={15} />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={15} />
                        <span>Upload Logo</span>
                      </>
                    )}
                  </button>

                  {!formData.id && (
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', color: 'var(--warning)' }}>
                      <AlertCircle size={14} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.7rem' }}>Please create/save the company profile details first before uploading a logo image.</span>
                    </div>
                  )}
                </form>
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
      `}</style>
    </div>
  );
};

export default Company;
