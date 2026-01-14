/**
 * Enhanced File Grid Viewer Component
 * Displays all course files with proper categorization
 */

import React, { useState } from "react";
import { getFileUrl } from "../utils/fileUpload";

const FileGridViewer = ({ files, onViewFile, onViewVideo, onViewPdf }) => {
  const [loadingFile, setLoadingFile] = useState(null);

  const getFileIcon = (file) => {
    if (file.category === "PDF" || file.type?.includes("pdf")) return "📄";
    if (file.category === "Video" || file.type?.includes("video")) return "🎥";
    if (file.category === "Audio" || file.type?.includes("audio")) return "🎵";
    if (file.category === "Image" || file.type?.includes("image")) return "🖼️";
    return "📎";
  };

  const getFileColor = (file) => {
    if (file.category === "PDF" || file.type?.includes("pdf"))
      return "from-red-400 to-pink-400";
    if (file.category === "Video" || file.type?.includes("video"))
      return "from-purple-400 to-indigo-400";
    if (file.category === "Audio" || file.type?.includes("audio"))
      return "from-green-400 to-teal-400";
    if (file.category === "Image" || file.type?.includes("image"))
      return "from-yellow-400 to-orange-400";
    return "from-gray-400 to-slate-400";
  };

  const handleFileClick = async (file) => {
    setLoadingFile(file.id);

    try {
      const url = file.blobId ? await getFileUrl(file.blobId) : file.url;

      if (!url) {
        alert(
          "File not found. Please re-upload this file or contact your instructor."
        );
        setLoadingFile(null);
        return;
      }

      if (file.category === "PDF" || file.type?.includes("pdf")) {
        onViewPdf({ url, title: file.name });
      } else if (file.category === "Video" || file.type?.includes("video")) {
        onViewVideo({ url, type: "video", title: file.name });
      } else if (file.category === "Image" || file.type?.includes("image")) {
        onViewFile({ url, type: "image", title: file.name });
      } else {
        // For other files, try to open in new tab
        onViewFile({ url, title: file.name });
      }
    } catch (error) {
      console.error("Error loading file:", error);
      alert("Failed to load file. Please try again.");
    } finally {
      setLoadingFile(null);
    }
  };

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-6xl mb-3">📂</div>
        <p className="text-gray-600 font-medium">No files available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => {
        const isLoading = loadingFile === file.id;

        return (
          <button
            key={file.id}
            onClick={() => handleFileClick(file)}
            disabled={isLoading}
            className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-teal-400 hover:shadow-lg transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* Icon Header */}
            <div
              className={`w-full h-24 rounded-lg bg-gradient-to-br ${getFileColor(
                file
              )} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
            >
              <span className="text-5xl drop-shadow-lg">
                {isLoading ? (
                  <svg
                    className="animate-spin h-12 w-12 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  getFileIcon(file)
                )}
              </span>
            </div>

            {/* File Info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold">
                  {file.category}
                </span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
              </div>

              <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-teal-600 transition">
                {file.name}
              </h4>

              {file.uploadedAt && (
                <p className="text-xs text-gray-500">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Action Indicator */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-600 font-medium">
                {isLoading ? "Loading..." : "Click to view"}
              </span>
              <span className="text-teal-600 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default FileGridViewer;
