import os
import httpx # Async-friendly

class KeycloakAdminClient:
    def __init__(self):

        # Config
        self.keycloak_server_url = os.getenv("KEYCLOAK_SERVER_URL")
        self.admin_username = os.getenv("KEYCLOAK_ADMIN_USERNAME")
        self.admin_password = os.getenv("KEYCLOAK_ADMIN_PASSWORD")
        self.target_realm = os.getenv("KEYCLOAK_REALM")

        if not all([self.keycloak_server_url, self.admin_username, self.admin_password, self.target_realm]):
            raise ValueError("Keycloak admin environment variables are not fully configured.")

        self.token_url = f"{self.keycloak_server_url}/realms/master/protocol/openid-connect/token"
        self.roles_url = f"{self.keycloak_server_url}/admin/realms/{self.target_realm}/roles"


    # GET admin access token
    # - Authenticates to Keycloak's master realm as admin and obtains an access token
    async def _get_admin_token(self) -> str:

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    self.token_url,
                    data={
                        "grant_type": "password",
                        "client_id": "admin-cli",
                        "username": self.admin_username,
                        "password": self.admin_password
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"}
                )

                # Raise an exception for HTTP errors (4xx or 5xx)
                response.raise_for_status()

                token_data = response.json()
                return token_data["access_token"]
            
            except httpx.HTTPStatusError as e:
                print(f"HTTP error getting Keycloak admin token: {e.response.status_code} - {e.response.text}")
                raise
            except httpx.RequestError as e:
                print(f"Network error getting Keycloak admin token: {e}")
                raise
            except Exception as e:
                print(f"An unexpected error occurred getting Keycloak admin token: {e}")
                raise
    
    
    # Make authenticated admin request to Keycloak Admin API
    # - Attempts to get a fresh token for each request. Includes retry on 401.
    async def _make_admin_request(self, method: str, url: str, **kwargs):
        # Get a fresh token
        token = await self._get_admin_token()
        
        # 
        headers = kwargs.pop("headers", {})
        headers["Authorization"] = f"Bearer {token}"
        
        # Make authenticated request
        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(method, url, headers=headers, **kwargs)
                response.raise_for_status()
                return response
            
            except httpx.HTTPStatusError as e:
                # If token might have expired (unlikely but good safeguard)
                # - try refreshing and retrying once
                if e.response.status_code == 401 and not kwargs.get("retried_token"):
                    print("Keycloak admin token invalid on first attempt, attempting refresh and retry.")
                    # Setting 'retried_token' flag - avoids loops
                    kwargs["retried_token"] = True
                     # Retry with new token
                    return await self._make_admin_request(method, url, **kwargs)
                print(f"HTTP error during Keycloak admin request: {e.response.status_code} - {e.response.text}")
                raise
            except httpx.RequestError as e:
                print(f"Network error during Keycloak admin request: {e}")
                raise
            except Exception as e:
                print(f"An unexpected error occurred during Keycloak admin request: {e}")
                raise
            

    # Create new realm role in the target realm
    async def create_realm_role(self, role_name: str):

        print(f"Attempting to create Keycloak role: {role_name} in realm {self.target_realm}")
        try:
            # Check if role already exists
            existing_roles_response = await self._make_admin_request("GET", self.roles_url, params={"search": role_name})
            existing_roles = existing_roles_response.json()
            
            for role in existing_roles:
                if role["name"] == role_name:
                    print(f"Keycloak role '{role_name}' already exists.")
                    return True # Role already exists, success?

            # If not found, create the new role
            await self._make_admin_request(
                "POST",
                self.roles_url,
                json={
                    "name": role_name,
                    "composite": False # Simple roles, not composite
                }
            )
            print(f"Keycloak role '{role_name}' created successfully.")
            return True # Success
        
        except httpx.HTTPStatusError as e:
            # Shouldnt happend since we firstly check it the role already exists
            if e.response.status_code == 409:
                print(f"Keycloak role '{role_name}' already exists (conflict).")
                return True
            print(f"Failed to create Keycloak role '{role_name}': {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            print(f"An error occurred while creating Keycloak role '{role_name}': {e}")
            raise

    # Delete realm role in the target realm
    async def delete_realm_role(self, role_name: str):

        print(f"Attempting to delete Keycloak role: {role_name} from realm {self.target_realm}")
        try:
            # Construct the specific URL for deleting a role
            delete_url = f"{self.roles_url}/{role_name}"

            await self._make_admin_request(
                "DELETE",
                delete_url
            )
            print(f"Keycloak role '{role_name}' deleted successfully.")
            return True  # Success
        
        except httpx.HTTPStatusError as e:
            # If the role is not found (404) => Success - already deleted or never existed
            if e.response.status_code == 404:
                print(f"Keycloak role '{role_name}' not found, skipping deletion (already gone).")
                return True
            print(f"Failed to delete Keycloak role '{role_name}': {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            print(f"An error occurred while deleting Keycloak role '{role_name}': {e}")
            raise

# Initialize the client as a global instance
keycloak_admin_client = KeycloakAdminClient()

