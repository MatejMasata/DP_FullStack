import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer>
      <p>&copy; {new Date().getFullYear()} CVUT FS</p>
    </footer>
  );
}
