from .base_schema import BaseSchema
from typing import Optional

class CreateTreeImageSchema(BaseSchema):
    tree_id: int = 1
    file_id: int = 1


class UpdateTreeImageSchema(BaseSchema):
    file_id: int

class TreeImageSchema(CreateTreeImageSchema):
    id: int
