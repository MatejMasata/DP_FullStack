from datetime import datetime as datetime_type
from typing import Optional

from .base_schema import BaseSchema


class CreateFruitThinningSchema(BaseSchema):
    tree_id: int = 1
    spraying_id: int = 1
    datetime: datetime_type
    mechanical: bool
    cropload_for_4: int
    cropload_for_3: int
    cropload_for_1: int
    fruit_for_thinning: int
    fruit_thinning_time: int


class UpdateFruitThinningSchema(BaseSchema):
    # tree_id and spraying_id are not updatable
    datetime: Optional[datetime_type] = None
    mechanical: Optional[bool] = None
    cropload_for_4: Optional[int] = None
    cropload_for_3: Optional[int] = None
    cropload_for_1: Optional[int] = None
    fruit_for_thinning: Optional[int] = None
    fruit_thinning_time: Optional[int] = None


class FruitThinningSchema(CreateFruitThinningSchema):
    id: int
