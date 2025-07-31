from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import List

from app.schemas import CreateAgentSchema, UpdateAgentSchema, AgentSchema
from app.services import AgentService
from app.backend.session import create_session

from app.security.auth import verify_any_orchard_view_access, verify_any_orchard_admin_access, verify_global_admin_access
from app.schemas.user_permissions import UserOrchardPermissions

router = APIRouter(prefix="/agent", tags=["agent"])

# New endpoint for mastertable
@router.get("/", response_model=List[AgentSchema])
async def get_agent_mastertable(
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to at least one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_view_access)
) -> List[AgentSchema]:
    # The dependency chain handles authorization
    return AgentService(session).get_agent_mastertable()


@router.get("/{agent_id}", response_model=AgentSchema)
async def get_agent(
    agent_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to at least one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_view_access)
) -> AgentSchema:
    # The dependency chain handles authorization
    return AgentService(session).get_agent(agent_id)


@router.post("/", response_model=AgentSchema)
async def create_agent(
    agent: CreateAgentSchema = Body(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to at least one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_admin_access)
) -> AgentSchema:
    # The dependency chain handles authorization
    return AgentService(session).create_agent(agent)


@router.put("/{agent_id}", response_model=AgentSchema)
async def update_agent(
    agent_id: int,
    agent: UpdateAgentSchema = Body(...),
    session: Session = Depends(create_session),
    # Only a GLOBAL ADMIN can update agents
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_admin_access)
) -> AgentSchema:
    # The dependency chain handles authorization
    return AgentService(session).update_agent(agent_id, agent)


@router.delete("/{agent_id}", response_model=AgentSchema)
async def delete_agent(
    agent_id: int,
    session: Session = Depends(create_session),
    # Only a GLOBAL ADMIN can delete agents
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_admin_access)
) -> AgentSchema:
    # The dependency chain handles authorization
    return AgentService(session).delete_agent(agent_id)
