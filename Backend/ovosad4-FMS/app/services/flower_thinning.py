from sqlalchemy import select
from fastapi import HTTPException

from app.models.orchard import FlowerThinning
from app.schemas import CreateFlowerThinningSchema, UpdateFlowerThinningSchema, FlowerThinningSchema
from .base_service import BaseService, BaseDataManager

"""
get_flower_thinning, create_flower_thinning, update_flower_thinning, delete_flower_thinning
- their authorization is handled by the verify_orchard_view_access and verify_orchard_admin_access dependencies in the router
"""

class FlowerThinningService(BaseService):

    def get_flower_thinning(self, flower_thinning_id: int):
        return FlowerThinningDataManager(self.session).get_flower_thinning(flower_thinning_id)

    def create_flower_thinning(self, flower_thinning: CreateFlowerThinningSchema):
        flower_thinning_model = FlowerThinning(**flower_thinning.model_dump())
        return FlowerThinningDataManager(self.session).create_flower_thinning(flower_thinning_model)

    def update_flower_thinning(self, flower_thinning_id: int, flower_thinning: UpdateFlowerThinningSchema):
        return FlowerThinningDataManager(self.session).update_flower_thinning(flower_thinning_id, flower_thinning)


    def delete_flower_thinning(self, flower_thinning_id: int):
        return FlowerThinningDataManager(self.session).delete_flower_thinning(flower_thinning_id)


class FlowerThinningDataManager(BaseDataManager):

    def get_flower_thinning(self, flower_thinning_id: int) -> FlowerThinningSchema:
        model = self.session.scalar(select(FlowerThinning).where(FlowerThinning.id == flower_thinning_id))
        if not model:
            raise HTTPException(404, f"{flower_thinning_id=} not found")
        return FlowerThinningSchema.model_validate(model)

    def create_flower_thinning(self, flower_thinning: FlowerThinning) -> FlowerThinningSchema:
        self.session.add(flower_thinning)
        self.session.flush()
        self.session.refresh(flower_thinning)
        return FlowerThinningSchema.model_validate(flower_thinning)

    def update_flower_thinning(self, flower_thinning_id: int, flower_thinning: UpdateFlowerThinningSchema) -> FlowerThinningSchema:
        model = self.session.scalar(select(FlowerThinning).where(FlowerThinning.id == flower_thinning_id))

        if not model:
            raise HTTPException(404, f"{flower_thinning_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = flower_thinning.model_dump(exclude_unset=True)

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            # This should not happen, safeguard
            if key in ["tree_id", "spraying_id"]:
                continue
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return FlowerThinningSchema.model_validate(model)

    def delete_flower_thinning(self, flower_thinning_id: int) -> FlowerThinningSchema:
        model = self.session.scalar(select(FlowerThinning).where(FlowerThinning.id == flower_thinning_id))
        if not model:
            raise HTTPException(404, f"{flower_thinning_id=} not found")
        self.session.delete(model)
        return FlowerThinningSchema.model_validate(model)
