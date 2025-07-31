import os
import pathlib
import uuid

from sqlalchemy import select
from fastapi import HTTPException

from app.models.orchard import File
from app.schemas import FileSchema, CreateFileSchema, UpdateFileSchema
from .base_service import BaseService, BaseDataManager


class FileService(BaseService):

    def get_file_mastertable(self) -> list[FileSchema]:
        return FileDataManager(self.session).get_file_mastertable()

    def get_file(self, file_id: int) -> FileSchema:
        return FileDataManager(self.session).get_file(file_id)

    def get_file_content(self, file_id: int) -> tuple[bytes, str]:
        return FileDataManager(self.session).get_file_content(file_id)

    def create_file(self, file: CreateFileSchema, content: bytes) -> FileSchema:
        file_model = File(**file.model_dump())
        return FileDataManager(self.session).create_file(file_model, content)

    def update_file(self, file: UpdateFileSchema):
        raise NotImplemented()

    def delete_file(self, file_id: int) -> FileSchema:
        return FileDataManager(self.session).delete_file(file_id)


class FileDataManager(BaseDataManager):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.file_storage_service = FileStorageService()

    @staticmethod
    def _prepare_payload(model):
        return FileSchema.model_validate({**model.__dict__, **model.submodel_ids})

    def get_file_mastertable(self) -> list[FileSchema]:
        model_list = self.session.scalars(select(File)).all()

        return [self._prepare_payload(model) for model in model_list]

    def get_file(self, file_id: int) -> FileSchema:
        model = self.session.scalar(select(File).where(File.id == file_id))

        if not model:
            raise HTTPException(404, f"{file_id=} not found")

        return self._prepare_payload(model)

    def get_file_content(self, file_id: int) -> tuple[bytes, str]:
        model = self.session.scalar(select(File).where(File.id == file_id))

        if not model:
            raise HTTPException(404, f"{file_id=} not found")

        content = self.file_storage_service.get_file(model.uid)

        return content, model.mime

    def create_file(self, file: File, content: bytes) -> FileSchema:

        uid = self.file_storage_service.store_file(content)
        file.uid = uid

        self.session.add(file)
        self.session.flush()
        self.session.refresh(file)

        return self._prepare_payload(file)

    def update_file(self) -> None:
        raise NotImplemented()

    def delete_file(self, file_id: int) -> FileSchema:
        model = self.session.scalar(select(File).where(File.id == file_id))

        if not model:
            raise HTTPException(404, f"{file_id=} not found")

        self.session.delete(model)

        return self._prepare_payload(model)


class FileStorageService:

    def __init__(self):

        self.storage_dir = pathlib.Path(os.getenv("FILE_STORAGE_DIRECTORY"))

    @staticmethod
    def _generate_uid() -> str:
        return str(uuid.uuid4())

    def store_file(self, content: bytes) -> str:
        uid = self._generate_uid()

        with open(self.storage_dir / uid, '+wb') as file:
            file.write(content)

        return uid

    def get_file(self, uid: str) -> bytes:

        with open(self.storage_dir / uid, 'rb') as file:
            content = file.read()

        return content

    def delete_file(self, uid: str) -> None:
        raise NotImplemented()
