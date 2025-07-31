import React, { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Modal from "react-modal";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useKeycloak } from "../../auth/KeycloakProvider";
import { fetchAllFileBatches } from "../../services/fileBatchService";
import { uploadFile } from "../../services/fileService";
import { createTreeImage } from "../../services/treeImageService";
import styles from "./UploadTreeImageModal.module.css";

export function UploadTreeImageModal({
  isOpen,
  onClose,
  treeId,
  onUploadComplete,
}) {
  const { getToken } = useKeycloak();
  const [selectedFile, setSelectedFile] = useState(null);
  const [batchId, setBatchId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const { data: fileBatches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ["allFileBatches"],
    queryFn: () => fetchAllFileBatches(getToken),
    enabled: isOpen, // Only fetch when the modal is open
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      setError("");
    }
  }, []);

  useEffect(() => {
    // Clean up the object URL
    return () => {
      if (selectedFile) {
        URL.revokeObjectURL(selectedFile.preview);
      }
    };
  }, [selectedFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleClose = () => {
    setSelectedFile(null);
    setBatchId("");
    setError("");
    setIsUploading(false);
    onClose();
  };

  const handleUpload = async () => {
    if (!selectedFile || !batchId) {
      setError("Please select a file and a file batch.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // 1) Upload the file
      const newFile = await uploadFile(getToken, selectedFile, batchId);
      toast.success(`File "${newFile.name}" uploaded successfully!`);

      // 2) Link the new file to the tree
      const linkPayload = {
        tree_id: treeId,
        file_id: newFile.id,
        note: `Uploaded for tree ${treeId}`,
      };
      await createTreeImage(getToken, linkPayload);
      toast.success("Image successfully linked to the tree!");

      // 3) Cleanup and callback
      onUploadComplete();
      handleClose();
    } catch (err) {
      console.error("Failed to upload and link image:", err);
      const errorMessage = err.message || "An unexpected error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      appElement={document.getElementById("root")}
      contentLabel="Upload Tree Image"
    >
      <h2>Upload a New Tree Image</h2>

      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${
          isDragActive ? styles.dropzoneActive : ""
        }`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <div className={styles.previewContainer}>
            <p className={styles.fileInfo}>{selectedFile.name}</p>
            <img
              src={selectedFile.preview}
              alt="Preview"
              className={styles.previewImage}
            />
          </div>
        ) : (
          <p>Drag 'n' drop an image here, or click to select a file</p>
        )}
      </div>

      <div className={styles.formSection}>
        <label htmlFor="file-batch-select">Choose a File Batch:</label>
        <select
          id="file-batch-select"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          disabled={isUploading || isLoadingBatches}
        >
          <option value="" disabled>
            {isLoadingBatches ? "Loading batches..." : "Select a batch"}
          </option>
          {fileBatches?.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.formButtons}>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || !batchId || isUploading}
          className={styles.uploadButton}
        >
          {isUploading ? "Uploading..." : "Upload & Link"}
        </button>
        <button
          type="button"
          onClick={handleClose}
          disabled={isUploading}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
