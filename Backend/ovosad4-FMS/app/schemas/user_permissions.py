from pydantic import BaseModel, Field
from typing import Optional, Set


# Schema for authenticated user permissions, parsed from Keycloak roles

class UserOrchardPermissions(BaseModel):
    
    # Set[int] for  uniqueness and efficient lookups
    # default_factory=set ensures each new instance gets its own empty set
    allowed_view_orchard_ids: Set[int] = Field(default_factory=set)
    allowed_admin_orchard_ids: Set[int] = Field(default_factory=set)
    is_global_admin: bool = False
    username: Optional[str] = None