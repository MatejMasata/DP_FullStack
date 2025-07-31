from datetime import datetime, date
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import SQLModelBase

from sqlalchemy import ForeignKey, UniqueConstraint, DateTime, func, Float
from sqlalchemy.orm import relationship


class MetaModel(SQLModelBase):
    __abstract__ = True

    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[datetime]
    active: Mapped[bool] = mapped_column(default=True)
    note: Mapped[str] = mapped_column(nullable=True)

    def update(self, updating_model):
        for key, value in updating_model.__dict__.items():
            if key == '_sa_instance_state':
                continue
            setattr(self, key, value)

    @property
    def submodel_ids(self):
        raise NotImplementedError

class User(MetaModel):
    __tablename__ = 'user'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]


class Agent(MetaModel):
    __tablename__ = 'agent'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]

    sprayings: Mapped[list["Spraying"]] = relationship(back_populates="agent")

    @property
    def submodel_ids(self):
        return {
            "sprayings": [spraying.id for spraying in self.sprayings]
        }

class Orchard(MetaModel):
    __tablename__ = 'orchard'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    trees: Mapped[list["Tree"]] = relationship(back_populates="orchard")

    @property
    def submodel_ids(self):
        return {
            "trees": [tree.id for tree in self.trees]
        }


class Genotype(MetaModel):
    __tablename__ = 'genotype'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    trees: Mapped[list["Tree"]] = relationship(back_populates="genotype")

    @property
    def submodel_ids(self):
        return {
            "trees": [tree.id for tree in self.trees]
        }

class Rootstock(MetaModel):
    __tablename__ = 'rootstock'

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]

    trees: Mapped[list["Tree"]] = relationship(back_populates="rootstock")

    @property
    def submodel_ids(self):
        return {
            "trees": [tree.id for tree in self.trees]
        }


class Tree(MetaModel):
    __tablename__ = 'tree'

    id: Mapped[int] = mapped_column(primary_key=True)
    orchard_id: Mapped[int] = mapped_column(ForeignKey('orchard.id'))
    genotype_id: Mapped[int] = mapped_column(ForeignKey('genotype.id'))
    rootstock_id: Mapped[int] = mapped_column(ForeignKey('rootstock.id'))
    row: Mapped[int]
    field: Mapped[int]
    number: Mapped[int]
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)

    spacing: Mapped[float]
    growth_type: Mapped[str]
    training_shape: Mapped[str]
    planting_date: Mapped[str]
    initial_age: Mapped[str]
    nursery_tree_type: Mapped[str]

    tree_images: Mapped[list["TreeImage"]] = relationship(back_populates="tree")
    tree_data: Mapped[list["TreeData"]] = relationship(back_populates="tree")
    harvests: Mapped[list["Harvest"]] = relationship(back_populates="tree")
    flower_thinnings: Mapped[list["FlowerThinning"]] = relationship(back_populates="tree")
    fruit_thinnings: Mapped[list["FruitThinning"]] = relationship(back_populates="tree")
    sprayings: Mapped[list["Spraying"]] = relationship(back_populates="tree")

    orchard: Mapped["Orchard"] = relationship(back_populates="trees")
    genotype: Mapped["Genotype"] = relationship(back_populates="trees")
    rootstock: Mapped["Rootstock"] = relationship(back_populates="trees")

    @property
    def submodel_ids(self):
        return {
            "tree_images": [tree_image.id for tree_image in self.tree_images],
            "tree_data": [tree_data.id for tree_data in self.tree_data],
            "harvests": [harvest.id for harvest in self.harvests],
            "flower_thinnings": [flower_thinning.id for flower_thinning in self.flower_thinnings],
            "fruit_thinnings": [fruit_thinning.id for fruit_thinning in self.fruit_thinnings],
            "sprayings": [spraying.id for spraying in self.sprayings]
        }


class FileBatch(MetaModel):
    __tablename__ = 'file_batch'

    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[str]
    note: Mapped[str] = mapped_column(nullable=True)

    files: Mapped[list["File"]] = relationship(back_populates="file_batch")

    @property
    def submodel_ids(self):
        return {
            "files": [file.id for file in self.files],
        }


class File(MetaModel):
    __tablename__ = 'file'

    id: Mapped[int] = mapped_column(primary_key=True)
    file_batch_id: Mapped[int] = mapped_column(ForeignKey('file_batch.id'))
    name: Mapped[str]
    datetime: Mapped[datetime]
    mime: Mapped[str]
    uid: Mapped[str] = mapped_column(default="")

    file_batch: Mapped["FileBatch"] = relationship(back_populates="files")

    tree_images: Mapped[list["TreeImage"]] = relationship(back_populates="file")

    @property
    def submodel_ids(self):
        return {
            "tree_images": [tree_image.id for tree_image in self.tree_images],
        }


