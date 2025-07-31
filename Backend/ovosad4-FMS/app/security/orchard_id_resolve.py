from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.backend.session import create_session
from app.models.orchard import Tree, TreeData, TreeImage, Spraying, Harvest, FlowerThinning, FruitThinning

# GET TO WHICH ORCHARD(ID) A TREE(ID) BELONGS TO   
async def get_orchard_id_from_tree_id(
    tree_id: int,
    session: Session = Depends(create_session)
) -> int:
    
    # Select just the orchard_id column
    orchard_id = session.scalar(select(Tree.orchard_id).where(Tree.id == tree_id))
    
    # 404 if the tree is not found
    if orchard_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tree with ID {tree_id} not found."
        )
    return orchard_id


# GETS TO WHICH ORCHARD(ID) A TREE_DATA(ID) BELONGS TO
async def get_orchard_id_from_tree_data_id(
    tree_data_id: int, session: Session = Depends(create_session)
) -> int:
    
    # Select just the tree_id column from the TreeData table
    tree_id = session.scalar(select(TreeData.tree_id).where(TreeData.id == tree_data_id))

    # 404 if the tree_data entry is not found
    if tree_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TreeData with ID {tree_data_id} not found."
        )

    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


# GETS TO WHICH ORCHARD(ID) A TREE_IMAGE(ID) BELONGS TO
async def get_orchard_id_from_tree_image_id(
    tree_image_id: int,
    session: Session = Depends(create_session)
) -> int:
    
    # Select just the tree_id column from the TreeImage table
    tree_id = session.scalar(select(TreeImage.tree_id).where(TreeImage.id == tree_image_id))

    # 404 if the tree_image entry is not found
    if tree_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tree image with ID {tree_image_id} not found."
        )

    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


# GETS TO WHICH ORCHARD(ID) A SPRAYING(ID) BELONGS TO
async def get_orchard_id_from_spraying_id(
    spraying_id: int,
    session: Session = Depends(create_session)
) -> int:
 
    # Select just the tree_id column from the Spraying table
    tree_id = session.scalar(select(Spraying.tree_id).where(Spraying.id == spraying_id))

    # 404 if the spraying entry is not found
    if tree_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Spraying with ID {spraying_id} not found."
        )
    
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


# GETS TO WHICH ORCHARD(ID) A HARVEST(ID) BELONGS TO
async def get_orchard_id_from_harvest_id(
    harvest_id: int,
    session: Session = Depends(create_session)
) -> int:

    # Select just the tree_id column from the Harvets table
    tree_id = session.scalar(select(Harvest.tree_id).where(Harvest.id == harvest_id))

    # 404 if the harvest entry is not found
    if tree_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Harvest with ID {harvest_id} not found."
        )
    
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


# GETS TO WHICH ORCHARD(ID) A FLOWER_THINNING(ID) BELONGS TO
async def get_orchard_id_from_flower_thinning_id(
    flower_thinning_id: int,
    session: Session = Depends(create_session)
) -> int:
    
    # Select just the tree_id column from the flower thinning table
    tree_id = session.scalar(select(FlowerThinning.tree_id).where(FlowerThinning.id == flower_thinning_id))

    # 404 if the flower thinning entry is not found
    if tree_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Flower Thinning with ID {flower_thinning_id} not found."
        )
    
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)


# GETS TO WHICH ORCHARD(ID) A FRUIT_THINNING(ID) BELONGS TO
async def get_orchard_id_from_fruit_thinning_id(
    fruit_thinning_id: int,
    session: Session = Depends(create_session)
) -> int:
    
    # Select just the tree_id column from the fruit thinning table
    tree_id = session.scalar(select(FruitThinning.tree_id).where(FruitThinning.id == fruit_thinning_id))

    # 404 if the fruit thinning entry is not found
    if tree_id is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Fruit Thinning with ID {fruit_thinning_id} not found."
        )
    
    return await get_orchard_id_from_tree_id(tree_id=tree_id, session=session)
