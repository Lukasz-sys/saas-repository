"""add input data to jobs

Revision ID: 98f5851f303e
Revises: 76b6bc63c55a
Create Date: 2026-06-12
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "98f5851f303e"
down_revision: Union[str, Sequence[str], None] = "76b6bc63c55a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "jobs",
        sa.Column("input_data", sa.Text(), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("jobs", "input_data")