from sqlalchemy import select
from fastapi import HTTPException, status

from app.schemas import CreateOrchardSchema, UpdateOrchardSchema
from app.models.orchard import Orchard
from app.schemas import OrchardSchema
from .base_service import BaseService, BaseDataManager

from app.schemas.user_permissions import UserOrchardPermissions
from app.security.keycloak_admin_client import keycloak_admin_client

"""
get_orchard, create_orchard, update_orchard, delete_orchard
- their authorization is handled by the verify_orchard_view_access and verify_orchard_admin_access dependencies in the router

get_orchard_mastertable
- filters the orchards based on the UserOrchardPermissions object passed from the router
"""

"""
create_orchard - also creates the neccessary roles
Orchard-{orchard_id}-View and Orchard-{orchard_id}-Admin

delete_orchard{orchard_id} - also deletes the roles associated with the orchard
Orchard-{orchard_id}-View and Orchard-{orchard_id}-Admin
"""
class OrchardService(BaseService):

    def get_orchard_mastertable(self, permissions: UserOrchardPermissions) -> list[OrchardSchema]:
        return OrchardDataManager(self.session).get_orchard_mastertable(permissions)

    def get_orchard(self, orchard_id: int):
        return OrchardDataManager(self.session).get_orchard(orchard_id)
    
    async def create_orchard(self, orchard: CreateOrchardSchema):
        # Create the orchard in the database first
        orchard_model = Orchard(**orchard.model_dump())
        # Flush and refresh the model so its ID is available immediately
        created_orchard_db = OrchardDataManager(self.session).create_orchard(orchard_model)
        
        # Get the ID of the newly created orchard
        orchard_id = created_orchard_db.id

        # Create the corresponding roles in Keycloak
        # These operations are asynchronous - we need to await them
        try:
            admin_role_name = f"Orchard-{orchard_id}-Admin"
            viewer_role_name = f"Orchard-{orchard_id}-View"

            await keycloak_admin_client.create_realm_role(admin_role_name)
            await keycloak_admin_client.create_realm_role(viewer_role_name)
            
            print(f"Successfully created Keycloak roles for Orchard ID {orchard_id}: {admin_role_name}, {viewer_role_name}")

        except Exception as e:
            # Handle Keycloak API errors
            # Might want to implement rollback strategy (delete the created orchard from DB)
            self.session.rollback() # Rollback DB transaction if Keycloak fails
            print(f"Failed to create Keycloak roles for Orchard ID {orchard_id}: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Orchard created but failed to create Keycloak roles: {e}"
            )

        # Return the created orchard data
        return created_orchard_db

    def update_orchard(self, orchard_id: int, orchard: UpdateOrchardSchema):
        orchard_model = Orchard(**orchard.model_dump())
        return OrchardDataManager(self.session).update_orchard(orchard_id, orchard_model)
    
    async def delete_orchard(self, orchard_id: int) -> OrchardSchema:
        # Delete the orchard from the database
        deleted_orchard_db = OrchardDataManager(self.session).delete_orchard(orchard_id)

        # Try to delete the corresponding roles in Keycloak
        # These operations are asynchronous - we need to await them
        try:
            admin_role_name = f"Orchard-{orchard_id}-Admin"
            viewer_role_name = f"Orchard-{orchard_id}-View"

            await keycloak_admin_client.delete_realm_role(admin_role_name)
            await keycloak_admin_client.delete_realm_role(viewer_role_name)
            
            print(f"Successfully deleted Keycloak roles for Orchard ID {orchard_id}: {admin_role_name}, {viewer_role_name}")

        except Exception as e:
            # Handle Keycloak API errors
            # Might want to implement rollback strategy (Orchard deleted from DB, but Keycloak role deletion fails)
            print(f"Warning: Failed to delete Keycloak roles for Orchard ID {orchard_id}: {e}")
            # If you want the API call to fail with a 500 if Keycloak deletion fails:
            # raise HTTPException(
            #     status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            #     detail=f"Orchard deleted from DB but failed to delete Keycloak roles: {e}"
            # )

        return deleted_orchard_db


class OrchardDataManager(BaseDataManager):

    @staticmethod
    def _prepare_payload(model):
        return OrchardSchema.model_validate({**model.__dict__, **model.submodel_ids})
    
    # Filters based on user permissions
    def get_orchard_mastertable(self, permissions: UserOrchardPermissions) -> list[OrchardSchema]:
        query = select(Orchard)

        # If not a global admin, only retrieve orchards the user has view access to
        if not permissions.is_global_admin:

            # If user has no specific orchard view permissions, return an empty list
            if not permissions.allowed_view_orchard_ids:
                return []
            
            query = query.where(Orchard.id.in_(list(permissions.allowed_view_orchard_ids))) # .in_() converts set to list 

        model_list = self.session.scalars(query).all()
        return [self._prepare_payload(model) for model in model_list]

    def get_orchard(self, orchard_id: int) -> OrchardSchema:
        model = self.session.scalar(select(Orchard).where(Orchard.id == orchard_id))

        if not model:
            raise HTTPException(404, f"{orchard_id=} not found")

        return self._prepare_payload(model)

    def create_orchard(self, orchard: Orchard) -> OrchardSchema:

        self.session.add(orchard)
        self.session.flush()

        # Refresh the 'orchard' object
        # - loads the newly generated ID from the database back into the 'orchard' object 
        self.session.refresh(orchard) 

        return self._prepare_payload(orchard)

    def update_orchard(self, orchard_id: int, orchard: Orchard) -> OrchardSchema:
        model = self.session.scalar(select(Orchard).where(Orchard.id == orchard_id))

        if not model:
            raise HTTPException(404, f"{orchard_id=} not found")
        model.update(orchard)
        return self._prepare_payload(model)

    def delete_orchard(self, orchard_id: int) -> OrchardSchema:
        model = self.session.scalar(select(Orchard).where(Orchard.id == orchard_id))

        if not model:
            raise HTTPException(404, f"{orchard_id=} not found")

        self.session.delete(model)

        return self._prepare_payload(model)
