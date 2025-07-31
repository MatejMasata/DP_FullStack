import React from "react";
import styles from "./Home.module.css";
import { useKeycloak } from "../auth/KeycloakProvider";

export function Home() {
  const { authenticated } = useKeycloak();

  return (
    <div className={styles.homeContainer}>
      {authenticated ? (
        <>
          <h1 className={styles.welcomeTitle}>Welcome to Ovosad!</h1>
          <p className={styles.welcomeMessage}>
            Your central hub for managing orchards, trees, and all related data.
            <br />
            Please use the navigation bar to get started.
          </p>
        </>
      ) : (
        <>
          <h1 className={styles.welcomeTitle}>Welcome to Ovosad!</h1>
          <p className={styles.welcomeMessage}>
            Please log in to view and manage your orchards.
          </p>
        </>
      )}
    </div>
  );
}
