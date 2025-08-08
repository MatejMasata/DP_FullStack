from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List

from app.backend.session import create_session
from app.schemas import FileBatchSchema, CreateFileBatchSchema, UpdateFileBatchSchema
from app.services import FileBatchService

from app.security.auth import verify_any_orchard_view_access, verify_any_orchard_admin_access, verify_global_admin_access
from app.schemas.user_permissions import UserOrchardPermissions

router = APIRouter(prefix="/file_batch", tags=["file_batch"])


@router.get("/", response_model=List[FileBatchSchema])
async def get_file_batch_mastertable(
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to atleast one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_view_access)
) -> List[FileBatchSchema]:
    # The dependency chain handles authorization
    return FileBatchService(session).get_file_batch_mastertable()


@router.get("/{file_batch_id}", response_model=FileBatchSchema)
async def get_file_batch(
    file_batch_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to atleast one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_view_access)
) -> FileBatchSchema:
    # The dependency chain handles authorization
    return FileBatchService(session).get_file_batch(file_batch_id)


@router.post("/", response_model=FileBatchSchema)
async def create_file_batch(
    file_batch: CreateFileBatchSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to atleast one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_admin_access)
) -> FileBatchSchema:
    # The dependency chain handles authorization
    return FileBatchService(session).create_file_batch(file_batch)


@router.put("/{file_batch_id}", response_model=FileBatchSchema)
async def update_file_batch(
    file_batch_id: int,
    file_batch: UpdateFileBatchSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to atleast one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_admin_access)
) -> FileBatchSchema:
    # The dependency chain handles authorization
    return FileBatchService(session).update_file_batch(file_batch_id, file_batch)


@router.delete("/{file_batch_id}", response_model=FileBatchSchema)
async def delete_file_batch(
    file_batch_id: int,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to atleast one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_admin_access)
) -> FileBatchSchema:
    # The dependency chain handles authorization
    return FileBatchService(session).delete_file_batch(file_batch_id)
