import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { useKeycloak } from "../auth/KeycloakProvider";
// Services
import { fetchOrchards, createOrchard } from "../services/orchardService";
// Components
import { OrchardCard } from "../components/OrchardCard";
import { AddFormModal } from "../components/modals/AddFormModal";
import styles from "./Orchards.module.css";

export function Orchards() {
  const navigate = useNavigate();

  const { authenticated, getToken, isGlobalAdmin } = useKeycloak();

  // FETCH ORCHARDS - only if authenticated
  const {
    data: orchards,
    isLoading: isLoadingOrchards,
    error: orchardsError,
  } = useQuery({
    queryKey: ["orchards"],
    queryFn: () => fetchOrchards(getToken),
    enabled: authenticated,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // USER NOT AUTHENTICATED
  if (!authenticated) {
    return (
      <div className={styles.orchardsContainer}>
        <h1>Access Denied</h1>
        <p>Please log in to view orchards</p>
      </div>
    );
  }

  // LOADING
  if (isLoadingOrchards) {
    return (
      <div className={styles.orchardsContainer}>
        <h1>Loading orchards...</h1>
      </div>
    );
  }

  // ERROR DURING FETCHING
  if (orchardsError) {
    return (
      <div className={styles.orchardsContainer}>
        <h1>Error fetching orchards</h1>

        <p>{orchardsError.message}</p>
      </div>
    );
  }

  // Config for the "Add New Orchard" form
  const addOrchardFormConfig = [
    { name: "name", label: "Orchard Name", type: "text", required: true },
    { name: "note", label: "Note", type: "text", required: false },
  ];

  // AUTHENTICATED AND ORCHARDS AVAILABLE
  return (
    <div className={styles.orchardsContainer}>
      <h1>Your Orchards</h1>
      {isGlobalAdmin && (
        <div className={styles.createOrchardSection}>
          <AddFormModal
            buttonText="+ Create New Orchard"
            modalTitle="Add New Orchard"
            mutationFn={createOrchard}
            initialFormData={{ name: "" }}
            formFieldsConfig={addOrchardFormConfig}
            onSuccessMessage="Orchard created successfully!"
            canOpenModal={isGlobalAdmin} // Permission check
            additionalMutationParams={{ getToken: getToken }}
          />
        </div>
      )}

      {/* Orchard Grid */}
      {(!orchards || orchards.length === 0) && (
        <p>No orchards found or you don't have access to any.</p>
      )}

      {orchards && orchards.length > 0 && (
        <div className={styles.orchardGrid}>
          {orchards.map((orchard) => (
            <OrchardCard key={orchard.id} orchard={orchard} />
          ))}
        </div>
      )}
    </div>
  );
}
