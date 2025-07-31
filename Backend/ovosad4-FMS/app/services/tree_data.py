from sqlalchemy import select
from fastapi import HTTPException

from app.models.orchard import TreeData
from app.schemas import CreateTreeDataSchema, UpdateTreeDataSchema, TreeDataSchema
from .base_service import BaseService, BaseDataManager

"""
get_tree_data, create_tree_data, update_tree_data, delete_tree_data
- their authorization is handled by the verify_orchard_view_access and verify_orchard_admin_access dependencies in the router
"""

class TreeDataService(BaseService):

    def get_tree_data(self, tree_data_id: int):
        return TreeDataDataManager(self.session).get_tree_data(tree_data_id)

    def create_tree_data(self, tree_data: CreateTreeDataSchema):
        tree_data_model = TreeData(**tree_data.model_dump())
        return TreeDataDataManager(self.session).create_tree_data(tree_data_model)
    
    def update_tree_data(self, tree_data_id: int, tree_data: UpdateTreeDataSchema):
        return TreeDataDataManager(self.session).update_tree_data(tree_data_id, tree_data)

    def delete_tree_data(self, tree_data_id: int):
        return TreeDataDataManager(self.session).delete_tree_data(tree_data_id)

class TreeDataDataManager(BaseDataManager):

    def get_tree_data(self, tree_data_id: int) -> TreeDataSchema:
        model = self.session.scalar(select(TreeData).where(TreeData.id == tree_data_id))
        if not model:
            raise HTTPException(404, f"{tree_data_id=} not found")
        return TreeDataSchema.model_validate(model)

    def create_tree_data(self, tree_data: TreeData) -> TreeDataSchema:
        self.session.add(tree_data)
        self.session.flush()
        self.session.refresh(tree_data)
        return TreeDataSchema.model_validate(tree_data)
    
    def update_tree_data(self, tree_data_id: int, tree_data: UpdateTreeDataSchema) -> TreeDataSchema:
        model = self.session.scalar(select(TreeData).where(TreeData.id == tree_data_id))

        if not model:
            raise HTTPException(404, f"{tree_data_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = tree_data.model_dump(exclude_unset=True)

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            # This should not happen, safeguard
            if key == "tree_id":
                continue
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return TreeDataSchema.model_validate(model)

    def delete_tree_data(self, tree_data_id: int) -> TreeDataSchema:
        model = self.session.scalar(select(TreeData).where(TreeData.id == tree_data_id))
        if not model:
            raise HTTPException(404, f"{tree_data_id=} not found")
        self.session.delete(model)
        return TreeDataSchema.model_validate(model)
