// src/VideoEditor.js
import React, { useMemo, useRef, useState } from "react";
import "./VideoEditor.css";

function VideoEditor() {
  const [text, setText] = useState("");
  const [images, setImages] = useState([]);
  const [videoPreview, setVideoPreview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [secondsPerImage, setSecondsPerImage] = useState(3);
  const [transitionDuration, setTransitionDuration] = useState(0.7);
  const [quality, setQuality] = useState("high");
  const [musicFile, setMusicFile] = useState(null);
  const currentBlobUrl = useRef("");

  const canGenerate = useMemo(() => text.trim() && images.length > 0 && !isGenerating, [text, images, isGenerating]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).filter((file) => file.type.startsWith("image/"));
    setImages((prev) => [...prev, ...files]);
  };

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
    const files = Array.from(e.dataTransfer.files || []).filter((file) => file.type.startsWith("image/"));
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMusicChange = (e) => {
    const file = (e.target.files && e.target.files[0]) || null;
    if (!file) {
      setMusicFile(null);
      return;
    }
    if (!file.type.startsWith("audio/")) {
      alert("Please choose a valid audio file.");
      return;
    }
    setMusicFile(file);
  };

  const handleGenerateVideo = async () => {
    if (!text.trim() || images.length === 0) {
      alert("Please add text and at least one image to generate video.");
      return;
    }

    setIsGenerating(true);
    setVideoPreview("");

    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      formData.append("secondsPerImage", String(secondsPerImage));
      formData.append("transitionDuration", String(transitionDuration));
      formData.append("quality", quality);
      images.forEach((image) => formData.append("images", image));
      if (musicFile) {
        formData.append("music", musicFile);
      }

      const response = await fetch("http://localhost:5000/api/generate-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Video generation failed");
      }

      const videoBlob = await response.blob();

      if (currentBlobUrl.current) {
        URL.revokeObjectURL(currentBlobUrl.current);
      }

      const blobUrl = URL.createObjectURL(videoBlob);
      currentBlobUrl.current = blobUrl;
      setVideoPreview(blobUrl);
    } catch (error) {
      alert(error.message || "Unable to generate video right now.");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setText("");
    setImages([]);
    setVideoPreview("");
    setMusicFile(null);

    if (currentBlobUrl.current) {
      URL.revokeObjectURL(currentBlobUrl.current);
      currentBlobUrl.current = "";
    }
  };

  return (
    <div className="video-editor-container">
      <div className="header">
        <h2>MUGGAM Video Editor</h2>
        <p className="subtitle">Create videos from uploaded images and your text</p>
      </div>

      <div className="editor-content">
        <div className="input-section">
          <label className="section-label">Your Story Text</label>
          <textarea
            className="video-editor-textarea"
            placeholder="Tell your story"
            value={text}
            onChange={handleTextChange}
            rows={4}
          />
          <div className="char-count">{text.length} characters</div>
        </div>

        <div className="input-section">
          <label className="section-label">Upload Images ({images.length} selected)</label>
          <div
            className={`file-drop-zone ${dragOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-content">
              <p>Drag and drop images here</p>
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

        <div className="input-section">
          <label className="section-label">Render Controls</label>
          <div className="render-controls">
            <div className="control-card">
              <label className="control-label">Seconds per image: {secondsPerImage.toFixed(1)}s</label>
              <input
                className="control-range"
                type="range"
                min="1.5"
                max="8"
                step="0.5"
                value={secondsPerImage}
                onChange={(e) => setSecondsPerImage(Number(e.target.value))}
              />
            </div>
            <div className="control-card">
              <label className="control-label">Transition: {transitionDuration.toFixed(1)}s</label>
              <input
                className="control-range"
                type="range"
                min="0.2"
                max="2"
                step="0.1"
                value={transitionDuration}
                onChange={(e) => setTransitionDuration(Number(e.target.value))}
              />
            </div>
            <div className="control-card">
              <label className="control-label">Quality</label>
              <select className="control-select" value={quality} onChange={(e) => setQuality(e.target.value)}>
                <option value="high">High (1080p)</option>
                <option value="standard">Standard (720p)</option>
              </select>
            </div>
            <div className="control-card">
              <label className="control-label">Background Music (optional)</label>
              <label className="file-input-label">
                <input type="file" accept="audio/*" onChange={handleMusicChange} className="file-input" />
                Choose Audio
              </label>
              <div className="audio-name">{musicFile ? musicFile.name : "No audio selected"}</div>
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div className="uploaded-images-section">
            <label className="section-label">Your Images</label>
            <div className="uploaded-images">
              {images.map((img, index) => (
                <div key={`${img.name}-${index}`} className="image-preview">
                  <img src={URL.createObjectURL(img)} alt={`Uploaded ${index + 1}`} />
                  <button className="remove-btn" onClick={() => removeImage(index)} title="Remove image">
                    x
                  </button>
                  <div className="image-name">{img.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button className="clear-btn" onClick={clearAll} disabled={isGenerating}>
            Clear All
          </button>

          <button className={`generate-btn ${isGenerating ? "generating" : ""}`} onClick={handleGenerateVideo} disabled={!canGenerate}>
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              "Generate Video"
            )}
          </button>
        </div>

        {videoPreview && (
          <div className="video-preview">
            <label className="section-label">Your Generated Video</label>
            <div className="video-container">
              <video controls>
                <source src={videoPreview} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-actions">
                <a className="download-btn" href={videoPreview} download="generated.mp4">
                  Download
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoEditor;
