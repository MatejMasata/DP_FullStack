from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List

from app.schemas import CreateHarvestSchema, UpdateHarvestSchema, HarvestSchema
from app.services import HarvestService, TreeService
from app.backend.session import create_session

from app.security.auth import verify_orchard_view_access, verify_orchard_admin_access, get_user_orchard_permissions
from app.schemas.user_permissions import UserOrchardPermissions
from app.security.orchard_id_resolve import get_orchard_id_from_harvest_id, get_orchard_id_from_tree_id 

router = APIRouter(prefix="/harvest", tags=["harvest"])

# Helper dependency for POST harvest
async def orchard_id_from_create_harvest(
    harvest: CreateHarvestSchema,
    session: Session = Depends(create_session)
) -> int:
    tree_id = harvest.tree_id
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


@router.get("/{harvest_id}", response_model=HarvestSchema)
async def get_harvest(
    harvest_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to the orchard the harvest belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_view_access(
        orchard_id_dependency=get_orchard_id_from_harvest_id
    ))
) -> HarvestSchema:
    # The dependency handles authorization
    return HarvestService(session).get_harvest(harvest_id)


@router.post("/", response_model=HarvestSchema)
async def create_harvest(
    harvest: CreateHarvestSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard where the harvest is being created
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=orchard_id_from_create_harvest
    ))
) -> HarvestSchema:
    TreeService(session).get_tree(harvest.tree_id)
    # The dependency handles authorization
    return HarvestService(session).create_harvest(harvest)


@router.put("/{harvest_id}", response_model=HarvestSchema)
async def update_harvest(
    harvest_id: int,
    harvest: UpdateHarvestSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the harvest belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_harvest_id
    ))
) -> HarvestSchema:
    # The dependency handles authorization
    return HarvestService(session).update_harvest(harvest_id, harvest)


@router.delete("/{harvest_id}", response_model=HarvestSchema)
async def delete_harvest(
    harvest_id: int,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the harvest belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_harvest_id
    ))
) -> HarvestSchema:
    # The dependency handles authorization
    return HarvestService(session).delete_harvest(harvest_id)
