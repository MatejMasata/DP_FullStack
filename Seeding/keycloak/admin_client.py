import os
import httpx
from dotenv import load_dotenv

load_dotenv()

class KeycloakAdminSeederClient:
    def __init__(self):

        # Config
        self.keycloak_server_url = os.getenv("KEYCLOAK_SERVER_URL")
        self.admin_username = os.getenv("KEYCLOAK_ADMIN_USERNAME")
        self.admin_password = os.getenv("KEYCLOAK_ADMIN_PASSWORD")
        self.target_realm = os.getenv("KEYCLOAK_REALM")

        if not all([self.keycloak_server_url, self.admin_username, self.admin_password, self.target_realm]):
            raise ValueError("Keycloak admin environment variables are not fully configured in .env for the seeding admin client")

        self.token_url = f"{self.keycloak_server_url}/realms/master/protocol/openid-connect/token"
        self.users_url = f"{self.keycloak_server_url}/admin/realms/{self.target_realm}/users"
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
                    print("Keycloak admin token invalid on first attempt, attempting refresh and retry")
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


    # Create new user in target realm
    # - Returns the user's Keycloak ID
    async def create_user(self, username: str, password: str, email: str = None, enabled: bool = True) -> str:

        print(f"Attempting to create Keycloak user: '{username}'")
        
        # If an email is provided, use it; otherwise, generate one based on the username
        final_email = email if email else f"{username}@OrchardEmail.com"

        first_name = f"{username}FN"
        last_name = f"{username}LN" 

        # User data
        user_payload = {
            "username": username,
            "email": final_email,
            "emailVerified": True,
            "enabled": enabled,
            "firstName": first_name,
            "lastName": last_name,
            "credentials": [
                {
                    "type": "password",
                    "value": password,
                    "temporary": False
                }
            ]
        }

        try:
            # Check if user already exists
            response = await self._make_admin_request("GET", self.users_url, params={"username": username})
            existing_users = response.json()
            if existing_users:
                user_id = existing_users[0]["id"]
                print(f"Keycloak user '{username}' already exists. Skipping creation. ID: {user_id}")
                return user_id

            # Create user
            await self._make_admin_request("POST", self.users_url, json=user_payload)
            # Keycloak returns 201 Created with no body, but the ID in the header
            # Easiest way to get the ID is to query for the user after creation

            # Re-fetch the user to get their ID
            response = await self._make_admin_request("GET", self.users_url, params={"username": username})
            created_users = response.json()
            if created_users:
                user_id = created_users[0]["id"]
                print(f"Keycloak user '{username}' created successfully. ID: {user_id}")
                return user_id
            else:
                raise Exception(f"Failed to retrieve ID for newly created user '{username}'. User might not have been created correctly")

        except httpx.HTTPStatusError as e:
            print(f"Failed to create Keycloak user '{username}': {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            print(f"An error occurred while creating Keycloak user '{username}': {e}")
            raise
    

    # Retrieve the ID of keycloak realm role by its name
    async def get_realm_role_id(self, role_name: str) -> str:

        #print(f"Attempting to get ID for Keycloak realm role: '{role_name}'")

        try:
            response = await self._make_admin_request("GET", self.roles_url, params={"search": role_name, "exact": "true"})
            roles = response.json()
            for role in roles:
                if role["name"] == role_name:
                    #print(f"Found role '{role_name}' with ID: {role['id']}")
                    return role["id"]
                
            raise ValueError(f"Keycloak realm role '{role_name}' not found")
        except Exception as e:
            print(f"n error occurred while getting role ID for '{role_name}': {e}")
            raise


    # Assign realm role to a specific user
    async def assign_realm_role_to_user(self, user_id: str, role_id: str, role_name: str):

        #print(f"Attempting to assign realm role '{role_name}' (ID: {role_id}) to user ID: {user_id}")
        # user_roles_url = f"{self.users_url}/{user_id}/realm-roles"
        user_roles_url = f"{self.users_url}/{user_id}/role-mappings/realm"
        try:
            # Check if the role is already assigned
            current_roles_response = await self._make_admin_request("GET", user_roles_url)
            current_roles = current_roles_response.json()
            for role in current_roles:
                if role["id"] == role_id:
                    print(f"User ID '{user_id}' already has role '{role_name}'. Skipping")
                    return

            # If not assigned, then assign
            await self._make_admin_request(
                "POST",
                user_roles_url,
                json=[
                    {
                        "id": role_id,
                        "name": role_name
                    }
                ]
            )
            print(f"INFO: Successfully assigned role '{role_name}' to user ID: {user_id}")

        except httpx.HTTPStatusError as e:
            print(f"ERROR: Failed to assign role '{role_name}' to user ID '{user_id}': {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            print(f"ERROR: An error occurred while assigning role '{role_name}' to user ID '{user_id}': {e}")
            raise
        