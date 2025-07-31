from .base_schema import BaseSchema


class CreateOrchardSchema(BaseSchema):
    name: str


class UpdateOrchardSchema(CreateOrchardSchema):
    ...


class OrchardSchema(CreateOrchardSchema):
    id: int

    trees: list[int]
