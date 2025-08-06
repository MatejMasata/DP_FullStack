import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useKeycloak } from "../auth/KeycloakProvider";

// SERVICES
import {
  fetchAllAgents,
  createAgent,
  updateAgent,
  deleteAgent,
} from "../services/agentService";

// COMPONENTS
import { AgentTable } from "../components/tables/AgentTable";
import { AddFormModal } from "../components/modals/AddFormModal";
import { UpdateFormModal } from "../components/modals/UpdateFormModal";

// CONFIG
import { agentFormConfig, initialAgentData } from "../config/TablesConfig";

// CSS Module
import styles from "./Agents.module.css";
import kebabMenuStyles from "../components/KebabMenu.module.css";

export function Agents() {
  const queryClient = useQueryClient();
  const {
    authenticated,
    getToken,
    isGlobalAdmin,
    isAnyOrchardAdmin,
    isAnyOrchardView,
  } = useKeycloak();

  const [activeModal, setActiveModal] = useState({ type: null, data: null });

  // PERMISSIONS
  // View table - at least one view access or global admin
  // Create/Edit/Delete - at least one admin access or global admin
  const canManageAgents = isGlobalAdmin || isAnyOrchardAdmin;
  const canViewAgents = canManageAgents || isAnyOrchardView;

  // FETCHING AGENT DATA
  const {
    data: agents,
    isLoading: isLoadingAgents,
    error: agentsError,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: () => fetchAllAgents(getToken),
    enabled: authenticated && canViewAgents, // Only fetch if user has view permissions
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // MUTATIONS FOR AGENTS
  const createAgentMutation = useMutation({
    mutationFn: (payload) => createAgent(getToken, payload.body),
    onSuccess: () => {
      queryClient.invalidateQueries(["agents"]);
      toast.success("Agent created successfully!");
      setActiveModal({ type: null, data: null }); // Close modal on success
    },
    onError: (error) => {
      console.error("Error creating agent:", error);
      toast.error(error.message || "Failed to create agent. Please try again.");
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: (payload) => updateAgent(getToken, payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries(["agents"]);
      toast.success("Agent updated successfully!");
      setActiveModal({ type: null, data: null }); // Close modal on success
    },
    onError: (error) => {
      console.error("Error updating agent:", error);
      toast.error(error.message || "Failed to update agent. Please try again.");
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: (agentId) => deleteAgent(getToken, agentId),
    onSuccess: () => {
      queryClient.invalidateQueries(["agents"]);
      toast.success("Agent deleted successfully!");
    },
    onError: (error) => {
      console.error("Error deleting agent:", error);
      if (error.message && error.message.includes("500")) {
        toast.error(
          "Deletion failed. This item has related records that must be removed first."
        );
      } else {
        toast.error(error.message || "Failed to delete agent.");
      }
    },
  });

  // HANDLERS FOR MODAL AND CRUD OPERATIONS
  const handleUpdateAgentClick = (agent) => {
    setActiveModal({ type: "updateAgent", data: agent });
  };

  const handleDeleteAgentClick = (agent) => {
    toast.custom(
      (t) => (
        <div
          className={`${kebabMenuStyles.toastContainer} ${
            t.visible ? kebabMenuStyles.toastEnter : kebabMenuStyles.toastExit
          }`}
        >
          <p className={kebabMenuStyles.toastMessage}>
            Are you sure you want to delete agent "{agent.name}"? This action
            cannot be undone.
          </p>
          <div className={kebabMenuStyles.toastButtons}>
            <button
              onClick={() => {
                deleteAgentMutation.mutate(agent.id);
                toast.dismiss(t.id);
              }}
              className={kebabMenuStyles.toastConfirmButton}
            >
              Delete
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

  // Handle loading and error states first
  if (isLoadingAgents) {
    return <p className={styles.container}>Loading agents...</p>;
  }

  if (agentsError) {
    return (
      <p className={styles.container}>
        Error loading agents: {agentsError.message}
      </p>
    );
  }

  // After loading/error, check for permissions
  if (!canViewAgents) {
    return (
      <div className={styles.container}>
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Agents</h1>

      <div className={styles.contentArea}>
        {/* Create agent Button + Modal */}
        {canManageAgents && (
          <div className={styles.createButtonRow}>
            <AddFormModal
              buttonText="+ Add New Agent"
              modalTitle="Add New Agent"
              mutationFn={createAgent}
              initialFormData={initialAgentData()}
              formFieldsConfig={agentFormConfig}
              onSuccessMessage="Agent added successfully!"
              canOpenModal={canManageAgents}
              additionalMutationParams={{
                getToken: getToken,
              }}
              queryKeysToInvalidate={[["agents"]]}
            />
          </div>
        )}

        {/* Agent table */}
        <AgentTable
          agents={agents}
          canManageAgents={canManageAgents}
          onUpdateAgent={handleUpdateAgentClick}
          onDeleteAgent={handleDeleteAgentClick}
          mutationIsPending={
            createAgentMutation.isPending ||
            updateAgentMutation.isPending ||
            deleteAgentMutation.isPending
          }
        />

        {/* No agents */}
        {agents && agents.length === 0 && !isLoadingAgents && (
          <p className={styles.noDataMessage}>
            No agents found.
            {canManageAgents && " Click '+ Add New Agent' to add one."}
          </p>
        )}
      </div>

      {/* Update Agent Modal */}
      {activeModal.type === "updateAgent" &&
        activeModal.data &&
        canManageAgents && (
          <UpdateFormModal
            modalTitle="Update Agent"
            mutationFn={updateAgent}
            itemData={activeModal.data}
            formFieldsConfig={agentFormConfig}
            onSuccessMessage="Agent updated successfully!"
            isOpen={activeModal.type === "updateAgent"}
            onClose={() => setActiveModal({ type: null, data: null })}
            additionalMutationParams={{ getToken: getToken }}
          />
        )}
    </div>
  );
}
