from sqlalchemy import select
from fastapi import HTTPException

from app.models.orchard import FruitThinning
from app.schemas import CreateFruitThinningSchema, UpdateFruitThinningSchema, FruitThinningSchema
from .base_service import BaseService, BaseDataManager

"""
get_fruit_thinning, create_fruit_thinning, update_fruit_thinning, delete_fruit_thinning
- their authorization is handled by the verify_orchard_view_access and verify_orchard_admin_access dependencies in the router
"""

class FruitThinningService(BaseService):

    def get_fruit_thinning(self, fruit_thinning_id: int):
        return FruitThinningDataManager(self.session).get_fruit_thinning(fruit_thinning_id)

    def create_fruit_thinning(self, fruit_thinning: CreateFruitThinningSchema):
        fruit_thinning_model = FruitThinning(**fruit_thinning.model_dump())
        return FruitThinningDataManager(self.session).create_fruit_thinning(fruit_thinning_model)

    def update_fruit_thinning(self, fruit_thinning_id: int, fruit_thinning: UpdateFruitThinningSchema):
        return FruitThinningDataManager(self.session).update_fruit_thinning(fruit_thinning_id, fruit_thinning)

    def delete_fruit_thinning(self, fruit_thinning_id: int):
        return FruitThinningDataManager(self.session).delete_fruit_thinning(fruit_thinning_id)


class FruitThinningDataManager(BaseDataManager):

    def get_fruit_thinning(self, fruit_thinning_id: int) -> FruitThinningSchema:
        model = self.session.scalar(select(FruitThinning).where(FruitThinning.id == fruit_thinning_id))
        if not model:
            raise HTTPException(404, f"{fruit_thinning_id=} not found")
        return FruitThinningSchema.model_validate(model)

    def create_fruit_thinning(self, fruit_thinning: FruitThinning) -> FruitThinningSchema:
        self.session.add(fruit_thinning)
        self.session.flush()
        self.session.refresh(fruit_thinning)
        return FruitThinningSchema.model_validate(fruit_thinning)
    
    def update_fruit_thinning(self, fruit_thinning_id: int, fruit_thinning: UpdateFruitThinningSchema) -> FruitThinningSchema:
        model = self.session.scalar(select(FruitThinning).where(FruitThinning.id == fruit_thinning_id))

        if not model:
            raise HTTPException(404, f"{fruit_thinning_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = fruit_thinning.model_dump(exclude_unset=True)

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            # This should not happen, safeguard
            if key in ["tree_id", "spraying_id"]:
                continue
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return FruitThinningSchema.model_validate(model)

    def delete_fruit_thinning(self, fruit_thinning_id: int) -> FruitThinningSchema:
        model = self.session.scalar(select(FruitThinning).where(FruitThinning.id == fruit_thinning_id))
        if not model:
            raise HTTPException(404, f"{fruit_thinning_id=} not found")
        self.session.delete(model)
        return FruitThinningSchema.model_validate(model)
