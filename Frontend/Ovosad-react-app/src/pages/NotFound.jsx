import styles from "./NotFound.module.css";

export function NotFound() {
  return (
    <div className={styles.notFoundContainer}>
      <h2>404 - Page Not Found</h2>
      <p>The page you're looking for doesn't exist.</p>
    </div>
  );
}
