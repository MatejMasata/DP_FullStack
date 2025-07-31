"""initialize_db

Revision ID: a45137925ac9
Revises:
Create Date: 2023-10-29 17:29:03.141766

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a45137925ac9'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


class MetaIterable(type):
    def __iter__(cls):
        return iter(val for key, val in cls.__dict__.items().__reversed__() if not key.startswith('__'))


class TableNames(metaclass=MetaIterable):
    user = "user"
    genotype = "genotype"
    rootstock = "rootstock"
    agent = "agent"
    orchard = "orchard"
    permission = "permission"
    tree = "tree"
    file_batch = "file_batch"
    file = "file"
    tree_image = "tree_image"
    harvest = "harvest"
    tree_data = "tree_data"
    spraying = "spraying"
    fruit_thinning = "fruit_thinning"
    flower_thinning = "flower_thinning"


base_cols = (
    sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    sa.Column("deleted_at", sa.DateTime),
    sa.Column("active", sa.Boolean, nullable=False),
    sa.Column("note", sa.String, nullable=True),
)


def create_table(table_name: str, *args: sa.Column):
    op.create_table(
        table_name,
        sa.Column("id", sa.Integer, primary_key=True, index=True),
        *args,
        *base_cols,
    )

def upgrade() -> None:

    create_table(
        TableNames.user,
        sa.Column("name", sa.String, nullable=False),
    )

    create_table(
        TableNames.orchard,
        sa.Column("name", sa.String, nullable=False),
    )

    create_table(
        TableNames.permission,
        sa.Column("user_id", sa.Integer, sa.ForeignKey(f"{TableNames.user}.id"), nullable=False),
        sa.Column("orchard_id", sa.Integer, sa.ForeignKey(f"{TableNames.orchard}.id"), nullable=False),
    )

    create_table(
        TableNames.agent,
        sa.Column("name", sa.String, nullable=False),
        sa.Column("description", sa.String, nullable=False),
    )

    create_table(
        TableNames.genotype,
        sa.Column("name", sa.String, nullable=False),
    )

    create_table(
        TableNames.rootstock,
        sa.Column("name", sa.String, nullable=False),
    )

    create_table(
        TableNames.tree,
        sa.Column("orchard_id", sa.Integer, sa.ForeignKey(f"{TableNames.orchard}.id"), nullable=False),
        sa.Column("genotype_id", sa.Integer, sa.ForeignKey(f"{TableNames.genotype}.id"), nullable=False),
        sa.Column("rootstock_id", sa.Integer, sa.ForeignKey(f"{TableNames.rootstock}.id"), nullable=False),
        sa.Column("row", sa.Integer, nullable=False),
        sa.Column("field", sa.Integer, nullable=False),
        sa.Column("number", sa.Integer, nullable=False),
        sa.Column('latitude', sa.Float, nullable=False),
        sa.Column('longitude', sa.Float, nullable=False),

        sa.Column("spacing", sa.Float, nullable=False),
        sa.Column("growth_type", sa.String, nullable=False),
        sa.Column("training_shape", sa.String, nullable=False),
        sa.Column("planting_date", sa.String, nullable=False),
        sa.Column("initial_age", sa.String, nullable=False),
        sa.Column("nursery_tree_type", sa.String, nullable=False),
    )

    create_table(
        TableNames.file_batch,
        sa.Column("label", sa.String, nullable=False),
    )

    create_table(
        TableNames.file,
        sa.Column("file_batch_id", sa.Integer, sa.ForeignKey(f"{TableNames.file_batch}.id"), nullable=False),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("datetime", sa.DateTime, nullable=False),
        sa.Column("mime", sa.String, nullable=False),
        sa.Column("uid", sa.String, nullable=False),
    )

    create_table(
        TableNames.tree_image,
        sa.Column("tree_id", sa.Integer, sa.ForeignKey(f"{TableNames.tree}.id"), nullable=False),
        sa.Column("file_id", sa.Integer, sa.ForeignKey(f"{TableNames.file}.id"), nullable=False),
    )

    op.create_unique_constraint('uq_tree_file', 'tree_image', ['tree_id', 'file_id'])

    create_table(
        TableNames.harvest,
        sa.Column("tree_id", sa.Integer, sa.ForeignKey(f"{TableNames.tree}.id"), nullable=False),
        sa.Column("datetime", sa.DateTime, nullable=False),
        sa.Column("elapsed_time", sa.Integer, nullable=False),
        sa.Column("fruit_under_60mm_quantity", sa.Integer, nullable=False),
        sa.Column("fruit_under_60mm_weight", sa.Integer, nullable=False),
        sa.Column("fruit_under_70mm_quantity", sa.Integer, nullable=False),
        sa.Column("fruit_under_70mm_weight", sa.Integer, nullable=False),
        sa.Column("fruit_over_70mm_quantity", sa.Integer, nullable=False),
        sa.Column("fruit_over_70mm_weight", sa.Integer, nullable=False),
        sa.Column("average_fruit_weight", sa.Float, nullable=False),
        sa.Column("aphids_damage_quantity", sa.Integer, nullable=False),
        sa.Column("aphids_damage_weight", sa.Integer, nullable=False),
        sa.Column("damaged_percentage", sa.Integer, nullable=False),
    )

    create_table(
        TableNames.tree_data,
        sa.Column("tree_id", sa.Integer, sa.ForeignKey(f"{TableNames.tree}.id"), nullable=False),
        sa.Column("datetime", sa.DateTime, nullable=False),
        sa.Column("one_year_height", sa.Integer, nullable=False),
        sa.Column("fruiting_wood_height", sa.Integer, nullable=False),
        sa.Column("total_height", sa.Integer, nullable=False),
        sa.Column("trunk_girth", sa.Integer, nullable=False),
        sa.Column("suckering", sa.Integer, nullable=False),
        sa.Column("summer_pruning_date", sa.Date, nullable=False),
        sa.Column("winter_pruning_date", sa.Date, nullable=False),
        sa.Column("summer_pruning_note", sa.String, nullable=False),
        sa.Column("winter_pruning_note", sa.String, nullable=False),
    )

    create_table(
        TableNames.spraying,
        sa.Column("tree_id", sa.Integer, sa.ForeignKey(f"{TableNames.tree}.id"), nullable=False),
        sa.Column("agent_id", sa.Integer, sa.ForeignKey(f"{TableNames.agent}.id"), nullable=False),
        sa.Column("datetime", sa.DateTime, nullable=False),
        sa.Column("volume", sa.Float, nullable=False),
    )

    create_table(
        TableNames.fruit_thinning,
        sa.Column("tree_id", sa.Integer, sa.ForeignKey(f"{TableNames.tree}.id"), nullable=False),
        sa.Column("spraying_id", sa.Integer, sa.ForeignKey(f"{TableNames.spraying}.id"), nullable=False),
        sa.Column("datetime", sa.DateTime, nullable=False),
        sa.Column("mechanical", sa.Boolean, nullable=False),
        sa.Column("cropload_for_4", sa.Integer, nullable=False),
        sa.Column("cropload_for_3", sa.Integer, nullable=False),
        sa.Column("cropload_for_1", sa.Integer, nullable=False),
        sa.Column("fruit_for_thinning", sa.Integer, nullable=False),
        sa.Column("fruit_thinning_time", sa.Integer, nullable=False),
    )

    create_table(
        TableNames.flower_thinning,
        sa.Column("tree_id", sa.Integer, sa.ForeignKey(f"{TableNames.tree}.id"), nullable=False),
        sa.Column("spraying_id", sa.Integer, sa.ForeignKey(f"{TableNames.spraying}.id"), nullable=False),
        sa.Column("datetime", sa.DateTime, nullable=False),
        sa.Column("mechanical", sa.Boolean, nullable=False),
        sa.Column("flower_clusters_before_thinning", sa.Integer, nullable=False),
        sa.Column("flower_clusters_for_thinning", sa.Integer, nullable=False),
        sa.Column("flower_clusters_after_thinning", sa.Integer, nullable=False),
        sa.Column("flower_clusters_before_thinning_one_year", sa.Integer, nullable=False),
        sa.Column("flower_clusters_for_thinning_one_year", sa.Integer, nullable=False),
        sa.Column("flower_clusters_after_thinning_one_year", sa.Integer, nullable=False),
    )

    op.execute(sa.DDL(
        """
        insert into genotype (id, name, created_at, updated_at, deleted_at, active)
        values (default, 'default', '2000-01-01 00:00:00.000000', default, default, true);
        
        insert into rootstock (id, name, created_at, updated_at, deleted_at, active)
        values (default, 'default', '2000-01-01 00:00:00.000000', default, default, true);
        
        insert into file_batch (id, label, note, created_at, updated_at, deleted_at, active)
        values (default, 'default', 'default', '2000-01-01 00:00:00.000000', default, default, true);
        """
    ))


def downgrade() -> None:
    for table_name in TableNames:
        op.drop_table(table_name)
