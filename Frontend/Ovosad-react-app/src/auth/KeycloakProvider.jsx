import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import keycloak from "../config/keycloak-config";

// Context with default values
const AuthContext = createContext({
  keycloak: null,
  authenticated: false,
  getToken: async () => null,
  getIdTokenParsed: () => null,
  register: () => {},
  login: () => {},
  logout: () => {},
  hasRole: () => false,
  isGlobalAdmin: false,
  isOrchardAdmin: () => false,
  isOrchardView: () => false,
  isAnyOrchardAdmin: false,
  isAnyOrchardView: false,
  adminOrchardIds: new Set(),
  viewerOrchardIds: new Set(),
});

export const KeycloakProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [authData, setAuthData] = useState(null); // Stores Keycloak object - client instance

  const [isGlobalAdmin, setIsGlobalAdmin] = useState(false);
  const [adminOrchardIds, setAdminOrchardIds] = useState(new Set());
  const [viewerOrchardIds, setViewerOrchardIds] = useState(new Set());

  // PARSE REALM ROLES FROM ACCESS TOKEN
  const parseAndSetRoles = useCallback((kcInstance) => {
    // Not auth
    if (!kcInstance || !kcInstance.authenticated) {
      setIsGlobalAdmin(false);
      setAdminOrchardIds(new Set());
      setViewerOrchardIds(new Set());
      return;
    }

    let globalAdmin = false;
    const adminIds = new Set();
    const viewerIds = new Set();

    // Realm roles template
    const realmRoles = kcInstance.tokenParsed?.realm_access?.roles || [];
    const adminRegex = /^Orchard-(\d+)-Admin$/;
    const viewRegex = /^Orchard-(\d+)-View$/;

    // Realm role matching
    for (const role of realmRoles) {
      if (role === "Orchard-Global-Admin") {
        globalAdmin = true;
      } else {
        const adminMatch = role.match(adminRegex);
        if (adminMatch) {
          adminIds.add(parseInt(adminMatch[1], 10));
        } else {
          const viewMatch = role.match(viewRegex);
          if (viewMatch) {
            viewerIds.add(parseInt(viewMatch[1], 10));
          }
        }
      }
    }

    setIsGlobalAdmin(globalAdmin);
    setAdminOrchardIds(adminIds);
    setViewerOrchardIds(viewerIds);
  }, []);

  // KEYCLOAK INIT AND TOKEN MANAGEMENT
  useEffect(() => {
    let refreshTimeoutId;

    const setupTokenRefresh = (kcInstance) => {
      // Clear any existing timer before setting a new one
      if (refreshTimeoutId) clearTimeout(refreshTimeoutId);

      if (!kcInstance?.tokenParsed?.exp) return;

      // Calculate timeout to refresh token 10 seconds before expiry
      const timeout = Math.max(
        1000, // Ensure at least 1 second
        kcInstance.tokenParsed.exp * 1000 - Date.now() - 10000
      );

      refreshTimeoutId = setTimeout(async () => {
        try {
          const refreshed = await kcInstance.updateToken(5); // Attempt to refresh token

          if (refreshed) {
            setAuthData(kcInstance); // Update keycloak object state
            parseAndSetRoles(kcInstance); // Re-parse roles after successful refresh
          }
          setupTokenRefresh(kcInstance); // Schedule the next refresh
        } catch (error) {
          console.error(
            "Failed to refresh access token, re-initializing:",
            error
          );
          // If refresh fails, try re-initializing Keycloak or log out the user
          setAuthenticated(false);
          setAuthData(null);
          setIsGlobalAdmin(false);
          setAdminOrchardIds(new Set());
          setViewerOrchardIds(new Set());
        }
      }, timeout);
    };

    keycloak
      .init({
        onLoad: "check-sso",
        pkceMethod: "S256",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        checkLoginIframe: false,
      })
      .then((auth) => {
        setAuthenticated(auth);
        setInitialized(true);
        setAuthData(keycloak);
        if (auth) {
          parseAndSetRoles(keycloak); // Parse roles on init
          setupTokenRefresh(keycloak); // Start token refresh cycle if authenticated
        }
      })
      .catch((error) => {
        setAuthenticated(false);
        setInitialized(true);
        console.error("Keycloak initialization failed", error);
      });

    // Clear the timer when component unmounts
    return () => {
      if (refreshTimeoutId) clearTimeout(refreshTimeoutId);
    };
  }, [parseAndSetRoles]);

  // GET ACCESS TOKEN
  const getToken = useCallback(async () => {
    if (!authenticated || !keycloak) {
      return null;
    }
    try {
      await keycloak.updateToken(5); // Refresh if it expires in 5s
      setAuthData(keycloak);
      parseAndSetRoles(keycloak);
      return keycloak.token;
    } catch (error) {
      console.error("Failed to get access token:", error);
      return null;
    }
  }, [authenticated, parseAndSetRoles]);

  // GET ID TOKEN
  const getIdTokenParsed = useCallback(() => {
    if (!authenticated || !keycloak?.idTokenParsed) {
      return null;
    }
    return keycloak.idTokenParsed;
  }, [authenticated]);

  // REGISTER
  const register = useCallback((options) => {
    keycloak?.register(options);
  }, []);

  // LOGIN
  const login = useCallback((options) => {
    keycloak?.login(options);
  }, []);

  // LOGOUT (MODIFIED: Clear all auth-related states)
  const logout = useCallback((options) => {
    keycloak?.logout(options);
    // Clear all states
    setAuthenticated(false);
    setAuthData(null);
    setIsGlobalAdmin(false);
    setAdminOrchardIds(new Set());
    setViewerOrchardIds(new Set());
  }, []);

  // ROLE CHECK
  const hasRole = useCallback(
    (roles) => {
      if (!authenticated || !keycloak) {
        return false;
      }
      if (Array.isArray(roles)) {
        return roles.some((role) => keycloak.hasRealmRole(role));
      }
      return keycloak.hasRealmRole(roles);
    },
    [authenticated]
  );

  // ADMIN ROLE CHECK
  const isOrchardAdmin = useCallback(
    (orchardId) => {
      if (isGlobalAdmin) return true; // Global admin can administer any orchard
      return adminOrchardIds.has(parseInt(orchardId, 10));
    },
    [isGlobalAdmin, adminOrchardIds]
  );

  // VIEW ROLE CHECK
  const isOrchardView = useCallback(
    (orchardId) => {
      if (isGlobalAdmin) return true; // Global admin can view any orchard
      if (adminOrchardIds.has(parseInt(orchardId, 10))) return true; // Admins can view implicitly
      return viewerOrchardIds.has(parseInt(orchardId, 10));
    },
    [isGlobalAdmin, adminOrchardIds, viewerOrchardIds]
  );

  // AT LEAST ONE ADMIN OR VIEW ROLE
  const isAnyOrchardAdmin = adminOrchardIds.size > 0;
  const isAnyOrchardView = viewerOrchardIds.size > 0;

  // LOADING
  if (!initialized) return <div>Loading...</div>;

  return (
    <AuthContext.Provider
      value={{
        keycloak: authData,
        authenticated,
        getToken,
        getIdTokenParsed,
        register,
        login,
        logout,
        hasRole,
        isGlobalAdmin,
        isOrchardAdmin,
        isOrchardView,
        isAnyOrchardAdmin,
        isAnyOrchardView,
        adminOrchardIds,
        viewerOrchardIds,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useKeycloak = () => useContext(AuthContext);
