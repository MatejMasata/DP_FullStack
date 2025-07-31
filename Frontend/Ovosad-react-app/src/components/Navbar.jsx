import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useKeycloak } from "../auth/KeycloakProvider";

import styles from "./Navbar.module.css";

export function Navbar() {
  const { authenticated, login, logout, register, keycloak, getIdTokenParsed } =
    useKeycloak();

  const [username, setUsername] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (authenticated && getIdTokenParsed) {
      // Ensure getIdTokenParsed is available
      const parsedId = getIdTokenParsed();
      setUsername(parsedId?.preferred_username || parsedId?.name || "User");
    } else {
      setUsername(null);
      setShowUserMenu(false);
    }
  }, [authenticated, getIdTokenParsed]);

  // Handle functions
  const handleLogin = () => login();
  const handleRegister = () => register();
  const handleLogout = () => logout({ redirectUri: window.location.origin });
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  const keycloakAccountUrl =
    "http://localhost:8080/realms/OrchardRealm/account/";

  return (
    <nav className={styles.navbar}>
      {/*Home Link*/}
      <Link to="/" className={styles.siteTitle}>
        Ovosad
      </Link>

      {/* Navigation Links (visible when authenticated) */}
      {authenticated && (
        <ul className={styles.mainNavLinks}>
          <li key="orchards">
            <Link to="/orchards" className={styles.navLink}>
              Orchards
            </Link>
          </li>
          <li key="agents">
            <Link to="/agents" className={styles.navLink}>
              Agents
            </Link>
          </li>
          <li key="files">
            <Link to="/filebatches" className={styles.navLink}>
              Files
            </Link>
          </li>
        </ul>
      )}

      {/* Auth/User Menu */}
      <ul className={styles.authLinks}>
        {!authenticated ? (
          <>
            {/*Login button*/}
            <li key="login">
              <a
                href="#"
                onClick={handleLogin}
                className={`${styles.authButton} ${styles.loginButton}`}
              >
                Login
              </a>
            </li>
            {/*Register button*/}
            <li key="register">
              <a
                href="#"
                onClick={handleRegister}
                className={`${styles.authButton} ${styles.registerButton}`}
              >
                Register
              </a>
            </li>
          </>
        ) : (
          // User Menu
          <li key="user-menu" className={styles.userMenuContainer}>
            <button onClick={toggleUserMenu}>
              {username} <span className={styles.dropdownArrow}>&#9660;</span>
            </button>
            {showUserMenu && (
              <div className={styles.userDropdown}>
                <a href="#" onClick={handleLogout}>
                  Logout
                </a>
                {keycloakAccountUrl && (
                  <a
                    href={keycloakAccountUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Edit User Info
                  </a>
                )}
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}
