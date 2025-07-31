from datetime import datetime as datetime_type
from typing import Optional

from .base_schema import BaseSchema


class CreateSprayingSchema(BaseSchema):
    tree_id: int 
    agent_id: int = 1
    datetime: datetime_type
    volume: float


class UpdateSprayingSchema(BaseSchema):
    # tree_id is not updatable
    agent_id: Optional[int] = None
    datetime: Optional[datetime_type] = None
    volume: Optional[float] = None


class SprayingSchema(CreateSprayingSchema):
    id: int

    flower_thinnings: list[int]
    fruit_thinnings: list[int]
