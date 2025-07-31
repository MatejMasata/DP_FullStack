from datetime import datetime as datetime_type
from typing import Optional

from .base_schema import BaseSchema


class CreateHarvestSchema(BaseSchema):
    tree_id: int
    datetime: datetime_type
    elapsed_time: int
    fruit_under_60mm_quantity: int
    fruit_under_60mm_weight: int
    fruit_under_70mm_quantity: int
    fruit_under_70mm_weight: int
    fruit_over_70mm_quantity: int
    fruit_over_70mm_weight: int
    average_fruit_weight: float
    aphids_damage_quantity: int
    aphids_damage_weight: int
    damaged_percentage: int


class UpdateHarvestSchema(BaseSchema):
    # tree_id is not updatable
    datetime: Optional[datetime_type] = None
    elapsed_time: Optional[int] = None
    fruit_under_60mm_quantity: Optional[int] = None
    fruit_under_60mm_weight: Optional[int] = None
    fruit_under_70mm_quantity: Optional[int] = None
    fruit_under_70mm_weight: Optional[int] = None
    fruit_over_70mm_quantity: Optional[int] = None
    fruit_over_70mm_weight: Optional[int] = None
    average_fruit_weight: Optional[float] = None
    aphids_damage_quantity: Optional[int] = None
    aphids_damage_weight: Optional[int] = None
    damaged_percentage: Optional[int] = None


class HarvestSchema(CreateHarvestSchema):
    id: int
