from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.backend.session import create_session
from app.schemas import CreateOrchardSchema, OrchardSchema, UpdateOrchardSchema
from app.services import OrchardService

from app.security.auth import get_user_orchard_permissions, verify_orchard_view_access, verify_orchard_admin_access, verify_global_admin_access
from app.schemas.user_permissions import UserOrchardPermissions

router = APIRouter(prefix="/orchard", tags=["orchard"])

# Helper dependency for verify_orchard_view_access()
async def get_orchard_id_from_path(orchard_id: int) -> int:
    return orchard_id

@router.get("/", response_model=list[OrchardSchema])
async def get_orchard_mastertable(
    session: Session = Depends(create_session),
    # Full permissions object to pass to the service for filtering
    permissions: UserOrchardPermissions = Depends(get_user_orchard_permissions)
) -> list[OrchardSchema]:
    # Service handles filtering based on permissions
    return OrchardService(session).get_orchard_mastertable(permissions)


@router.get("/{orchard_id}", response_model=OrchardSchema)
async def get_orchard(
    orchard_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to the orchard
    permissions: UserOrchardPermissions = Depends(verify_orchard_view_access(
        orchard_id_dependency=get_orchard_id_from_path
    ))
) -> OrchardSchema:
    # The dependency handles authorization
    return OrchardService(session).get_orchard(orchard_id)


@router.post("/", response_model=OrchardSchema)
async def create_orchard(
    orchard_dto: CreateOrchardSchema,
    session: Session = Depends(create_session),
    # User must have GLOBAL ADMIN ACCESS to create an orchard
    permissions = Depends(verify_global_admin_access)
) -> OrchardSchema:
    # The dependency handles authorization
    return await OrchardService(session).create_orchard(orchard_dto)


@router.put("/{orchard_id}", response_model=OrchardSchema)
async def update_orchard(
    orchard_id: int,
    orchard_dto: UpdateOrchardSchema,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_path
    ))
) -> OrchardSchema:
    # The dependency handles authorization
    return OrchardService(session).update_orchard(orchard_id, orchard_dto)


@router.delete("/{orchard_id}", response_model=OrchardSchema)
async def delete_orchard(
    orchard_id: int,
    session: Session = Depends(create_session),
    # User must have GLOBAL ADMIN ACCESS to delete an orchard
    permissions = Depends(verify_global_admin_access)
) -> OrchardSchema:
    return await OrchardService(session).delete_orchard(orchard_id)