from sqlalchemy import select
from fastapi import HTTPException
from typing import List 

from app.models.orchard import Spraying, Tree
from app.schemas import CreateSprayingSchema, UpdateSprayingSchema, SprayingSchema
from .base_service import BaseService, BaseDataManager

from app.schemas.user_permissions import UserOrchardPermissions

"""
get_spraying, create_spraying, update_spraying, delete_spraying
- their authorization is handled by the verify_orchard_view_access and verify_orchard_admin_access dependencies in the router

get_spraying_mastertable
- filters the trees based on the UserOrchardPermissions object passed from the router
"""

class SprayingService(BaseService):

    def get_spraying_mastertable(self, permissions: UserOrchardPermissions) -> List[SprayingSchema]:
        return SprayingDataManager(self.session).get_spraying_mastertable(permissions)

    def get_spraying(self, spraying_id: int):
        return SprayingDataManager(self.session).get_spraying(spraying_id)

    def create_spraying(self, spraying: CreateSprayingSchema):
        spraying_model = Spraying(**spraying.model_dump())
        return SprayingDataManager(self.session).create_spraying(spraying_model)
    
    def update_spraying(self, spraying_id: int, spraying: UpdateSprayingSchema):
        return SprayingDataManager(self.session).update_spraying(spraying_id, spraying)

    def delete_spraying(self, spraying_id: int):
        return SprayingDataManager(self.session).delete_spraying(spraying_id)


class SprayingDataManager(BaseDataManager):

    @staticmethod
    def _prepare_payload(model):
        return SprayingSchema.model_validate({**model.__dict__, **model.submodel_ids})
    
    # New method for mastertable
    # Filters based on user permissions
    def get_spraying_mastertable(self, permissions: UserOrchardPermissions) -> List[SprayingSchema]:
        query = select(Spraying).join(Tree, Spraying.tree_id == Tree.id) # Join with Tree

        # If not a global admin, only retrieve trees from orchards the user has view access to
        if not permissions.is_global_admin:

            # If user has no specific orchard view permissions, return an empty list
            if not permissions.allowed_view_orchard_ids:
                return [] 
            
            query = query.where(Tree.orchard_id.in_(permissions.allowed_view_orchard_ids))
        
        model_list = self.session.scalars(query).all()
        
        return [self._prepare_payload(model) for model in model_list]

    def get_spraying(self, spraying_id: int) -> SprayingSchema:
        model = self.session.scalar(select(Spraying).where(Spraying.id == spraying_id))
        if not model:
            raise HTTPException(404, f"{spraying_id=} not found")
        return self._prepare_payload(model)

    def create_spraying(self, spraying: Spraying) -> SprayingSchema:
        self.session.add(spraying)
        self.session.flush()
        self.session.refresh(spraying)
        return self._prepare_payload(spraying)
    
    def update_spraying(self, spraying_id: int, spraying: UpdateSprayingSchema) -> SprayingSchema:
        model = self.session.scalar(select(Spraying).where(Spraying.id == spraying_id))

        if not model:
            raise HTTPException(404, f"{spraying_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = spraying.model_dump(exclude_unset=True) # Use original 'spraying' variable name

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            # This should not happen, safeguard
            if key == "tree_id":
                continue
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return self._prepare_payload(model)

    def delete_spraying(self, spraying_id: int) -> SprayingSchema:
        model = self.session.scalar(select(Spraying).where(Spraying.id == spraying_id))
        if not model:
            raise HTTPException(404, f"{spraying_id=} not found")
        self.session.delete(model)
        return self._prepare_payload(model)
