-- Create the Keycloak database
    -- OWNER postgres ensures the default user can access it
CREATE DATABASE keycloak_db OWNER postgres;

-- Connect to the newly created database
    -- It changes the current database context for subsequent commands
\c keycloak_db postgres;

-- 3. Create the keycloak_schema inside the keycloak_db
CREATE SCHEMA IF NOT EXISTS keycloak_schema AUTHORIZATION postgres;