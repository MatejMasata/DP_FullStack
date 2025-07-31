import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useKeycloak } from "../auth/KeycloakProvider";

// Services
import {
  fetchAllFileBatches,
  createFileBatch,
  updateFileBatch,
  deleteFileBatch,
} from "../services/fileBatchService";

// Components
import { FileBatchTable } from "../components/tables/FileBatchTable";
import { AddFormModal } from "../components/modals/AddFormModal";
import { UpdateFormModal } from "../components/modals/UpdateFormModal";

// Configs
import {
  fileBatchFormConfig,
  initialFileBatchData,
} from "../config/TablesConfig";

// CSS
import styles from "./FileBatches.module.css";
import kebabMenuStyles from "../components/KebabMenu.module.css";

export function FileBatches() {
  const queryClient = useQueryClient();
  const {
    authenticated,
    getToken,
    isGlobalAdmin,
    isAnyOrchardAdmin,
    isAnyOrchardView,
  } = useKeycloak();

  const [activeModal, setActiveModal] = useState({ type: null, data: null });

  // Permissions
  const canManage = isGlobalAdmin || isAnyOrchardAdmin;
  const canView = canManage || isAnyOrchardView;

  // FETCHING DATA
  const {
    data: fileBatches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["fileBatches"],
    queryFn: () => fetchAllFileBatches(getToken),
    enabled: authenticated && canView,
    refetchOnWindowFocus: false,
  });

  // MUTATIONS
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFileBatch(getToken, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fileBatches"] });
      toast.success("File batch deleted successfully!");
    },
    onError: (err) =>
      toast.error(err.message || "Failed to delete file batch."),
  });

  // HANDLERS
  const handleUpdateClick = (batch) => {
    setActiveModal({ type: "update", data: batch });
  };

  const handleDeleteClick = (batch) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p>Are you sure you want to delete batch "{batch.label}"?</p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteMutation.mutate(batch.id);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Confirm
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={kebabMenuStyles.toastCancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  if (!authenticated) {
    return <p className={styles.container}>Please log in to view this page.</p>;
  }

  if (isLoading) {
    return <p className={styles.container}>Loading file batches...</p>;
  }

  if (error) {
    return (
      <p className={styles.container}>Error loading batches: {error.message}</p>
    );
  }

  if (!canView) {
    return (
      <div className={styles.container}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>File Batches</h1>

      <div className={styles.contentArea}>
        {canManage && (
          <div className={styles.createButtonRow}>
            <AddFormModal
              buttonText="+ Add New Batch"
              modalTitle="Add New File Batch"
              mutationFn={createFileBatch}
              initialFormData={initialFileBatchData()}
              formFieldsConfig={fileBatchFormConfig}
              onSuccessMessage="File batch added successfully!"
              canOpenModal={canManage}
              additionalMutationParams={{ getToken }}
              queryKeysToInvalidate={[["fileBatches"]]}
            />
          </div>
        )}

        <FileBatchTable
          fileBatches={fileBatches}
          canManage={canManage}
          onUpdate={handleUpdateClick}
          onDelete={handleDeleteClick}
          mutationIsPending={deleteMutation.isPending}
        />
      </div>

      {activeModal.type === "update" && canManage && (
        <UpdateFormModal
          modalTitle="Update File Batch"
          mutationFn={updateFileBatch}
          itemData={activeModal.data}
          formFieldsConfig={fileBatchFormConfig}
          onSuccessMessage="File batch updated successfully!"
          isOpen={activeModal.type === "update"}
          onClose={() => setActiveModal({ type: null, data: null })}
          additionalMutationParams={{ getToken }}
          queryKeysToInvalidate={[["fileBatches"]]}
        />
      )}
    </div>
  );
}
