from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.schemas import CreateFlowerThinningSchema, UpdateFlowerThinningSchema, FlowerThinningSchema
from app.services import FlowerThinningService, TreeService
from app.services import SprayingService
from app.backend.session import create_session

from app.security.auth import verify_orchard_view_access, verify_orchard_admin_access
from app.schemas.user_permissions import UserOrchardPermissions
from app.security.orchard_id_resolve import get_orchard_id_from_flower_thinning_id, get_orchard_id_from_tree_id

router = APIRouter(prefix="/flower-thinning", tags=["flower-thinning"])


# Helper dependency FOR POST flower thinning
async def orchard_id_from_create_flower_thinning(
    flower_thinning: CreateFlowerThinningSchema,
    session: Session = Depends(create_session)
) -> int:
    tree_id=flower_thinning.tree_id
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


@router.get("/{flower_thinning_id}", response_model=FlowerThinningSchema)
async def get_flower_thinning(
    flower_thinning_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to the orchard the flower thinning belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_view_access(
        orchard_id_dependency=get_orchard_id_from_flower_thinning_id
    ))
) -> FlowerThinningSchema:
    # The dependency handles authorization
    return FlowerThinningService(session).get_flower_thinning(flower_thinning_id)


@router.post("/", response_model=FlowerThinningSchema)
async def create_flower_thinning(
        flower_thinning: CreateFlowerThinningSchema = Body(...),
        session: Session = Depends(create_session),
        # User must have ADMIN ACCESS to the orchard where the flower thinning is being created
        permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
            orchard_id_dependency=orchard_id_from_create_flower_thinning
        ))
) -> FlowerThinningSchema:
    
    SprayingService(session).get_spraying(flower_thinning.spraying_id)
    TreeService(session).get_tree(flower_thinning.tree_id)
    # The dependency handles authorization
    return FlowerThinningService(session).create_flower_thinning(flower_thinning)


@router.put("/{flower_thinning_id}", response_model=FlowerThinningSchema)
async def update_flower_thinning(
    flower_thinning_id: int,
    flower_thinning: UpdateFlowerThinningSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the flower thinning belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_flower_thinning_id
    ))
) -> FlowerThinningSchema:
    # The dependency handles authorization
    return FlowerThinningService(session).update_flower_thinning(flower_thinning_id, flower_thinning)


@router.delete("/{flower_thinning_id}", response_model=FlowerThinningSchema)
async def delete_flower_thinning(
    flower_thinning_id: int,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the flower thinning belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_flower_thinning_id
    ))
) -> FlowerThinningSchema:
    # The dependency handles authorization
    return FlowerThinningService(session).delete_flower_thinning(flower_thinning_id)
