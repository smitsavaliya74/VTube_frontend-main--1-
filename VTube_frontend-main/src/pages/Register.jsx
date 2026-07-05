import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Mail, Lock, User, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    avatar: null,
    coverImage: null,
  });

  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const { register, login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.files[0] });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevent double-submit
    setError('');
    setSubmitting(true);
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) data.append(key, formData[key]);
      });
      
      await register(data);
      setStep(2); // Move to OTP step
      setSuccessMsg(`OTP sent to ${formData.email}! Check your inbox.`);
    } catch (err) {
      const msg = typeof err === 'string' ? err : err?.message || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSuccessMsg('');
    setSubmitting(true);
    try {
      // Step 1: Verify the email OTP
      const verifyRes = await fetch(`${import.meta.env.MODE === 'production' ? 'https://project-yt-lu42.onrender.com/api/v1' : 'http://localhost:8000/api/v1'}/users/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const verifyData = await verifyRes.json();
      
      if (!verifyRes.ok) {
        throw new Error(verifyData.message || 'Invalid OTP. Please try again.');
      }

      // Step 2: Auto-login the user so they land on homepage seamlessly
      try {
        await login(formData.email, formData.password);
        navigate('/'); // Go straight to home — no need to login again!
      } catch {
        // If auto-login fails for some reason, redirect to login page
        navigate('/login');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await userApi.resendVerificationOtp(formData.email);
      setSuccessMsg('New OTP sent! Check your email.');
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
          <h2>{step === 1 ? 'Create an Account' : 'Verify Your Email'}</h2>
          <p>{step === 1 ? 'Join VTube and start sharing!' : `We sent an OTP to ${formData.email}`}</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-msg">{successMsg}</div>}

        {step === 1 ? (
          <form onSubmit={handleRegisterSubmit} className="auth-form" encType="multipart/form-data">
            <div className="input-row">
              <div className="input-group">
                <label>Full Name *</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" name="fullName" placeholder="John Doe" value={formData.fullName} onChange={handleChange} required />
                </div>
              </div>

              <div className="input-group">
                <label>Username *</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input type="text" name="username" placeholder="johndoe123" value={formData.username} onChange={handleChange} required />
                </div>
              </div>
            </div>

            <div className="input-group">
              <label>Email Address *</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input type="email" name="email" placeholder="john@example.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Password *</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="password" name="password" placeholder="Create a strong password" minLength={8} value={formData.password} onChange={handleChange} required />
              </div>
              <p className="input-helper">Must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number.</p>
            </div>

            <div className="input-group">
              <label>Avatar (Required) *</label>
              <div className="file-input-wrapper">
                <ImageIcon className="input-icon" size={18} />
                <input type="file" name="avatar" accept="image/*" onChange={handleFileChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Cover Image (Optional)</label>
              <div className="file-input-wrapper">
                <ImageIcon className="input-icon" size={18} />
                <input type="file" name="coverImage" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>

            <div className="auth-actions">
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? 'Creating Account...' : 'Sign Up & Send OTP'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="auth-form">
            <div className="input-group">
              <label>Enter OTP</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input type="text" name="otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required maxLength="6" />
              </div>
            </div>

            <div className="auth-actions">
              <button type="submit" className="primary-btn" disabled={submitting}>
                {submitting ? 'Verifying...' : 'Verify Email'}
              </button>
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
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          </div>
        )}
      </div>

      <style>{`
        /* Styles reuse many classes from Login page via global CSS, but here are Register specific ones */
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 80px);
          padding: 24px;
        }

        .auth-card {
          width: 100%;
          max-width: 550px; /* Slightly wider for register */
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

        .input-row {
          display: flex;
          gap: 16px;
        }
        
        .input-row .input-group {
          flex: 1;
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

        .input-wrapper, .file-input-wrapper {
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
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(123, 44, 191, 0.2);
        }
        
        .file-input-wrapper input {
          width: 100%;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          padding: 10px 16px 10px 48px;
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }
        
        .file-input-wrapper input::file-selector-button {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--glass-border);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          margin-right: 12px;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .file-input-wrapper input::file-selector-button:hover {
          background: var(--color-primary);
          border-color: var(--color-primary);
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

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px var(--color-primary-glow);
        }

        .primary-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
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
          margin-top: 4px;
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
          background: var(--color-success-bg);
          color: var(--color-success);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          border: 1px solid var(--color-success-border);
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
        
        @media (max-width: 600px) {
          .input-row {
            flex-direction: column;
            gap: 20px;
          }
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
