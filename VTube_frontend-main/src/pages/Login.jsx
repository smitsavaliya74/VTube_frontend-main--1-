import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Mail, Lock, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

export default function Login() {
  const [formData, setFormData] = useState({
    identifier: '', // username or email
    password: ''
  });
  
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  
  const navigate = useNavigate();
  const { login, verifyEmail } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.identifier, formData.password);
      navigate('/');
    } catch (err) {
      if (err.status === 403 || err.message === "Please verify your email first") {
        setStep(2);
        handleResendOtp(); // Automatically send the OTP so the user doesn't have to manually click the button
      } else {
        setError(err.message || err);
      }
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const email = formData.identifier; 
      await verifyEmail(email, otp);
      setStep(1);
      setError('Email verified successfully! Please log in again.');
    } catch (err) {
      setError(err);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setResendMsg('');
    setError('');
    try {
      await userApi.resendVerificationOtp(formData.identifier);
      setResendMsg('New OTP sent! Check your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass animate-fade-in">
        <div className="auth-header">
          <div className="logo-icon-large">
            <Video size={36} color="var(--color-primary)" />
          </div>
          <h2>{step === 1 ? 'Welcome Back to VTube' : 'Verify Your Email'}</h2>
          <p>{step === 1 ? 'Enter your credentials to continue' : 'Your account is unverified. Please enter your OTP.'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {step === 1 ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
          <div className="input-group">
            <label>Email or Username</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input 
                type="text" 
                name="identifier" 
                placeholder="Enter your email or username" 
                value={formData.identifier} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input 
                type="password" 
                name="password" 
                placeholder="Enter your password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <div className="auth-actions">
            <button type="submit" className="primary-btn">Sign In</button>
          </div>
        </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="auth-form">
            <div className="input-group">
              <label>Enter OTP sent to your email</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" />
              </div>
            </div>

            {resendMsg && <div className="success-msg">{resendMsg}</div>}
            
            <div className="auth-actions">
              <button type="submit" className="primary-btn">Verify Email</button>
            </div>

            <button 
              type="button" 
              className="resend-btn" 
              onClick={handleResendOtp} 
              disabled={resendLoading}
            >
              <RefreshCw size={16} />
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          </form>
        )}

        {step === 1 && (
          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register" className="auth-link">Sign up</Link></p>
          </div>
        )}
      </div>

      <style>{`
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: 24px;
        }

        .auth-card {
          width: 100%;
          max-width: 480px;
          padding: 40px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .auth-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .logo-icon-large {
          background: var(--color-primary-muted);
          padding: 16px;
          border-radius: var(--radius-lg);
          margin-bottom: 8px;
        }

        .auth-header h2 {
          font-size: 1.8rem;
          color: var(--text-primary);
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-secondary);
        }

        .input-wrapper input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          padding: 12px 16px 12px 48px;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1rem;
          transition: all var(--transition-fast);
        }

        .input-wrapper input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px var(--color-primary-muted);
          outline: none;
        }

        .forgot-password-link {
          text-align: right;
          margin-top: -10px;
          margin-bottom: 10px;
        }

        .forgot-password-link a {
          color: var(--color-primary);
          font-size: 0.85rem;
          text-decoration: none;
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .forgot-password-link a:hover {
          color: var(--color-primary-light);
        }

        .primary-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px var(--color-primary-glow);
        }

        .resend-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: transparent;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .resend-btn:hover:not(:disabled) {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .resend-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .success-msg {
          background: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          border: 1px solid rgba(46, 204, 113, 0.2);
          text-align: center;
        }

        .auth-footer {
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--color-primary-light);
          text-decoration: none;
          font-weight: 600;
        }

        .auth-link:hover {
          text-decoration: underline;
        }
        
        @media (max-width: 480px) {
          .auth-card {
            padding: 24px;
            gap: 24px;
          }
          .auth-header h2 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}