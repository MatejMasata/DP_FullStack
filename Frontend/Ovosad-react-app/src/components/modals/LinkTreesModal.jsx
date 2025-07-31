import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useKeycloak } from "../../auth/KeycloakProvider";
import {
  createTreeImage,
  deleteTreeImage,
} from "../../services/treeImageService";
import { TreeSelector } from "../TreeSelector";
import styles from "./LinkTreesModal.module.css";

export function LinkTreesModal({ isOpen, onClose, file, existingLinks = [] }) {
  const { getToken } = useKeycloak();
  const queryClient = useQueryClient();
  const [selectedTreeIds, setSelectedTreeIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedTreeIds(existingLinks.map((link) => link.tree_id));
    }
  }, [isOpen, existingLinks]);

  const createLinkMutation = useMutation({
    mutationFn: (treeId) =>
      createTreeImage(getToken, { file_id: file.id, tree_id: treeId }),
  });

  const deleteLinkMutation = useMutation({
    mutationFn: (linkId) => deleteTreeImage(getToken, linkId),
  });

  const handleSave = async () => {
    const originalIds = new Set(existingLinks.map((link) => link.tree_id));
    const newIds = new Set(selectedTreeIds);

    const toAdd = [...newIds].filter((id) => !originalIds.has(id));
    const toDelete = existingLinks.filter((link) => !newIds.has(link.tree_id));

    try {
      await Promise.all([
        ...toAdd.map((treeId) => createLinkMutation.mutateAsync(treeId)),
        ...toDelete.map((link) => deleteLinkMutation.mutateAsync(link.id)),
      ]);

      toast.success("Links updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["allTreeImageLinks"] });
      onClose();
    } catch (error) {
      toast.error("Failed to update links.");
    }
  };

  const isSaving = createLinkMutation.isPending || deleteLinkMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>Link Trees to "{file?.name}"</h4>
        </div>
        <div className={styles.modalBody}>
          <TreeSelector value={selectedTreeIds} onChange={setSelectedTreeIds} />
        </div>
        <div className={styles.modalFooter}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={styles.saveButton}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={onClose}
            disabled={isSaving}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
