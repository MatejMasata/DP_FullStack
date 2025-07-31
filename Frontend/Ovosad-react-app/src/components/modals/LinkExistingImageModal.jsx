import React, { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Modal from "react-modal";
import toast from "react-hot-toast";

import { useKeycloak } from "../../auth/KeycloakProvider";
import { fetchAllFileBatches } from "../../services/fileBatchService";
import { fetchAllFiles } from "../../services/fileService";
import { createTreeImage } from "../../services/treeImageService";

import styles from "./LinkExistingImageModal.module.css";

export function LinkExistingImageModal({
  isOpen,
  onClose,
  treeId,
  onLinkComplete,
  existingFileIds = [],
}) {
  const { getToken } = useKeycloak();
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedFileId, setSelectedFileId] = useState("");

  const existingFileIdSet = useMemo(
    () => new Set(existingFileIds),
    [existingFileIds]
  );

  const { data: fileBatches, isLoading: isLoadingBatches } = useQuery({
    queryKey: ["allFileBatches"],
    queryFn: () => fetchAllFileBatches(getToken),
    enabled: isOpen,
  });

  const { data: allFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ["allFiles"],
    queryFn: () => fetchAllFiles(getToken),
    enabled: isOpen,
  });

  const availableFilesInBatch = useMemo(() => {
    if (!selectedBatchId || !allFiles) return [];
    return allFiles.filter(
      (file) =>
        file.file_batch_id === parseInt(selectedBatchId, 10) &&
        !existingFileIdSet.has(file.id)
    );
  }, [allFiles, selectedBatchId, existingFileIdSet]);

  const mutation = useMutation({
    mutationFn: (payload) => createTreeImage(getToken, payload),
    onSuccess: () => {
      toast.success("Image linked successfully!");
      onLinkComplete();
      handleClose();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to link image.");
    },
  });

  const handleClose = () => {
    setSelectedBatchId("");
    setSelectedFileId("");
    mutation.reset();
    onClose();
  };

  const handleLinkImage = () => {
    if (!selectedFileId) {
      toast.error("Please select a file to link.");
      return;
    }
    const payload = {
      tree_id: treeId,
      file_id: parseInt(selectedFileId, 10),
      note: `Linked to tree ${treeId}`,
    };
    mutation.mutate(payload);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className={styles.modalContent}
      overlayClassName={styles.modalOverlay}
      appElement={document.getElementById("root")}
      contentLabel="Link Existing Image"
    >
      <h2>Link an Existing Image</h2>

      <div className={styles.formGrid}>
        <label htmlFor="batch-select">File Batch</label>
        <select
          id="batch-select"
          value={selectedBatchId}
          onChange={(e) => {
            setSelectedBatchId(e.target.value);
            setSelectedFileId(""); // Reset file selection when batch changes
          }}
          disabled={isLoadingBatches || mutation.isPending}
        >
          <option value="" disabled>
            {isLoadingBatches ? "Loading..." : "Select a batch"}
          </option>
          {fileBatches?.map((batch) => (
            <option key={batch.id} value={batch.id}>
              {batch.label}
            </option>
          ))}
        </select>

        <label htmlFor="file-select">File</label>
        <select
          id="file-select"
          value={selectedFileId}
          onChange={(e) => setSelectedFileId(e.target.value)}
          disabled={!selectedBatchId || isLoadingFiles || mutation.isPending}
        >
          <option value="" disabled>
            {isLoadingFiles ? "Loading..." : "Select a file"}
          </option>
          {availableFilesInBatch.map((file) => (
            <option key={file.id} value={file.id}>
              {file.name}
            </option>
          ))}
        </select>
      </div>

      {mutation.isError && (
        <p className={styles.errorMessage}>{mutation.error.message}</p>
      )}

      <div className={styles.formButtons}>
        <button
          onClick={handleLinkImage}
          disabled={!selectedFileId || mutation.isPending}
          className={styles.linkButton}
        >
          {mutation.isPending ? "Linking..." : "Link Image"}
        </button>
        <button
          onClick={handleClose}
          disabled={mutation.isPending}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}
