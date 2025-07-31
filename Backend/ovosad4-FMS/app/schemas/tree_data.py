from datetime import datetime as datetime_type
from typing import Optional

from .base_schema import BaseSchema


class CreateTreeDataSchema(BaseSchema):
    tree_id: int = 1
    datetime: datetime_type
    one_year_height: int
    fruiting_wood_height: int
    total_height: int
    trunk_girth: int
    suckering: int
    summer_pruning_date: datetime_type
    winter_pruning_date: datetime_type
    summer_pruning_note: Optional[str] = None
    winter_pruning_note: Optional[str] = None


class UpdateTreeDataSchema(BaseSchema):
    # tree_id is not updatable
    datetime: Optional[datetime_type] = None
    one_year_height: Optional[int] = None
    fruiting_wood_height: Optional[int] = None
    total_height: Optional[int] = None
    trunk_girth: Optional[int] = None
    suckering: Optional[int] = None
    summer_pruning_date: Optional[datetime_type] = None
    winter_pruning_date: Optional[datetime_type] = None
    summer_pruning_note: Optional[str] = None
    winter_pruning_note: Optional[str] = None


class TreeDataSchema(CreateTreeDataSchema):
    id: int