class TreeImage(MetaModel):
    __tablename__ = 'tree_image'
    __table_args__ = (UniqueConstraint('tree_id', 'file_id', name='uq_tree_file'),)

    id: Mapped[int] = mapped_column(primary_key=True)
    tree_id: Mapped[int] = mapped_column(ForeignKey('tree.id'))
    file_id: Mapped[int] = mapped_column(ForeignKey('file.id'))
    note: Mapped[str] = mapped_column(nullable=True)

    tree: Mapped["Tree"] = relationship(back_populates="tree_images")
    file: Mapped["File"] = relationship(back_populates="tree_images")


class Harvest(MetaModel):
    __tablename__ = 'harvest'

    id: Mapped[int] = mapped_column(primary_key=True)
    tree_id: Mapped[int] = mapped_column(ForeignKey('tree.id'))
    datetime: Mapped[datetime]
    elapsed_time: Mapped[int]
    fruit_under_60mm_quantity: Mapped[int]
    fruit_under_60mm_weight: Mapped[int]
    fruit_under_70mm_quantity: Mapped[int]
    fruit_under_70mm_weight: Mapped[int]
    fruit_over_70mm_quantity: Mapped[int]
    fruit_over_70mm_weight: Mapped[int]
    average_fruit_weight: Mapped[float]
    aphids_damage_quantity: Mapped[int]
    aphids_damage_weight: Mapped[int]
    damaged_percentage: Mapped[int]

    tree: Mapped["Tree"] = relationship(back_populates="harvests")


class TreeData(MetaModel):
    __tablename__ = 'tree_data'

    id: Mapped[int] = mapped_column(primary_key=True)
    tree_id: Mapped[int] = mapped_column(ForeignKey('tree.id'))
    datetime: Mapped[datetime]
    one_year_height: Mapped[int]
    fruiting_wood_height: Mapped[int]
    total_height: Mapped[int]
    trunk_girth: Mapped[int]
    suckering: Mapped[int]
    summer_pruning_date: Mapped[date]
    winter_pruning_date: Mapped[date]
    summer_pruning_note: Mapped[str]
    winter_pruning_note: Mapped[str]

    tree: Mapped["Tree"] = relationship(back_populates="tree_data")


class Spraying(MetaModel):
    __tablename__ = 'spraying'

    id: Mapped[int] = mapped_column(primary_key=True)
    tree_id: Mapped[int] = mapped_column(ForeignKey('tree.id'))
    agent_id: Mapped[int] = mapped_column(ForeignKey('agent.id'))
    datetime: Mapped[datetime]
    volume: Mapped[float]
    note: Mapped[str]

    flower_thinnings: Mapped[list["FlowerThinning"]] = relationship(back_populates="spraying")
    fruit_thinnings: Mapped[list["FruitThinning"]] = relationship(back_populates="spraying")

    tree: Mapped["Tree"] = relationship(back_populates="sprayings")
    agent: Mapped["Agent"] = relationship(back_populates="sprayings")

    @property
    def submodel_ids(self):
        return {
            "flower_thinnings": [flower_thinning.id for flower_thinning in self.flower_thinnings],
            "fruit_thinnings": [fruit_thinning.id for fruit_thinning in self.fruit_thinnings]
        }

class FruitThinning(MetaModel):
    __tablename__ = 'fruit_thinning'

    id: Mapped[int] = mapped_column(primary_key=True)
    tree_id: Mapped[int] = mapped_column(ForeignKey('tree.id'))
    spraying_id: Mapped[int] = mapped_column(ForeignKey('spraying.id'))
    datetime: Mapped[datetime]
    mechanical: Mapped[bool]
    cropload_for_4: Mapped[int]
    cropload_for_3: Mapped[int]
    cropload_for_1: Mapped[int]
    fruit_for_thinning: Mapped[int]
    fruit_thinning_time: Mapped[int]

    tree: Mapped["Tree"] = relationship(back_populates="fruit_thinnings")
    spraying: Mapped["Spraying"] = relationship(back_populates="fruit_thinnings")


class FlowerThinning(MetaModel):
    __tablename__ = 'flower_thinning'

    id: Mapped[int] = mapped_column(primary_key=True)
    tree_id: Mapped[int] = mapped_column(ForeignKey('tree.id'))
    spraying_id: Mapped[int] = mapped_column(ForeignKey('spraying.id'))
    datetime: Mapped[datetime]
    mechanical: Mapped[bool]
    flower_clusters_before_thinning: Mapped[int]
    flower_clusters_for_thinning: Mapped[int]
    flower_clusters_after_thinning: Mapped[int]
    flower_clusters_before_thinning_one_year: Mapped[int]
    flower_clusters_for_thinning_one_year: Mapped[int]
    flower_clusters_after_thinning_one_year: Mapped[int]

    tree: Mapped["Tree"] = relationship(back_populates="flower_thinnings")
    spraying: Mapped["Spraying"] = relationship(back_populates="flower_thinnings")
