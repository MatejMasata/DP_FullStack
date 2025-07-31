from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from app.schemas import CreateFruitThinningSchema, UpdateFruitThinningSchema, FruitThinningSchema
from app.services import TreeService
from app.services import FruitThinningService
from app.services import SprayingService
from app.backend.session import create_session

from app.security.auth import verify_orchard_view_access, verify_orchard_admin_access
from app.schemas.user_permissions import UserOrchardPermissions
from app.security.orchard_id_resolve import get_orchard_id_from_fruit_thinning_id, get_orchard_id_from_tree_id

router = APIRouter(prefix="/fruit-thinning", tags=["fruit-thinning"])


# HELPER DEPENDENCY FOR POST fruit thinning
async def orchard_id_from_create_fruit_thinning(
    fruit_thinning: CreateFruitThinningSchema,
    session: Session = Depends(create_session)
) -> int:
    tree_id=fruit_thinning.tree_id
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


@router.get("/{fruit_thinning_id}", response_model=FruitThinningSchema)
async def get_fruit_thinning(
    fruit_thinning_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to the orchard the fruit thinning belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_view_access(
        orchard_id_dependency=get_orchard_id_from_fruit_thinning_id
    ))
) -> FruitThinningSchema:
    # The dependency handles authorization
    return FruitThinningService(session).get_fruit_thinning(fruit_thinning_id)



@router.post("/", response_model=FruitThinningSchema)
async def create_fruit_thinning(
        fruit_thinning: CreateFruitThinningSchema = Body(...),
        session: Session = Depends(create_session),
        # User must have ADMIN ACCESS to the orchard where the fruit thinning is being created
        permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
            orchard_id_dependency=orchard_id_from_create_fruit_thinning
        ))
) -> FruitThinningSchema:

    SprayingService(session).get_spraying(fruit_thinning.spraying_id)
    TreeService(session).get_tree(fruit_thinning.tree_id)
    # The dependency handles authorization
    return FruitThinningService(session).create_fruit_thinning(fruit_thinning)


@router.put("/{fruit_thinning_id}", response_model=FruitThinningSchema)
async def update_fruit_thinning(
    fruit_thinning_id: int,
    fruit_thinning: UpdateFruitThinningSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard the fruit thinning belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_fruit_thinning_id
    ))
) -> FruitThinningSchema:
    # The dependency handles authorization
    return FruitThinningService(session).update_fruit_thinning(fruit_thinning_id, fruit_thinning)


@router.delete("/{fruit_thinning_id}", response_model=FruitThinningSchema)
async def delete_fruit_thinning(
    fruit_thinning_id: int,
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to the orchard this fruit thinning belongs to
    permissions: UserOrchardPermissions = Depends(verify_orchard_admin_access(
        orchard_id_dependency=get_orchard_id_from_fruit_thinning_id
    ))
) -> FruitThinningSchema:
    # The dependency handles authorization
    return FruitThinningService(session).delete_fruit_thinning(fruit_thinning_id)
