import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { loginUser, clearError } from 'src/store/authSlice';
import AuthLayout from 'src/components/Layout/AuthLayout';
import '../Pages.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const { error, loading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
    setLocalError('');
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    const result = await dispatch(loginUser({ email, password }));
    if (result && result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <AuthLayout subtitle="Welcome back! Please enter your details.">
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
        <div className="form-group">
          <label className="form-label" htmlFor="email-input">Email Address</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Mail size={18} />
            </span>
            <input
              id="email-input"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password-input">Password</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Lock size={18} />
            </span>
            <input
              id="password-input"
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
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Demo password: <strong>admin123</strong>
            </span>
          </div>
        </div>

        <button
          id="login-submit-btn"
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '1rem', height: '46px' }}
          disabled={loading}
        >
          {loading ? (
            <Loader className="spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{' '}
        <Link to="/register" className="auth-link">
          Create Account
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </AuthLayout>
  );
};

export default Login;
