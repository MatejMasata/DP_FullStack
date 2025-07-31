from sqlalchemy import select
from fastapi import HTTPException

from app.models.orchard import Rootstock
from app.schemas import RootstockSchema
from .base_service import BaseService, BaseDataManager


class RootstockService(BaseService):

    def get_rootstock(self, rootstock_id: int):
        return RootstockDataManager(self.session).get_rootstock(rootstock_id)


class RootstockDataManager(BaseDataManager):

    @staticmethod
    def _prepare_payload(model):
        return RootstockSchema.model_validate({**model.__dict__, **model.submodel_ids})

    def get_rootstock(self, rootstock_id: int) -> RootstockSchema:
        model = self.session.scalar(select(Rootstock).where(Rootstock.id == rootstock_id))

        if not model:
            raise HTTPException(404, f"{rootstock_id=} not found")

        return self._prepare_payload(model)
