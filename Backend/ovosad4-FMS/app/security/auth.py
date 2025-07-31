import jwt
from jwt.algorithms import RSAAlgorithm
import requests
from fastapi import HTTPException, Security, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import os 

# Schema
from app.schemas.user_permissions import UserOrchardPermissions
from typing import Callable

# Role parsing
import re

# Config - From docker environment variables
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "OrchardRealm")
KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://keycloak:8080")
KEYCLOAK_PUBLIC_SERVER_URL = os.getenv("KEYCLOAK_PUBLIC_SERVER_URL", "http://localhost:8080") # Validating the 'issuer' claim in the JWT
KEYCLOAK_JWKS_URL = f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM}/protocol/openid-connect/certs"


# Security Scheme
# - endpoint expects an Authorization header with the Bearer keyword followed by the access token
bearer_scheme = HTTPBearer()

# Public Key Caching
# - stores kid (Key ID) and matching public key object
# - prevents unnecessary HTTP requests
PUBLIC_KEYS = {}

# FUNCTION TO FETCH PUBLIC KEY FROM KEYCLOAK
# - to verify access tokens
async def get_public_key(kid: str) -> RSAAlgorithm | None:
    if kid in PUBLIC_KEYS:
        return PUBLIC_KEYS[kid]
    try:
        #print(f"DEBUG: Attempting to fetch JWKS from: {KEYCLOAK_JWKS_URL}")
        resp = requests.get(KEYCLOAK_JWKS_URL)  # {"keys":[
                                                    # {
                                                    # "kid":"...",
                                                    # "kty":"RSA",
                                                    # "alg":"RSA-OAEP",
                                                    # "use":"enc",
                                                    # "x5c":["..."],
                                                    # "x5t":"...",
                                                    # "x5t#S256":"...",
                                                    # "n":"...",
                                                    # "e":"..."
                                                    # },
                                                    # {
                                                    # "kid":"...",
                                                    # "kty":"RSA",
                                                    # "alg":"RS256",
                                                    # "use":"sig",
                                                    # "x5c":["..."],
                                                    # "x5t":"...",
                                                    # "x5t#S256":"...",
                                                    # "n":"...",
                                                    # "e":"..."
                                                    # }]} 
        resp.raise_for_status()
        jwks = resp.json()  # JSON Web Key Set
                            # Returns dictionary

        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                public_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                PUBLIC_KEYS[kid] = public_key
                return public_key
            
    except requests.exceptions.RequestException as e:
        print(f"Error fetching JWKS from Keycloak: {e}")
        return None
    return None


"""
AUTHENTICATION
"""

# DEPENDENCY TO VERIFY ACCESS TOKEN
async def verify_access_token(credentials: HTTPAuthorizationCredentials = Security(bearer_scheme)):
    # Check if the token is correct format
    token = credentials.credentials
    headers = jwt.get_unverified_header(token)

    if not headers:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token headers",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    # Check for kid
    kid = headers.get("kid")    
    if not kid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: 'kid' not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Fetch the public key to verify access token
    public_key = await get_public_key(kid)
    if not public_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: Public key not found or error fetching",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decode the access token
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            options={"verify_signature": True, "verify_aud": True, "verify_iss": True},
            audience="react-frontend",
            issuer=f"{KEYCLOAK_PUBLIC_SERVER_URL}/realms/{KEYCLOAK_REALM}", 
        )
        return payload
    
    # Exceptions
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except jwt.exceptions.InvalidClaimError as e: 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token claims: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except jwt.exceptions.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    except jwt.JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

"""
AUTHORIZATION
"""

# EXTRACTING ROLES FROM VERIFIED ACCESS TOKEN - FULL PERMISSION OBJECT
async def get_user_orchard_permissions(
    payload: dict = Security(verify_access_token)
) -> UserOrchardPermissions:

    user_roles = payload.get("realm_access", {}).get("roles", [])

    # SET Username 
    permissions = UserOrchardPermissions(
        username=payload.get("preferred_username")
    )

    # Regex patterns for orchard roles
    viewer_role_pattern = re.compile(r"^Orchard-(\d+)-View$")
    admin_role_pattern = re.compile(r"^Orchard-(\d+)-Admin$")

    # Global admin roles defined in Keycloak - full access
    GLOBAL_ADMIN_ROLES = {"admin", "Orchard-Global-Admin"}

    for role in user_roles:
        # SET Global admin
        if role in GLOBAL_ADMIN_ROLES:
            permissions.is_global_admin = True

        # SET Orchard View
        viewer_match = viewer_role_pattern.match(role)
        if viewer_match:
            permissions.allowed_view_orchard_ids.add(int(viewer_match.group(1)))

        # SET Orchard Admin
        admin_match = admin_role_pattern.match(role)
        if admin_match:
            permissions.allowed_admin_orchard_ids.add(int(admin_match.group(1)))
            # Admin access implicitly includes view access
            permissions.allowed_view_orchard_ids.add(int(admin_match.group(1)))

    return permissions

"""
HELPER DEPENDENCIES
- Functions serve as dependencies to verify user's specific access to an orchard resource (view or admin)
- They return an 'async' dependency that FastAPI can call and resolve
"""

# VIEW ACCESS FACTORY
def verify_orchard_view_access(
    orchard_id_dependency: Callable[..., int]
):
    async def _verify_orchard_view_access(
        orchard_id: int = Depends(orchard_id_dependency), # FastAPI resolves the orchard_id here
        permissions: UserOrchardPermissions = Security(get_user_orchard_permissions)
    ) -> UserOrchardPermissions:
        if permissions.is_global_admin or orchard_id in permissions.allowed_view_orchard_ids:
            return permissions
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized to view orchard with ID {orchard_id}",
        )
    return _verify_orchard_view_access


# ADMIN ACCESS FACTORY
def verify_orchard_admin_access(
    orchard_id_dependency: Callable[..., int]
):
    async def _verify_orchard_admin_access(
        orchard_id: int = Depends(orchard_id_dependency), # FastAPI resolves the orchard_id here
        permissions: UserOrchardPermissions = Security(get_user_orchard_permissions)
    ) -> UserOrchardPermissions:
        if permissions.is_global_admin or orchard_id in permissions.allowed_admin_orchard_ids:
            return permissions
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Not authorized to administrate orchard with ID {orchard_id}",
        )
    return _verify_orchard_admin_access 


"""
GLOBAL ACCESS DEPENDENCIES
- Functions to verify if user has access to *any* orchard or global admin status
"""

# AT LEAST ONE VIEW ACCESS
async def verify_any_orchard_view_access(
    permissions: UserOrchardPermissions = Security(get_user_orchard_permissions)
) -> UserOrchardPermissions:
    if permissions.is_global_admin or len(permissions.allowed_view_orchard_ids) > 0:
        return permissions
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only orchard viewers can perform this action"
        )

# AT LEAST ONE ADMIN ACCESS
async def verify_any_orchard_admin_access(
    permissions: UserOrchardPermissions = Security(get_user_orchard_permissions)
) -> UserOrchardPermissions:
    if permissions.is_global_admin or len(permissions.allowed_admin_orchard_ids) > 0:
        return permissions
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only orchard admins can perform this action"
        )
    
# IS GLOBAL ADMIN
async def verify_global_admin_access(
    permissions: UserOrchardPermissions = Security(get_user_orchard_permissions)
) -> UserOrchardPermissions:
    if permissions.is_global_admin:
        return permissions
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only global administrators can perform this action"
        )
    