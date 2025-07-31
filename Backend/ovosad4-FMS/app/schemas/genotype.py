from .base_schema import BaseSchema


class GenotypeSchema(BaseSchema):
    id: int
    name: str

    trees: list[int]
