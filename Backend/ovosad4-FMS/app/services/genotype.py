from sqlalchemy import select
from fastapi import HTTPException

from app.models.orchard import Genotype
from app.schemas import GenotypeSchema
from .base_service import BaseService, BaseDataManager


class GenotypeService(BaseService):

    def get_genotype(self, genotype_id: int):
        return GenotypeDataManager(self.session).get_genotype(genotype_id)


class GenotypeDataManager(BaseDataManager):

    @staticmethod
    def _prepare_payload(model):
        return GenotypeSchema.model_validate({**model.__dict__, **model.submodel_ids})

    def get_genotype(self, genotype_id: int) -> GenotypeSchema:
        model = self.session.scalar(select(Genotype).where(Genotype.id == genotype_id))

        if not model:
            raise HTTPException(404, f"{genotype_id=} not found")

        return self._prepare_payload(model)
