import os
from dotenv import load_dotenv
from keycloak import KeycloakOpenID

import anyio

load_dotenv()

# Config
KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
KEYCLOAK_FRONTEND_CLIENT_ID = "react-frontend"

# Function to get an access token for a 'normal' user (for your FastAPI backend)
async def get_user_access_token(username: str, password: str) -> str:

    if not KEYCLOAK_SERVER_URL or not KEYCLOAK_REALM:
        raise ValueError("Keycloak URLs or Realm not configured in .env")
    
    # Initialize the KeycloakOpenID client
    keycloak_openid = KeycloakOpenID(
        server_url=KEYCLOAK_SERVER_URL,
        realm_name=KEYCLOAK_REALM,
        client_id=KEYCLOAK_FRONTEND_CLIENT_ID,
        verify=False # Set to True if you have a valid SSL certificate
    )

    print(f"Keycloak Utils: Attempting to get FastAPI-compatible token for user '{username}'...")
    try:
        # anyio.to_thread.run_sync because python-keycloak's token method is synchronous
        token_data = await anyio.to_thread.run_sync(
                lambda: keycloak_openid.token(username=username, password=password)
        )

        print(f"Keycloak Utils: Successfully obtained FastAPI-compatible access token for user '{username}'.")
        return token_data["access_token"]
    
    except Exception as e:
        print(f"ERROR getting FastAPI-compatible token for user '{username}': {e}")
        if hasattr(e, 'response_body'):
            print(f"Keycloak response body: {e.response_body}")
        raise
