import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, Tag, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { registerUser, clearError, clearRegisterMessage } from 'src/store/authSlice';
import AuthLayout from 'src/components/Layout/AuthLayout';
import '../Pages.css';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nickName, setNickName] = useState('');
  const [localError, setLocalError] = useState('');

  const { error, loading, isAuthenticated, registerMessage } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearRegisterMessage());
    setLocalError('');
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      dispatch(clearRegisterMessage());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!userName || !password || !confirmPassword) {
      setLocalError('Username and password are required.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    dispatch(
      registerUser({ userName, password, email, phoneNumber, nickName })
    );
  };

  // ── Approval message screen ──────────────────────────────────────────────────
  if (registerMessage) {
    return (
      <AuthLayout subtitle="Registration submitted successfully.">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
          padding: '1rem 0',
          textAlign: 'center',
        }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.12)',
            border: '2px solid rgba(34, 197, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'popIn 0.4s ease',
          }}>
            <CheckCircle size={36} color="#22c55e" />
          </div>

          <div>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.15rem', color: 'var(--text-primary)' }}>
              Awaiting Approval
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.95rem',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              background: 'rgba(34,197,94,0.06)',
              border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: '10px',
              padding: '0.85rem 1.1rem',
            }}>
              {registerMessage}
            </p>
          </div>

          <Link
            to="/login"
            className="btn btn-primary"
            style={{ width: '100%', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', marginTop: '0.5rem' }}
          >
            Back to Sign In
          </Link>
        </div>

        <style>{`
          @keyframes popIn {
            0%   { transform: scale(0.6); opacity: 0; }
            70%  { transform: scale(1.1); }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>
      </AuthLayout>
    );
  }

  // ── Registration form ────────────────────────────────────────────────────────
  return (
    <AuthLayout subtitle="Create an account to get started.">
      {localError && (
        <div className="auth-error-box">
          <AlertCircle size={18} />
          <span>{localError}</span>
        </div>
      )}

      {error && (
        <div className="auth-error-box">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-username">
            Username <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <User size={18} />
            </span>
            <input
              id="register-username"
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Enter your username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Nickname */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-nickname">Name</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Tag size={18} />
            </span>
            <input
              id="register-nickname"
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Display name (optional)"
              value={nickName}
              onChange={(e) => setNickName(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-email">Email Address</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Mail size={18} />
            </span>
            <input
              id="register-email"
              type="email"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="you@example.com (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-phone">Phone Number</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Phone size={18} />
            </span>
            <input
              id="register-phone"
              type="tel"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="+1 234 567 890 (optional)"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-pwd">
            Password <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Lock size={18} />
            </span>
            <input
              id="register-pwd"
              type="password"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="register-confirm-pwd">
            Confirm Password <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Lock size={18} />
            </span>
            <input
              id="register-confirm-pwd"
              type="password"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <button
          id="register-submit-btn"
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem', height: '46px' }}
          disabled={loading}
        >
          {loading ? (
            <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">
          Sign In
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AuthLayout>
  );
};

export default Register;
