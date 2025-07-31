from .base_schema import BaseSchema
from typing import Optional


class CreateTreeSchema(BaseSchema):
    orchard_id: int = 1
    genotype_id: int = 1
    rootstock_id: int = 1
    row: int
    field: int
    number: int
    latitude: float
    longitude: float

    spacing: float
    growth_type: str
    training_shape: str
    planting_date: str
    initial_age: str
    nursery_tree_type: str


class UpdateTreeSchema(BaseSchema):
    # orchard_id is not updatable
    genotype_id: Optional[int] = None
    rootstock_id: Optional[int] = None
    row: Optional[int] = None
    field: Optional[int] = None
    number: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    spacing: Optional[float] = None
    growth_type: Optional[str] = None
    training_shape: Optional[str] = None
    planting_date: Optional[str] = None
    initial_age: Optional[str] = None
    nursery_tree_type: Optional[str] = None

class TreeSchema(CreateTreeSchema):
    id: int

    tree_images: list[int]
    tree_data: list[int]
    harvests: list[int]
    flower_thinnings: list[int]
    fruit_thinnings: list[int]
    sprayings: list[int]
