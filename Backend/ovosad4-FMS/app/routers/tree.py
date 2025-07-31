from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.backend.session import create_session
from app.schemas import TreeSchema, CreateTreeSchema, UpdateTreeSchema
from app.services import TreeService, OrchardService, RootstockService, GenotypeService

from app.security.auth import get_user_orchard_permissions, verify_orchard_view_access, verify_orchard_admin_access
from app.schemas.user_permissions import UserOrchardPermissions
from app.security.orchard_id_resolve import get_orchard_id_from_tree_id

router = APIRouter(prefix="/tree", tags=["tree"])

# Helper dependency for POST tree
async def orchard_id_from_tree_dto(tree_dto: CreateTreeSchema) -> int:
    return tree_dto.orchard_id


@router.get("/", response_model=list[TreeSchema])
async def get_tree_mastertable(
    session: Session = Depends(create_session),
    # Full permissions object to pass to the service for filtering
    permissions: UserOrchardPermissions = Depends(get_user_orchard_permissions)
) -> list[TreeSchema]:
    # Service handles filtering based on permissions
    return TreeService(session).get_tree_mastertable(permissions)


@router.get("/{tree_id}", response_model=TreeSchema)
async def get_tree(
    tree_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to the orchard this specific tree belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_view_access(
        orchard_id_dependency=get_orchard_id_from_tree_id
    ))
) -> TreeSchema:
    # The dependency chain handles authorization
    return TreeService(session).get_tree(tree_id)


@router.post("/", response_model=TreeSchema)
async def create_tree(
    tree_dto: CreateTreeSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard where the tree is being created
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=orchard_id_from_tree_dto
    ))
) -> TreeSchema:
    OrchardService(session).get_orchard(tree_dto.orchard_id)
    RootstockService(session).get_rootstock(tree_dto.rootstock_id)
    GenotypeService(session).get_genotype(tree_dto.genotype_id)
    # The dependency chain handles authorization
    return TreeService(session).create_tree(tree_dto)


@router.put("/{tree_id}", response_model=TreeSchema)
async def update_tree(
    tree_id: int,
    tree_dto: UpdateTreeSchema  = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the tree tree belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_tree_id
    ))
) -> TreeSchema:
    # The dependency chain handles authorization
    return TreeService(session).update_tree(tree_id, tree_dto)


@router.delete("/{tree_id}", response_model=TreeSchema)
async def delete_tree(
    tree_id: int,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the tree belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_tree_id
    ))
) -> TreeSchema:
    # The dependency chain handles authorization
    return TreeService(session).delete_tree(tree_id)
