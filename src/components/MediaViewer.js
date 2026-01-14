import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const MediaViewer = ({ file, onClose }) => {
  const { currentUser } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 20, y: 20 });
  const watermarkRef = useRef(null);
  const containerRef = useRef(null);

  // Randomly move watermark every 5 seconds
  useEffect(() => {
    const moveWatermark = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const maxX = container.clientWidth - 200; // watermark width
        const maxY = container.clientHeight - 40; // watermark height

        const newX = Math.random() * Math.max(0, maxX);
        const newY = Math.random() * Math.max(0, maxY);

        setWatermarkPosition({
          x: Math.max(10, Math.min(newX, maxX)),
          y: Math.max(10, Math.min(newY, maxY)),
        });
      }
    };

    // Move immediately and then every 5 seconds
    moveWatermark();
    const interval = setInterval(moveWatermark, 5000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Disable screen recording (CSS-based protection)
  useEffect(() => {
    // Disable right-click on videos
    const preventContextMenu = (e) => {
      if (e.target.tagName === "VIDEO" || e.target.tagName === "IFRAME") {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  const getFileType = () => {
    if (!file.url && !file.type) return "unknown";

    const url = file.url || "";
    const type = file.type || file.fileType || "";

    // Check by type first
    if (type.includes("video") || type === "video") return "video";
    if (type.includes("image") || type === "image") return "image";
    if (type.includes("pdf") || type === "pdf") return "pdf";
    if (type.includes("document") || type === "document") return "document";

    // Check by URL
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes("youtube.com") || lowerUrl.includes("youtu.be"))
      return "youtube";
    if (lowerUrl.includes("vimeo.com")) return "vimeo";
    if (lowerUrl.match(/\.(mp4|webm|ogg|mov)$/)) return "video";
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return "image";
    if (lowerUrl.match(/\.(pdf)$/)) return "pdf";
    if (lowerUrl.match(/\.(doc|docx|txt)$/)) return "document";

    return "video"; // Default fallback
  };

  const getYouTubeEmbedUrl = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    return videoId
      ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
      : url;
  };

  const getVimeoEmbedUrl = (url) => {
    const regExp = /vimeo\.com\/(\d+)/;
    const match = url.match(regExp);
    const videoId = match ? match[1] : null;
    return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
  };

  const fileType = getFileType();

  // Watermark component
  const Watermark = () => (
    <div
      ref={watermarkRef}
      className="absolute pointer-events-none select-none"
      style={{
        left: `${watermarkPosition.x}px`,
        top: `${watermarkPosition.y}px`,
        transition: "all 2s ease-in-out",
        zIndex: 1000,
      }}
    >
      <div className="bg-black bg-opacity-40 text-white px-3 py-1 rounded text-xs font-mono backdrop-blur-sm">
        {currentUser?.email || "user@example.com"}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {file.title || "Media Viewer"}
            </h3>
            {file.duration && (
              <span className="text-sm text-gray-600 mt-1">
                ⏱️ {file.duration}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* YouTube Video */}
          {fileType === "youtube" && (
            <div
              ref={containerRef}
              className="w-full bg-black rounded-lg overflow-hidden relative"
              style={{ userSelect: "none" }}
            >
              <Watermark />
              <iframe
                src={getYouTubeEmbedUrl(file.url)}
                title={file.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video"
              ></iframe>
              <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-30">
                <div className="text-white text-xs font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
                  🔒 Protected Content
                </div>
              </div>
            </div>
          )}

          {/* Vimeo Video */}
          {fileType === "vimeo" && (
            <div
              ref={containerRef}
              className="w-full bg-black rounded-lg overflow-hidden relative"
              style={{ userSelect: "none" }}
            >
              <Watermark />
              <iframe
                src={getVimeoEmbedUrl(file.url)}
                title={file.title}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full aspect-video"
              ></iframe>
              <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-30">
                <div className="text-white text-xs font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
                  🔒 Protected Content
                </div>
              </div>
            </div>
          )}

          {/* Direct Video File */}
          {fileType === "video" && (
            <div
              ref={containerRef}
              className="w-full bg-black rounded-lg overflow-hidden relative"
              style={{
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
              }}
            >
              <Watermark />
              <video
                controls
                controlsList="nodownload noremoteplayback"
                disablePictureInPicture
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onContextMenu={(e) => e.preventDefault()}
                className="w-full"
                style={{
                  pointerEvents: "auto",
                  userSelect: "none",
                }}
              >
                <source src={file.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 pointer-events-none">
                  <div className="text-5xl text-white drop-shadow-lg">▶</div>
                </div>
              )}
              {/* Additional watermark overlay */}
              <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-30">
                <div className="text-white text-xs font-mono bg-black bg-opacity-50 px-2 py-1 rounded">
                  🔒 Protected Content
                </div>
              </div>
            </div>
          )}

          {/* Image */}
          {fileType === "image" && (
            <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
              <img src={file.url} alt={file.title} className="w-full h-auto" />
            </div>
          )}

          {/* PDF */}
          {fileType === "pdf" && (
            <div className="space-y-4">
              <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  src={file.url}
                  title={file.title}
                  className="w-full h-96"
                ></iframe>
              </div>
              <div className="flex justify-center">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
                >
                  📄 Open PDF in New Tab
                </a>
              </div>
            </div>
          )}

          {/* Document */}
          {fileType === "document" && (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Document File
              </h3>
              <p className="text-gray-600 mb-6">{file.title}</p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                📥 Download Document
              </a>
            </div>
          )}

          {/* Unknown Type */}
          {fileType === "unknown" && (
            <div className="bg-gray-50 rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">❓</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Unknown File Type
              </h3>
              <p className="text-gray-600 mb-6">
                Unable to preview this file type
              </p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
              >
                Open Link
              </a>
            </div>
          )}
        </div>

        {/* Footer Description */}
        {file.description && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h4 className="font-bold text-gray-900 mb-2">Description:</h4>
            <p className="text-gray-700">{file.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
