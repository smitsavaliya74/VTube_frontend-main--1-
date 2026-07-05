import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Video, Image as ImageIcon, Type, FileText, CheckCircle2 } from 'lucide-react';
import { videoApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Upload() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videofile: null,
    thumbnailfile: null,
  });

  const [previews, setPreviews] = useState({
    video: null,
    thumbnail: null
  });

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previews.video) URL.revokeObjectURL(previews.video);
      if (previews.thumbnail) URL.revokeObjectURL(previews.thumbnail);
    };
  }, [previews]);

  if (!currentUser) {
    return (
      <div className="login-prompt">
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎬</div>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Sign in to Upload</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>You need to be logged in to share your videos with the world.</p>
        <a href="/login" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))', color: 'white', padding: '12px 32px', borderRadius: 'var(--radius-full)', textDecoration: 'none', fontWeight: 600, fontSize: '1rem' }}>Sign In</a>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const name = e.target.name;
    setFormData({ ...formData, [name]: file });

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    if (name === 'videofile') {
      setPreviews(prev => ({ ...prev, video: objectUrl }));
    } else if (name === 'thumbnailfile') {
      setPreviews(prev => ({ ...prev, thumbnail: objectUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'uploading') return; // Prevent double submission
    
    if (!formData.videofile || !formData.thumbnailfile) {
      setErrorMsg("Both Video and Thumbnail files are required!");
      setStatus('error');
      return;
    }

    setStatus('uploading');
    setErrorMsg('');
    setProgress(0);

    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      payload.append(key, formData[key]);
    });

    try {
      await videoApi.uploadVideo(payload, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setProgress(percentCompleted);
      });
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error("Upload error:", err);
      setErrorMsg(err.response?.data?.message || err.message || "Failed to upload video.");
      setStatus('error');
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header-section">
        <div className="title-icon">
          <UploadIcon size={28} color="var(--accent-primary)" />
        </div>
        <div>
          <h1 className="page-title">Upload Video</h1>
          <p className="page-subtitle">Share your content with the VTube community</p>
        </div>
      </div>

      {/* Single form wrapping BOTH main content and sidebar so Publish button works correctly */}
      <form onSubmit={handleSubmit} className="upload-layout">
        <div className="upload-main glass">
          <div className="upload-form">
            {status === 'error' && <div className="error-banner">{errorMsg}</div>}
            {status === 'success' && (
              <div className="success-banner">
                <CheckCircle2 size={20} />
                Video uploaded successfully! Redirecting to dashboard...
              </div>
            )}

            <div className="form-section">
              <h3>Basic Details</h3>
              
              <div className="input-group">
                <label>Title (required)</label>
                <div className="input-wrapper">
                  <Type className="input-icon" size={18} />
                  <input 
                    type="text" 
                    name="title" 
                    placeholder="Add a catchy title that describes your video" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                    maxLength={100}
                  />
                  <span className="char-count">{formData.title.length}/100</span>
                </div>
              </div>

              <div className="input-group">
                <label>Description (required)</label>
                <div className="input-wrapper text-area-wrapper">
                  <FileText className="input-icon" size={18} style={{ top: 16 }} />
                  <textarea 
                    name="description" 
                    placeholder="Tell viewers about your video" 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                    rows={6} 
                    maxLength={5000}
                  />
                  <span className="char-count">{formData.description.length}/5000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="upload-sidebar">
          <div className="media-section glass">
            <h3>Media Files</h3>
            
            <div className="upload-box-container">
              <label className="upload-box">
                <input type="file" name="videofile" accept="video/*" onChange={handleFileChange} required className="hidden-file-input" />
                {previews.video ? (
                  <div className="preview-container">
                    <video src={previews.video} className="media-preview" controls />
                    <div className="replace-overlay">
                      <Video size={24} />
                      <span>Change Video</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="icon-circle"><Video size={32} color="var(--accent-primary)" /></div>
                    <span className="empty-title">Select Video File</span>
                    <span className="empty-sub">MP4, WebM or OGG</span>
                  </div>
                )}
              </label>
            </div>

            <div className="upload-box-container mt-4">
              <label className="upload-box">
                <input type="file" name="thumbnailfile" accept="image/*" onChange={handleFileChange} required className="hidden-file-input" />
                {previews.thumbnail ? (
                  <div className="preview-container">
                    <img src={previews.thumbnail} alt="Thumbnail preview" className="media-preview img-preview" />
                    <div className="replace-overlay">
                      <ImageIcon size={24} />
                      <span>Change Thumbnail</span>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="icon-circle"><ImageIcon size={32} color="var(--accent-secondary)" /></div>
                    <span className="empty-title">Upload Thumbnail</span>
                    <span className="empty-sub">JPG, PNG or WEBP (Max 2MB)</span>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="action-section glass">
            {status === 'uploading' ? (
              <div className="uploading-state">
                <div className="progress-header">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="upload-warning">Please keep this page open until the upload finishes.</p>
              </div>
            ) : (
              <button 
                type="submit" 
                className="publish-btn" 
                disabled={!formData.title || !formData.description || !formData.videofile || !formData.thumbnailfile || status === 'uploading'}
              >
                Publish Video
              </button>
            )}
          </div>
        </div>
      </form>

      <style>{`
        .upload-container {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          min-height: calc(100vh - 70px);
        }

        .login-prompt {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 60vh;
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        .upload-header-section {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .title-icon {
          width: 56px;
          height: 56px;
          background: rgba(123, 44, 191, 0.15);
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(123, 44, 191, 0.3);
        }

        .page-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .upload-layout {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .upload-layout {
            grid-template-columns: 1fr;
          }
        }

        .upload-main {
          padding: 32px;
          border-radius: var(--radius-lg);
        }

        .upload-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .media-section, .action-section {
          padding: 24px;
          border-radius: var(--radius-lg);
        }

        h3 {
          font-size: 1.2rem;
          margin-bottom: 24px;
          color: var(--text-primary);
          font-weight: 600;
        }

        .input-group {
          margin-bottom: 24px;
          position: relative;
        }

        .input-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .input-wrapper input, .input-wrapper textarea {
          width: 100%;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 14px 16px 14px 48px;
          color: var(--text-primary);
          font-size: 1rem;
          font-family: inherit;
          transition: all var(--transition-fast);
        }

        .input-wrapper input:focus, .input-wrapper textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(123, 44, 191, 0.1);
          background: rgba(0, 0, 0, 0.3);
        }

        .text-area-wrapper textarea {
          resize: vertical;
          min-height: 150px;
        }

        .char-count {
          position: absolute;
          right: 12px;
          bottom: -20px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .upload-box-container {
          width: 100%;
        }

        .mt-4 {
          margin-top: 24px;
        }

        .upload-box {
          display: block;
          width: 100%;
          aspect-ratio: 16/9;
          background: rgba(0, 0, 0, 0.2);
          border: 2px dashed var(--glass-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .upload-box:hover {
          border-color: var(--accent-primary);
          background: rgba(123, 44, 191, 0.05);
        }

        .hidden-file-input {
          display: none;
        }

        .empty-state {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 20px;
          text-align: center;
        }

        .icon-circle {
          width: 64px;
          height: 64px;
          background: var(--bg-tertiary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .empty-title {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1.1rem;
        }

        .empty-sub {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .preview-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .media-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #000;
        }

        .img-preview {
          object-fit: cover;
        }

        .replace-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: white;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .upload-box:hover .replace-overlay {
          opacity: 1;
        }

        .publish-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border: none;
          border-radius: var(--radius-full);
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(123, 44, 191, 0.3);
        }

        .publish-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(123, 44, 191, 0.5);
        }

        .publish-btn:disabled {
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          box-shadow: none;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .uploading-state {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-weight: 600;
          color: var(--text-primary);
        }

        .progress-track {
          width: 100%;
          height: 12px;
          background: rgba(0,0,0,0.3);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), #00d2ff);
          transition: width 0.3s ease;
        }

        .upload-warning {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-align: center;
          margin-top: 8px;
        }

        .error-banner {
          background: rgba(255, 71, 87, 0.1);
          color: #ff4757;
          padding: 16px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255, 71, 87, 0.3);
          margin-bottom: 24px;
        }

        .success-banner {
          background: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
          padding: 16px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(46, 204, 113, 0.3);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
