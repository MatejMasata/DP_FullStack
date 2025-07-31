import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Modal from "react-modal";
import { useKeycloak } from "../../auth/KeycloakProvider";
import { uploadFile } from "../../services/fileService";

// STYLES
import styles from "./FileUploadModal.module.css";
import modalStyles from "./AddFormModal.module.css";

Modal.setAppElement("#root");

export function FileUploadModal({
  isOpen,
  onClose,
  batchId,
  onUploadComplete,
}) {
  const { getToken } = useKeycloak();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!Modal.defaultStyles.content.appElement) {
      Modal.setAppElement("#root");
    }
  }, []);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles(acceptedFiles);
    setUploadProgress([]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    disabled: isUploading,
  });

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setIsUploading(true);
    setUploadProgress(
      selectedFiles.map((file) => ({
        name: file.name,
        status: "uploading",
        error: null,
      }))
    );

    const uploadPromises = selectedFiles.map((file) =>
      uploadFile(getToken, file, batchId)
    );
    const results = await Promise.allSettled(uploadPromises);

    setUploadProgress((currentProgress) =>
      currentProgress.map((progress, index) => {
        const result = results[index];
        if (result.status === "fulfilled") {
          return { ...progress, status: "success" };
        }
        return {
          ...progress,
          status: "error",
          error: result.reason.message || "Upload failed",
        };
      })
    );

    setIsUploading(false);
    setSelectedFiles([]);
    onUploadComplete();
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFiles([]);
    setUploadProgress([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className={modalStyles.modalContent}
      overlayClassName={modalStyles.modalOverlay}
    >
      <h2 className={modalStyles.modalTitle}>Upload Images</h2>

      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ""} ${
          isUploading ? styles.disabled : ""
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <p>Uploading...</p>
        ) : isDragActive ? (
          <p>Drop the files here ...</p>
        ) : (
          <p>Drag 'n' drop files here, or click to select files</p>
        )}
      </div>

      <div className={styles.fileList}>
        {selectedFiles.length > 0 && uploadProgress.length === 0 && (
          <>
            <h4>Selected Files</h4>
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </>
        )}
        {uploadProgress.length > 0 && (
          <>
            <h4>Upload Status</h4>
            <ul>
              {uploadProgress.map((file, index) => (
                <li key={index} className={styles[file.status]}>
                  {file.name} - <span>{file.status}</span>
                  {file.error && (
                    <p className={styles.errorMessage}>{file.error}</p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={modalStyles.formButtons}>
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading || selectedFiles.length === 0}
          className={modalStyles.createButton}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
        <button
          type="button"
          onClick={handleClose}
          disabled={isUploading}
          className={modalStyles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
