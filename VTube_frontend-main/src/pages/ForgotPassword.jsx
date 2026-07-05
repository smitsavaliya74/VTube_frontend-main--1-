import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { userApi } from '../services/api';
import { Video, ArrowRight, Lock, Mail, Key } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await userApi.forgotPassword(email);
      setStep(2);
      setSuccessMsg("An OTP has been sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError("Please enter the OTP and a new password.");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await userApi.resetPassword(email, otp, newPassword);
      setSuccessMsg("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass">
        <div className="auth-header">
          <div className="logo-icon-large">
            <Video size={32} color="var(--accent-primary)" />
          </div>
          <h1>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h1>
          <p className="auth-subtitle">
            {step === 1 
              ? "Enter your email address to receive a verification code." 
              : "Enter the code sent to your email and choose a new password."}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>One-Time Password (OTP)</label>
              <div className="input-wrapper">
                <Key size={20} className="input-icon" />
                <input 
                  type="text" 
                  placeholder="Enter 6-digit OTP" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input 
                  type="password" 
                  placeholder="Enter new password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>Remember your password? <Link to="/login" className="auth-link">Log In</Link></p>
        </div>
      </div>

      <style>{`
        .auth-container {
          min-height: calc(100vh - 80px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: radial-gradient(circle at center, rgba(123, 44, 191, 0.1) 0%, transparent 70%);
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 40px;
          border-radius: var(--radius-xl);
          animation: slideUp var(--transition-slow) ease-out;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-icon-large {
          width: 64px;
          height: 64px;
          background: rgba(123, 44, 191, 0.1);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
        }

        .auth-header h1 {
          font-size: 2rem;
          color: var(--text-primary);
          margin-bottom: 8px;
        }

        .auth-subtitle {
          color: var(--text-secondary);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: var(--text-primary);
          font-size: 0.9rem;
          font-weight: 500;
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
          padding: 14px 14px 14px 48px;
          background: var(--bg-tertiary);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1rem;
          transition: all var(--transition-fast);
        }

        .input-wrapper input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px rgba(123, 44, 191, 0.2);
          outline: none;
        }

        .primary-btn {
          margin-top: 10px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          border: none;
          padding: 16px;
          border-radius: var(--radius-md);
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all var(--transition-fast);
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(123, 44, 191, 0.3);
        }

        .primary-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          margin-top: 32px;
          text-align: center;
          color: var(--text-secondary);
        }

        .auth-link {
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 600;
          transition: color var(--transition-fast);
        }

        .auth-link:hover {
          color: var(--accent-secondary);
        }

        .error-message {
          background: rgba(231, 76, 60, 0.1);
          color: #e74c3c;
          padding: 12px;
          border-radius: var(--radius-sm);
          text-align: center;
          margin-bottom: 20px;
          border: 1px solid rgba(231, 76, 60, 0.2);
        }

        .success-message {
          background: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
          padding: 12px;
          border-radius: var(--radius-sm);
          text-align: center;
          margin-bottom: 20px;
          border: 1px solid rgba(46, 204, 113, 0.2);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
