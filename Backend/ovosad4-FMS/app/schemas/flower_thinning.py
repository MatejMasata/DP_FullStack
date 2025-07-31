from datetime import datetime as datetime_type
from typing import Optional

from .base_schema import BaseSchema


class CreateFlowerThinningSchema(BaseSchema):
    tree_id: int = 1
    spraying_id: int = 1
    datetime: datetime_type
    mechanical: bool
    flower_clusters_before_thinning: int
    flower_clusters_for_thinning: int
    flower_clusters_after_thinning: int
    flower_clusters_before_thinning_one_year: int
    flower_clusters_for_thinning_one_year: int
    flower_clusters_after_thinning_one_year: int


class UpdateFlowerThinningSchema(BaseSchema):
    # tree_id and spraying_id are typically not updatable, so they are excluded.
    datetime: Optional[datetime_type] = None
    mechanical: Optional[bool] = None
    flower_clusters_before_thinning: Optional[int] = None
    flower_clusters_for_thinning: Optional[int] = None
    flower_clusters_after_thinning: Optional[int] = None
    flower_clusters_before_thinning_one_year: Optional[int] = None
    flower_clusters_for_thinning_one_year: Optional[int] = None
    flower_clusters_after_thinning_one_year: Optional[int] = None


class FlowerThinningSchema(CreateFlowerThinningSchema):
    id: int
