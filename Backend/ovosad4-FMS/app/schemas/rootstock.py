from .base_schema import BaseSchema


class RootstockSchema(BaseSchema):
    id: int
    name: str

    trees: list[int]
