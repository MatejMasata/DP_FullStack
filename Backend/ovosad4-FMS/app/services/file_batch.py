from sqlalchemy import select
from fastapi import HTTPException

from app.schemas import CreateFileBatchSchema, UpdateFileBatchSchema
from app.models.orchard import FileBatch
from app.schemas import FileBatchSchema
from .base_service import BaseService, BaseDataManager

"""
get_file_batch, create_file_batch, update_file_batch, delete_file_batch
- their authorization is handled by the verify_orchard_view_access, verify_orchard_admin_access, verify_global_admin_access dependencies in the router
"""

class FileBatchService(BaseService):

    def get_file_batch_mastertable(self):
        return FileBatchDataManager(self.session).get_file_batch_mastertable()

    def get_file_batch(self, file_batch_id: int):
        return FileBatchDataManager(self.session).get_file_batch(file_batch_id)

    def create_file_batch(self, file_batch: CreateFileBatchSchema):
        file_batch_model = FileBatch(**file_batch.model_dump())
        return FileBatchDataManager(self.session).create_file_batch(file_batch_model)

    def update_file_batch(self, file_batch_id: int, file_batch: UpdateFileBatchSchema):
        return FileBatchDataManager(self.session).update_file_batch(file_batch_id, file_batch)

    def delete_file_batch(self, file_batch_id: int):
        return FileBatchDataManager(self.session).delete_file_batch(file_batch_id)


class FileBatchDataManager(BaseDataManager):

    @staticmethod
    def _prepare_payload(model):
        return FileBatchSchema.model_validate({**model.__dict__, **model.submodel_ids})

    def get_file_batch_mastertable(self) -> list[FileBatchSchema]:
        model_list = self.session.scalars(select(FileBatch)).all()

        return [self._prepare_payload(model) for model in model_list]

    def get_file_batch(self, file_batch_id: int) -> FileBatchSchema:
        model = self.session.scalar(select(FileBatch).where(FileBatch.id == file_batch_id))

        if not model:
            raise HTTPException(404, f"{file_batch_id=} not found")

        return self._prepare_payload(model)

    def create_file_batch(self, file_batch: FileBatch) -> FileBatchSchema:

        self.session.add(file_batch)
        self.session.flush()
        self.session.refresh(file_batch)

        return self._prepare_payload(file_batch)

    def update_file_batch(self, file_batch_id: int, file_batch: UpdateFileBatchSchema) -> FileBatchSchema:
        model = self.session.scalar(select(FileBatch).where(FileBatch.id == file_batch_id))

        if not model:
            raise HTTPException(404, f"{file_batch_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = file_batch.model_dump(exclude_unset=True)

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return self._prepare_payload(model)

    def delete_file_batch(self, file_batch_id: int) -> FileBatchSchema:
        model = self.session.scalar(select(FileBatch).where(FileBatch.id == file_batch_id))

        if not model:
            raise HTTPException(404, f"{file_batch_id=} not found")

        self.session.delete(model)

        return self._prepare_payload(model)
