from sqlalchemy import select
from fastapi import HTTPException

from app.models.orchard import Tree
from app.schemas import TreeSchema, CreateTreeSchema, UpdateTreeSchema
from .base_service import BaseService, BaseDataManager

from app.schemas.user_permissions import UserOrchardPermissions

"""
get_tree, create_tree, update_tree, delete_tree
- their authorization is handled by the verify_orchard_view_access and verify_orchard_admin_access dependencies in the router

get_tree_mastertable
- filters the trees based on the UserOrchardPermissions object passed from the router
"""
class TreeService(BaseService):
    
    def get_tree_mastertable(self, permissions: UserOrchardPermissions) -> list[TreeSchema]:
        return TreeDataManager(self.session).get_tree_mastertable(permissions)

    def get_tree(self, tree_id: int):
        return TreeDataManager(self.session).get_tree(tree_id)

    def create_tree(self, tree: CreateTreeSchema):
        tree_model = Tree(**tree.model_dump())
        return TreeDataManager(self.session).create_tree(tree_model)

    def update_tree(self, tree_id: int, tree: UpdateTreeSchema):
        return TreeDataManager(self.session).update_tree(tree_id, tree)

    def delete_tree(self, tree_id: int):
        return TreeDataManager(self.session).delete_tree(tree_id)


class TreeDataManager(BaseDataManager):

    @staticmethod
    def _prepare_payload(model):
        return TreeSchema.model_validate({**model.__dict__, **model.submodel_ids})

    # Filters based on user permissions
    def get_tree_mastertable(self, permissions: UserOrchardPermissions) -> list[TreeSchema]:
        query = select(Tree)

        # If not a global admin, only retrieve trees from orchards the user has view access to
        if not permissions.is_global_admin:

            # If user has no specific orchard view permissions, return an empty list
            if not permissions.allowed_view_orchard_ids:
                return []

            query = query.where(Tree.orchard_id.in_(list(permissions.allowed_view_orchard_ids)))

        model_list = self.session.scalars(query).all()
        return [self._prepare_payload(model) for model in model_list]


    def get_tree(self, tree_id: int) -> TreeSchema:
        model = self.session.scalar(select(Tree).where(Tree.id == tree_id))

        if not model:
            raise HTTPException(404, f"{tree_id=} not found")

        return self._prepare_payload(model)

    def create_tree(self, tree: Tree) -> TreeSchema:

        self.session.add(tree)
        self.session.flush()

        return self._prepare_payload(tree)

    def update_tree(self, tree_id: int, tree: UpdateTreeSchema) -> TreeSchema:
        model = self.session.scalar(select(Tree).where(Tree.id == tree_id))

        if not model:
            raise HTTPException(404, f"{tree_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = tree.model_dump(exclude_unset=True)

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            # This should not happen, safeguard
            if key == "orchard_id":
                continue
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return self._prepare_payload(model)

    def delete_tree(self, tree_id: int) -> TreeSchema:
        model = self.session.scalar(select(Tree).where(Tree.id == tree_id))

        if not model:
            raise HTTPException(404, f"{tree_id=} not found")

        self.session.delete(model)

        return self._prepare_payload(model)
