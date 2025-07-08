// src/VideoEditor.js
import React, { useState } from "react";
import "./VideoEditor.css";

function VideoEditor({ user, onLogout }) {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [videoPreview, setVideoPreview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Handle text input
  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files]);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    setImages(prev => [...prev, ...files]);
  };

  // Remove image
  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle video generation (just for front-end now)
  const handleGenerateVideo = async () => {
    if (text.trim() && images.length > 0) {
      setIsGenerating(true);
      
      // Simulate API call delay
      setTimeout(() => {
        setVideoPreview("https://www.w3schools.com/html/mov_bbb.mp4");
        setIsGenerating(false);
      }, 3000);
    } else {
      alert("Please add text and at least one image to generate video!");
    }
  };

  // Clear all
  const clearAll = () => {
    setText("");
    setImages([]);
    setVideoPreview("");
  };

  return (
    <div className="video-editor-container">
      <div className="header">
        <h2>🎬 MUGGAM Video Editor</h2>
        <p className="subtitle">Create amazing videos from your text and images</p>
      </div>

      <div className="editor-content">
        {/* Text input section */}
        <div className="input-section">
          <label className="section-label">
            <span className="label-icon">✏️</span>
            Your Story Text
          </label>
          <textarea
            className="video-editor-textarea"
            placeholder="Tell your story... What message do you want to convey in your video?"
            value={text}
            onChange={handleTextChange}
            rows={4}
          />
          <div className="char-count">{text.length} characters</div>
        </div>

        {/* Image upload section */}
        <div className="input-section">
          <label className="section-label">
            <span className="label-icon">🖼️</span>
            Upload Images ({images.length} selected)
          </label>
          
          <div 
            className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-content">
              <div className="upload-icon">📁</div>
              <p>Drag & drop images here</p>
              <span>or</span>
              <label className="file-input-label">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
                Choose Files
              </label>
            </div>
          </div>
        </div>

        {/* Display uploaded images */}
        {images.length > 0 && (
          <div className="uploaded-images-section">
            <label className="section-label">
              <span className="label-icon">🎨</span>
              Your Images
            </label>
            <div className="uploaded-images">
              {images.map((img, index) => (
                <div key={index} className="image-preview">
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`Uploaded ${index + 1}`}
                  />
                  <button 
                    className="remove-btn"
                    onClick={() => removeImage(index)}
                    title="Remove image"
                  >
                    ×
                  </button>
                  <div className="image-name">{img.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="action-buttons">
          <button 
            className="clear-btn"
            onClick={clearAll}
            disabled={isGenerating}
          >
            🗑️ Clear All
          </button>
          
          <button 
            className={`generate-btn ${isGenerating ? 'generating' : ''}`}
            onClick={handleGenerateVideo}
            disabled={isGenerating || !text.trim() || images.length === 0}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                🎬 Generate Video
              </>
            )}
          </button>
        </div>

        {/* Video preview */}
        {videoPreview && (
          <div className="video-preview">
            <label className="section-label">
              <span className="label-icon">🎥</span>
              Your Generated Video
            </label>
            <div className="video-container">
              <video controls>
                <source src={videoPreview} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-actions">
                <button className="download-btn">📥 Download</button>
                <button className="share-btn">🔗 Share</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoEditor;

