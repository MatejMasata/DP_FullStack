from typing import Optional

from .base_schema import BaseSchema


class CreateAgentSchema(BaseSchema):
    name: str
    description: str

class UpdateAgentSchema(BaseSchema):
    name: Optional[str] = None
    description: Optional[str] = None


class AgentSchema(CreateAgentSchema):
    id: int

    sprayings: list[int]
