import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useKeycloak } from "../auth/KeycloakProvider";
import toast from "react-hot-toast";

import { updateOrchard, deleteOrchard } from "../services/orchardService";
import { KebabMenu } from "./KebabMenu";
import { UpdateFormModal } from "./modals/UpdateFormModal";

import styles from "./OrchardCard.module.css";

import kebabMenuStyles from "./KebabMenu.module.css";

export function OrchardCard({ orchard }) {
  // SETUP
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { isGlobalAdmin, isOrchardAdmin, isOrchardView, getToken } =
    useKeycloak();

  // Number of trees from the 'trees' array length
  const numberOfTrees = orchard.trees ? orchard.trees.length : 0;

  // State to control the visibility of the UpdateFormModal
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // USER ROLES FOR THIS ORCHARD
  let userRoleForOrchard = "";
  if (isGlobalAdmin) {
    userRoleForOrchard = "Global Admin";
  } else if (isOrchardAdmin(orchard.id)) {
    userRoleForOrchard = "Admin";
  } else if (isOrchardView(orchard.id)) {
    userRoleForOrchard = "Viewer";
  }

  // Check if the user can UPDATE this specific orchard
  const canUpdateOrchard = isGlobalAdmin || isOrchardAdmin(orchard.id);
  // Check if the user can DELETE this specific orchard (only Global Admin can delete orchards)
  const canDeleteOrchard = isGlobalAdmin;

  // QUERIES
  // Update
  const updateOrchardMutation = useMutation({
    mutationFn: (data) => updateOrchard(getToken, orchard.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orchards"] });
      queryClient.invalidateQueries({
        queryKey: ["orchard", String(orchard.id)],
      });
      setIsUpdateModalOpen(false);
      toast.success("Orchard updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating orchard:", error);
      toast.error(error.message || "Failed to update orchard.");
    },
  });

  // Delete
  const deleteOrchardMutation = useMutation({
    mutationFn: () => deleteOrchard(getToken, orchard.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orchards"] });
      toast.success("Orchard deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting orchard:", error);
      if (error.message && error.message.includes("500")) {
        toast.error(
          "Deletion failed. This item has related records that must be removed first."
        );
      } else {
        toast.error(error.message || "Failed to delete orchard.");
      }
    },
  });

  // HANDLE FUNCTIONS
  // When the card is clicked, navigate to the orchard details page
  const handleCardClick = () => {
    // Only navigate if the update modal is not open and no mutation is pending
    if (
      !isUpdateModalOpen &&
      !updateOrchardMutation.isPending &&
      !deleteOrchardMutation.isPending
    ) {
      navigate(`/orchard/${orchard.id}`);
    }
  };

  const handleDeleteClick = () => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete Orchard: {orchard.name}?
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteOrchardMutation.mutate();
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

  // Config for the Update Orchard form
  const updateOrchardFormConfig = [
    { name: "name", label: "Orchard Name", type: "text", required: true },
    { name: "note", label: "Note", type: "text", required: false },
  ];

  return (
    <div className={styles.orchardBox} onClick={handleCardClick}>
      {/* Kebab Menu for Update and Delete actions */}
      <KebabMenu
        canUpdate={canUpdateOrchard}
        canDelete={canDeleteOrchard}
        onUpdateClick={() => setIsUpdateModalOpen(true)}
        onDeleteClick={handleDeleteClick}
        mutationIsPending={
          updateOrchardMutation.isPending || deleteOrchardMutation.isPending
        }
      />

      {/* Orchard Role Badge */}
      {userRoleForOrchard && (
        <span
          className={styles.orchardRoleBadge}
          data-role={userRoleForOrchard.toLowerCase().replace(/\s/g, "")}
        >
          {userRoleForOrchard}
        </span>
      )}

      {/* Orchard Name Display */}
      <div className={styles.orchardHeader}>
        <div className={styles.icon}>🌳</div>
        <h2 className={styles.orchardName}>{orchard.name}</h2>
      </div>

      {/* Orchard Details */}
      <p className={`${styles.orchardDetailLine} ${styles.orchardId}`}>
        <span>ID:</span> <span>{orchard.id}</span>
      </p>
      <p className={`${styles.orchardDetailLine} ${styles.numberOfTrees}`}>
        <span>Trees:</span> <span>{numberOfTrees}</span>
      </p>

      {/* Update Orchard Modal */}
      <UpdateFormModal
        modalTitle="Update Orchard"
        mutationFn={updateOrchard}
        itemData={orchard}
        formFieldsConfig={updateOrchardFormConfig}
        onSuccessMessage="Orchard updated successfully!"
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        additionalMutationParams={{ getToken: getToken }}
      />
    </div>
  );
}
