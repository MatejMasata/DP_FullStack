import sqlalchemy.exc
from sqlalchemy import select
from fastapi import HTTPException

from app.schemas import CreateTreeImageSchema, UpdateTreeImageSchema
from app.models.orchard import TreeImage, Tree
from app.schemas import TreeImageSchema, UserOrchardPermissions
from .base_service import BaseService, BaseDataManager

"""
get_tree_image, create_tree_image, update_tree_image, delete_tree_image
- their authorization is handled by the dependencies in the router

get_tree_image_mastertable
- filters the trees based on the UserOrchardPermissions object passed from the router
"""
class TreeImageService(BaseService):

    def get_tree_image_mastertable(self, permissions: UserOrchardPermissions):
        return TreeImageDataManager(self.session).get_tree_image_mastertable(permissions)

    def get_tree_image(self, tree_image_id: int):
        return TreeImageDataManager(self.session).get_tree_image(tree_image_id)

    def create_tree_image(self, tree_image: CreateTreeImageSchema):

        tree_image_model = TreeImage(
            tree_id=tree_image.tree_id,
            file_id=tree_image.file_id,
            note=tree_image.note,
        )

        return TreeImageDataManager(self.session).create_tree_image(tree_image_model)
    
    def update_tree_image(self, tree_image_id: int, tree_image: UpdateTreeImageSchema) -> TreeImageSchema:
        return TreeImageDataManager(self.session).update_tree_image(tree_image_id, tree_image)

    def delete_tree_image(self, tree_image_id: int):
        return TreeImageDataManager(self.session).delete_tree_image(tree_image_id)


class TreeImageDataManager(BaseDataManager):
    
    # Filters based on user permissions
    def get_tree_image_mastertable(self, permissions: UserOrchardPermissions) -> list[TreeImageSchema]:
        query = select(TreeImage)

        # If not a global admin, only retrieve trees from orchards the user has view access to
        if not permissions.is_global_admin:

            # If user has no specific orchard view permissions, return an empty list
            if not permissions.allowed_view_orchard_ids:
                return []
            
            query = query.join(Tree).where(Tree.orchard_id.in_(permissions.allowed_view_orchard_ids))

        model_list = self.session.scalars(query).all()

        return [
            TreeImageSchema(
                id=model.id,
                tree_id=model.tree_id,
                file_id=model.file_id,
                note=model.note,
            )
            for model in model_list
        ]

    def get_tree_image(self, tree_image_id: int) -> TreeImageSchema:
        model = self.session.scalar(select(TreeImage).where(TreeImage.id == tree_image_id))

        if not model:
            raise HTTPException(404, f"{tree_image_id=} not found")

        return TreeImageSchema(
            id=model.id,
            tree_id=model.tree_id,
            file_id=model.file_id,
            note=model.note,
        )

    def create_tree_image(self, tree_image: TreeImage) -> TreeImageSchema:

        try:
            self.session.add(tree_image)
            self.session.flush()
        except sqlalchemy.exc.IntegrityError as e:
            raise HTTPException(409, f"Database integrity error tree_image with tree_id={tree_image.tree_id} and file_id={tree_image.file_id}: {e.orig}")
        return TreeImageSchema(
            id=tree_image.id,
            tree_id=tree_image.tree_id,
            file_id=tree_image.file_id,
            note=tree_image.note,
        )
    
    def update_tree_image(self, tree_image_id: int, tree_image: UpdateTreeImageSchema) -> TreeImageSchema:
        model = self.session.scalar(select(TreeImage).where(TreeImage.id == tree_image_id))

        if not model:
            raise HTTPException(404, f"{tree_image_id=} not found")

        # Get only the fields that were provided in the request body
        update_data = tree_image.model_dump(exclude_unset=True)

        # Iterate over the provided fields and update the model
        for key, value in update_data.items():
            # This should not happen, safeguard
            if key == "tree_id":
                continue
            setattr(model, key, value)

        self.session.add(model)
        self.session.flush()
        self.session.refresh(model)

        return TreeImageSchema.model_validate(model)

    def delete_tree_image(self, tree_image_id: int) -> TreeImageSchema:
        model = self.session.scalar(select(TreeImage).where(TreeImage.id == tree_image_id))

        if not model:
            raise HTTPException(404, f"{tree_image_id=} not found")

        self.session.delete(model)

        return TreeImageSchema(
            id=model.id,
            tree_id=model.tree_id,
            file_id=model.file_id,
            note=model.note,
        )
