from sqlalchemy import select
from fastapi import HTTPException
from typing import List

from app.models.orchard import Agent
from app.schemas import CreateAgentSchema, UpdateAgentSchema, AgentSchema
from .base_service import BaseService, BaseDataManager

"""
get_agent create_agent, update_agent, delete_agent
- their authorization is handled by the verify_orchard_view_access, verify_orchard_admin_access, verify_global_admin_access dependencies in the router
"""

class AgentService(BaseService):

    # New method for mastertable
    def get_agent_mastertable(self) -> List[AgentSchema]:
        return AgentDataManager(self.session).get_agent_mastertable()
    
    def get_agent(self, agent_id: int):
        return AgentDataManager(self.session).get_agent(agent_id)

    def create_agent(self, agent: CreateAgentSchema):
        agent_model = Agent(**agent.model_dump())
        return AgentDataManager(self.session).create_agent(agent_model)

    def update_agent(self, agent_id: int, agent: UpdateAgentSchema):
        return AgentDataManager(self.session).update_agent(agent_id, agent)
    
    def delete_agent(self, agent_id: int):
        return AgentDataManager(self.session).delete_agent(agent_id)


class AgentDataManager(BaseDataManager):

    def _prepare_payload(self, model):
        return AgentSchema.model_validate({**model.__dict__, **model.submodel_ids})
    
    # New method for mastertable
    def get_agent_mastertable(self) -> List[AgentSchema]:
        model_list = self.session.scalars(select(Agent)).all()
        return [self._prepare_payload(model) for model in model_list]

    def get_agent(self, agent_id: int) -> AgentSchema:
        model = self.session.scalar(select(Agent).where(Agent.id == agent_id))
        if not model:
            raise HTTPException(404, f"{agent_id=} not found")
        return self._prepare_payload(model)

    def create_agent(self, agent: Agent) -> AgentSchema:
        self.session.add(agent)
        self.session.flush()
        self.session.refresh(agent)
        return self._prepare_payload(agent)

    def update_agent(self, agent_id: int, agent: UpdateAgentSchema) -> AgentSchema:
        model = self.session.scalar(select(Agent).where(Agent.id == agent_id))
        if not model:
            raise HTTPException(404, f"{agent_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = agent.model_dump(exclude_unset=True)

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return self._prepare_payload(model)
    
    def delete_agent(self, agent_id: int) -> AgentSchema:
        model = self.session.scalar(select(Agent).where(Agent.id == agent_id))
        if not model:
            raise HTTPException(404, f"{agent_id=} not found")
        self.session.delete(model)
        return self._prepare_payload(model)
