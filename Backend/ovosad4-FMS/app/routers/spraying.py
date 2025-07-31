from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List

from app.schemas import CreateSprayingSchema, UpdateSprayingSchema, SprayingSchema
from app.services import TreeService
from app.services import AgentService
from app.services import SprayingService
from app.backend.session import create_session

from app.security.auth import verify_orchard_view_access, verify_orchard_admin_access, get_user_orchard_permissions
from app.schemas.user_permissions import UserOrchardPermissions
from app.security.orchard_id_resolve import get_orchard_id_from_spraying_id, get_orchard_id_from_tree_id

router = APIRouter(prefix="/spraying", tags=["spraying"])

# Helper dependency for POST spraying
async def orchard_id_from_create_spraying(
    spraying: CreateSprayingSchema,
    session: Session = Depends(create_session)
) -> int:
    tree_id = spraying.tree_id
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)

# New endpoint for mastertable
@router.get("/", response_model=List[SprayingSchema])
async def get_spraying_mastertable(
    session: Session = Depends(create_session),
    # Full permissions object to pass to the service for filtering
    permissions: UserOrchardPermissions = Depends(get_user_orchard_permissions)
) -> List[SprayingSchema]:  
    # Service handles filtering based on permissions
    return SprayingService(session).get_spraying_mastertable(permissions)


@router.get("/{spraying_id}", response_model=SprayingSchema)
async def get_spraying(
    spraying_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to the orchard the spraying belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_view_access(
        orchard_id_dependency=get_orchard_id_from_spraying_id
    ))
) -> SprayingSchema:
    # The dependency handles authorization
    return SprayingService(session).get_spraying(spraying_id)


@router.post("/", response_model=SprayingSchema)
async def create_spraying(
        spraying: CreateSprayingSchema = Body(...),
        session: Session = Depends(create_session),
        # User must have ADMIN ACCESS to the orchard where the spraying is being created
        permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
            orchard_id_dependency=orchard_id_from_create_spraying
        ))
) -> SprayingSchema:
    
    TreeService(session).get_tree(spraying.tree_id)
    AgentService(session).get_agent(spraying.agent_id)
    # The dependency handles authorization
    return SprayingService(session).create_spraying(spraying)


@router.put("/{spraying_id}", response_model=SprayingSchema)
async def update_spraying(
    spraying_id: int,
    spraying: UpdateSprayingSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the spraying belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_spraying_id
    ))
) -> SprayingSchema:
    # The dependency handles authorization
    return SprayingService(session).update_spraying(spraying_id, spraying)


@router.delete("/{spraying_id}", response_model=SprayingSchema)
async def delete_spraying(
    spraying_id: int,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the spraying belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_spraying_id
    ))
) -> SprayingSchema:
    # The dependency handles authorization
    return SprayingService(session).delete_spraying(spraying_id)
