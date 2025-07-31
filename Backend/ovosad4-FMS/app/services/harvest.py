from sqlalchemy import select
from fastapi import HTTPException

from app.models.orchard import Harvest
from app.schemas import CreateHarvestSchema, UpdateHarvestSchema, HarvestSchema
from .base_service import BaseService, BaseDataManager


class HarvestService(BaseService):

    def get_harvest(self, harvest_id: int):
        return HarvestDataManager(self.session).get_harvest(harvest_id)

    def create_harvest(self, harvest: CreateHarvestSchema):
        harvest_model = Harvest(**harvest.model_dump())
        return HarvestDataManager(self.session).create_harvest(harvest_model)
    
    def update_harvest(self, harvest_id: int, harvest: UpdateHarvestSchema) -> HarvestSchema:
        return HarvestDataManager(self.session).update_harvest(harvest_id, harvest)

    def delete_harvest(self, harvest_id: int):
        return HarvestDataManager(self.session).delete_harvest(harvest_id)


class HarvestDataManager(BaseDataManager):

    def get_harvest(self, harvest_id: int) -> HarvestSchema:
        model = self.session.scalar(select(Harvest).where(Harvest.id == harvest_id))
        if not model:
            raise HTTPException(404, f"{harvest_id=} not found")
        return HarvestSchema.model_validate(model)

    def create_harvest(self, harvest: Harvest) -> HarvestSchema:
        self.session.add(harvest)
        self.session.flush()
        self.session.refresh(harvest)
        return HarvestSchema.model_validate(harvest)

    def update_harvest(self, harvest_id: int, harvest: UpdateHarvestSchema) -> HarvestSchema:
        model = self.session.scalar(select(Harvest).where(Harvest.id == harvest_id))
        if not model:
            raise HTTPException(404, f"{harvest_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = harvest.model_dump(exclude_unset=True)

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            # This should not happen, safeguard
            if key == "tree_id":
                continue
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return HarvestSchema.model_validate(model)

    def delete_harvest(self, harvest_id: int) -> HarvestSchema:
        model = self.session.scalar(select(Harvest).where(Harvest.id == harvest_id))
        if not model:
            raise HTTPException(404, f"{harvest_id=} not found")
        self.session.delete(model)
        return HarvestSchema.model_validate(model)
