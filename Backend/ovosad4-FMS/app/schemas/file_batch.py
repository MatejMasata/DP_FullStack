from .base_schema import BaseSchema
from typing import Optional

class CreateFileBatchSchema(BaseSchema):
    label: str


class UpdateFileBatchSchema(BaseSchema):
    label: Optional[str] = None


class FileBatchSchema(CreateFileBatchSchema):
    id: int

    files: list[int]
