import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from starlette.responses import Response
from dotenv import load_dotenv

from app.security.auth import verify_any_orchard_view_access
from app.schemas.user_permissions import UserOrchardPermissions

# Load API key from .env fiel
load_dotenv()

router = APIRouter(
    prefix="/map-tiles",
    tags=["Map Proxy"]
)

MAPY_CZ_API_KEY = os.getenv("MAPY_CZ_API_KEY")
TILE_URL_TEMPLATE = "https://api.mapy.cz/v1/maptiles/aerial/256/{z}/{x}/{y}?apikey={apikey}"

# Proxy to the Mapy.cz tile server
@router.get("/{z}/{x}/{y}")
async def get_map_tile(
    z: int,
    x: int,
    y: int,
    # User must have VIEW ACCESS to atleast one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_view_access)):
    if not MAPY_CZ_API_KEY:
        raise HTTPException(status_code=500, detail="Map API key is not configured on the server.")

    # Construct the URL 
    actual_url = TILE_URL_TEMPLATE.format(z=z, x=x, y=y, apikey=MAPY_CZ_API_KEY)

    # Use an asynchronous HTTP client to make the request
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(actual_url)
            # If Mapy.cz returns an error
            response.raise_for_status()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=502, detail=f"Failed to fetch map tile from provider: {exc}")
        except httpx.HTTPStatusError as exc:
            raise HTTPException(status_code=exc.response.status_code, detail="Error from map tile provider.")

    # Return the content
    return Response(content=response.content, media_type=response.headers['Content-Type'])