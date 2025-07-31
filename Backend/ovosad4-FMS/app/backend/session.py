import os

from contextlib import contextmanager
from typing import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import (
    Session,
    sessionmaker,
)

# with open(os.getenv("POSTGRES_PASSWORD_FILE"), "r") as file:
#     password = file.read().splitlines()[0]
password = os.getenv("POSTGRES_PASSWORD")

user = os.getenv("POSTGRES_USER")
host = os.getenv("POSTGRES_HOST")
port = os.getenv("POSTGRES_PORT")
database = os.getenv("POSTGRES_DATABASE")

sqlalchemy_uri = f"postgresql+psycopg://{user}:{password}@{host}:{port}/{database}"

# create session factory to generate new database sessions
SessionFactory = sessionmaker(
    bind=create_engine(sqlalchemy_uri, echo=True),
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def create_session() -> Iterator[Session]:
    """Create new database session.

    Yields:
        Database session.
    """

    session = SessionFactory()

    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


@contextmanager
def open_session() -> Iterator[Session]:
    """Create new database session with context manager.

    Yields:
        Database session.
    """

    return create_session()
