from datetime import datetime as datetime_type
from typing import Optional

from .base_schema import BaseSchema


class CreateFileSchema(BaseSchema):
    file_batch_id: int = 1
    name: str
    datetime: datetime_type
    mime: str


class UpdateFileSchema(BaseSchema):
    name: Optional[str] = None
    datetime: Optional[datetime_type] = None
    mime: Optional[str] = None


class FileSchema(CreateFileSchema):
    id: int
    # uid: str

    tree_images: list[int]
