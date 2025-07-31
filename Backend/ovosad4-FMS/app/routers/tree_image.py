from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from typing import List

from app.backend.session import create_session
from app.schemas import TreeImageSchema, CreateTreeImageSchema, UpdateTreeImageSchema
from app.services import FileService, TreeService, TreeImageService

from app.security.auth import get_user_orchard_permissions, verify_orchard_view_access, verify_orchard_admin_access, verify_global_admin_access
from app.schemas.user_permissions import UserOrchardPermissions

from app.security.orchard_id_resolve import get_orchard_id_from_tree_id, get_orchard_id_from_tree_image_id


router = APIRouter(prefix="/tree_image", tags=["tree_image"])

# Helper dependency FOR POST tree_image
async def orchard_id_from_create_tree_image(
    tree_image: CreateTreeImageSchema,
    session: Session = Depends(create_session)
) -> int:
    tree_id=tree_image.tree_id
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


@router.get("/", response_model=List[TreeImageSchema])
async def get_tree_image_mastertable(
    session: Session = Depends(create_session),
    # Full permissions object to pass to the service for filtering
    permissions: UserOrchardPermissions = Depends(get_user_orchard_permissions)
) -> List[TreeImageSchema]:
    # Service handles filtering based on permissions
    return TreeImageService(session).get_tree_image_mastertable(permissions)


@router.get("/{tree_image_id}", response_model=TreeImageSchema)
async def get_tree_image(
    tree_image_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to the orchard the tree image belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_view_access(
        orchard_id_dependency=get_orchard_id_from_tree_image_id
    ))
) -> TreeImageSchema:
    # The dependency handles authorization
    return TreeImageService(session).get_tree_image(tree_image_id)


@router.post("/", response_model=TreeImageSchema)
async def create_tree_image(
        tree_image: CreateTreeImageSchema = Body(...),
        session: Session = Depends(create_session),
        # User must have ADMIN ACCESS to the orchard where the tree image is being created
        permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
            orchard_id_dependency=orchard_id_from_create_tree_image
        ))
) -> TreeImageSchema:

    TreeService(session).get_tree(tree_image.tree_id)
    FileService(session).get_file(tree_image.file_id)
    # The dependency handles authorization
    return TreeImageService(session).create_tree_image(tree_image)


@router.put("/{tree_image_id}", response_model=TreeImageSchema)
async def update_tree_image(
    tree_image_id: int,
    file_image: UpdateTreeImageSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the tree image belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_tree_image_id
    ))
) -> TreeImageSchema:
    # The dependency handles authorization
    return TreeImageService(session).update_tree_image(tree_image_id, file_image)


@router.delete("/{tree_image_id}", response_model=TreeImageSchema)
async def delete_tree_image(
    tree_image_id: int,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the tree image belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
            orchard_id_dependency=get_orchard_id_from_tree_image_id
        ))
) -> TreeImageSchema:
    # The dependency handles authorization
    return TreeImageService(session).delete_tree_image(tree_image_id)
