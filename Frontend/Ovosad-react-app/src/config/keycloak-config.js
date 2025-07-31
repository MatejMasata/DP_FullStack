import Keycloak from "keycloak-js";

const keycloakConfig = {
  url: "http://localhost:8080/",
  realm: "OrchardRealm",
  clientId: "react-frontend",
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;
