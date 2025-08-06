import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useKeycloak } from "../auth/KeycloakProvider";
import toast from "react-hot-toast";

// Services
import {
  fetchTrees,
  createTree,
  updateTree,
  deleteTree,
} from "../services/treeService";
import { fetchOrchardById } from "../services/orchardService";

// Components
import { TreeTable } from "../components/tables/TreeTable";
import { MapDisplay } from "../components/TreeMap";
import { ScatterPlot } from "../components/ScatterPlot";
import { AddFormModal } from "../components/modals/AddFormModal";
import { UpdateFormModal } from "../components/modals/UpdateFormModal";

// Configs
import { TreeFormConfig } from "../config/TablesConfig";

// CSS Module
import styles from "./OrchardDetails.module.css";
import kebabMenuStyles from "../components/KebabMenu.module.css";

export function OrchardDetails() {
  const { orchardId } = useParams();
  const queryClient = useQueryClient(); // Initialize queryClient
  const {
    authenticated,
    getToken,
    isGlobalAdmin,
    isOrchardAdmin,
    isOrchardView,
  } = useKeycloak();

  const [displayMode, setDisplayMode] = useState("table");
  const [activeModal, setActiveModal] = useState({ type: null, data: null });

  const parsedOrchardId = parseInt(orchardId, 10);
  const canCreateTree = isGlobalAdmin || isOrchardAdmin(parsedOrchardId);

  // Determine if the user can update/delete trees in this orchard
  // - Global Admin or Orchard Admin for this specific orchard
  const canManageTrees = isGlobalAdmin || isOrchardAdmin(parsedOrchardId); // This permission will be passed to TreeTable

  // FETCH ORCHARD DETAILS
  const {
    data: orchardDetails,
    isLoading: isLoadingOrchardDetails,
    error: orchardDetailsError,
  } = useQuery({
    queryKey: ["orchard", String(parsedOrchardId)],
    queryFn: () => fetchOrchardById(getToken, parsedOrchardId),
    enabled: authenticated && !isNaN(parsedOrchardId),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // FETCH ALL TREES
  const {
    data: allTrees,
    isLoading: isLoadingTrees,
    error: treesError,
  } = useQuery({
    queryKey: ["trees"],
    queryFn: () => fetchTrees(getToken),
    enabled: authenticated,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Filter trees based on the current orchardId
  const filteredTrees = allTrees
    ? allTrees.filter((tree) => tree.orchard_id === parsedOrchardId)
    : [];

  const initialTreeFormData = {
    note: "",
    genotype_id: 1,
    rootstock_id: 1,
    row: 0,
    field: 0,
    number: 0,
    latitude: 0.0,
    longitude: 0.0,
    spacing: 0.0,
    growth_type: "",
    training_shape: "",
    planting_date: "",
    initial_age: "",
    nursery_tree_type: "",
  };

  // Update Tree Mutation
  const updateTreeMutation = useMutation({
    mutationFn: (payload) => updateTree(getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trees"] });
      setActiveModal({ type: null, data: null });
      toast.success("Tree updated successfully!");
    },
    onError: (error) => {
      console.error("Error updating tree:", error);
      toast.error(error.message || "Failed to update tree.");
    },
  });

  // Delete Tree Mutation
  const deleteTreeMutation = useMutation({
    mutationFn: (treeId) => deleteTree(getToken, treeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trees"] });
      toast.success("Tree deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting tree:", error);
      if (error.message && error.message.includes("500")) {
        toast.error(
          "Deletion failed. This item has related records that must be removed first."
        );
      } else {
        toast.error(error.message || "Failed to delete tree.");
      }
    },
  });

  // HANDLERS
  const handleUpdateTreeClick = (tree) => {
    setActiveModal({ type: "updateTree", data: tree });
  };

  const handleDeleteTreeClick = (tree) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete tree with ID: {tree.id}?
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteTreeMutation.mutate(tree.id);
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

  // Rendering for Authentication, Loading, and Errors

  if (!authenticated) {
    return (
      <div className={styles.container}>
        <h1>Access Denied</h1>
        <p>Please log in to view orchard details.</p>
      </div>
    );
  }

  if (isLoadingOrchardDetails || isLoadingTrees) {
    return (
      <div className={styles.container}>
        <h1>Loading Orchard Details...</h1>
      </div>
    );
  }

  if (orchardDetailsError || treesError) {
    return (
      <div className={styles.container}>
        <h1>Error</h1>
        <p>
          Error fetching data: {(orchardDetailsError || treesError)?.message}
        </p>
      </div>
    );
  }

  if (!orchardDetails) {
    return (
      <div className={styles.container}>
        <h1>Orchard Not Found</h1>
        <p>
          The orchard with ID "{orchardId}" could not be found or you do not
          have access.
        </p>
      </div>
    );
  }

  const orchardName = orchardDetails?.name || `Orchard ID: ${orchardId}`;

  return (
    <div className={styles.container}>
      <h1>{orchardName}</h1>

      {canCreateTree && (
        <div className={styles.createButtonRow}>
          <AddFormModal
            buttonText="+ Add New Tree"
            modalTitle="Add New Tree"
            mutationFn={createTree}
            initialFormData={initialTreeFormData}
            formFieldsConfig={TreeFormConfig}
            onSuccessMessage="Tree created successfully!"
            canOpenModal={canCreateTree}
            additionalMutationParams={{
              getToken: getToken,
              body: { orchard_id: parsedOrchardId },
            }}
          />
        </div>
      )}

      {/* Display Options for Tree View */}
      <div className={styles.displayOptions}>
        <button
          onClick={() => setDisplayMode("table")}
          className={displayMode === "table" ? styles.activeButton : ""}
        >
          Table of Trees
        </button>
        <button
          onClick={() => setDisplayMode("map")}
          className={displayMode === "map" ? styles.activeButton : ""}
        >
          Map of Trees
        </button>
        <button
          onClick={() => setDisplayMode("plot")}
          className={displayMode === "plot" ? styles.activeButton : ""}
        >
          Plot of Trees
        </button>
      </div>

      {/* Render content based on selected display mode */}
      <div className={styles.contentArea}>
        {displayMode === "table" && (
          <TreeTable
            trees={filteredTrees}
            canManageTrees={canManageTrees}
            onUpdateTree={handleUpdateTreeClick}
            onDeleteTree={handleDeleteTreeClick}
            mutationIsPending={
              updateTreeMutation.isPending || deleteTreeMutation.isPending
            }
          />
        )}
        {displayMode === "map" && <MapDisplay trees={filteredTrees} />}
        {displayMode === "plot" && <ScatterPlot trees={filteredTrees} />}

        {/* No trees are found */}
        {filteredTrees.length === 0 && (
          <p className={styles.noTreesMessage}>
            No trees found for this orchard to display in this view.
            {canCreateTree && " Click '+ Add New Tree' to add one."}
          </p>
        )}
      </div>

      {/* Update Tree Modal */}
      {activeModal.type === "updateTree" && activeModal.data && (
        <UpdateFormModal
          modalTitle="Update Tree"
          mutationFn={updateTree}
          itemData={activeModal.data}
          formFieldsConfig={TreeFormConfig}
          onSuccessMessage="Tree updated successfully!"
          isOpen={activeModal.type === "updateTree"}
          onClose={() => setActiveModal({ type: null, data: null })}
          additionalMutationParams={{ getToken: getToken }}
        />
      )}
    </div>
  );
}
