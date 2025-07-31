from sqlalchemy.orm import Session


class SessionMixin:
    """Base class for application services."""
    def __init__(self, session: Session) -> None:
        self.session = session


class BaseService(SessionMixin):
    """Base class for application services."""


class BaseDataManager(SessionMixin):
    """Base data manager class responsible for operations over database."""
