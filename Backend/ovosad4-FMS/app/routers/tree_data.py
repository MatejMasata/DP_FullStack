from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.backend.session import create_session
from app.schemas import CreateTreeDataSchema, UpdateTreeDataSchema, TreeDataSchema
from app.services import TreeDataService

from app.security.auth import get_user_orchard_permissions, verify_orchard_view_access, verify_orchard_admin_access
from app.security.orchard_id_resolve import get_orchard_id_from_tree_id, get_orchard_id_from_tree_data_id
from app.schemas.user_permissions import UserOrchardPermissions

router = APIRouter(prefix="/tree_data", tags=["tree_data"])

# Helper dependency for POST tree data
async def orchard_id_from_tree_data(
    tree_data: CreateTreeDataSchema,
    session: Session = Depends(create_session)
) -> int:
    tree_id = tree_data.tree_id
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


@router.get("/{tree_data_id}", response_model=TreeDataSchema)
async def get_tree_data(
    tree_data_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to the orchard the tree_data belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_view_access(
        orchard_id_dependency=get_orchard_id_from_tree_data_id
    ))
) -> TreeDataSchema:
    # The dependency chain handles authorization
    return TreeDataService(session).get_tree_data(tree_data_id)


@router.post("/", response_model=TreeDataSchema)
async def create_tree_data(
    tree_data: CreateTreeDataSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard where the tree data is being created
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=orchard_id_from_tree_data
    ))
) -> TreeDataSchema:
    # The dependency chain handles authorization
    return TreeDataService(session).create_tree_data(tree_data)


@router.put("/{tree_data_id}", response_model=TreeDataSchema)
async def update_tree_data(
    tree_data_id: int,
    tree_data: UpdateTreeDataSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the tree_data belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_tree_data_id
    ))
) -> TreeDataSchema:
    # The dependency chain handles authorization
    return TreeDataService(session).update_tree_data(tree_data_id, tree_data)


@router.delete("/{tree_data_id}", response_model=TreeDataSchema)
async def delete_tree_data(
    tree_data_id: int,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the tree_data belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_tree_data_id
    ))
) -> TreeDataSchema:
    # The dependency chain handles authorization
    return TreeDataService(session).delete_tree_data(tree_data_id)
