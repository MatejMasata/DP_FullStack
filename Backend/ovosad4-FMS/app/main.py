import logging
from contextlib import asynccontextmanager

from app.const import (
    OPEN_API_TITLE,
    OPEN_API_DESCRIPTION,
    OPEN_API_SUMMARY,
    OPEN_API_TERMS_OF_SERVICE,
    OPEN_API_CONTACT,
    OPEN_API_LICENSE,
)
from app.version import __version__, __api_version__
from .backend.migrations import run_migrations

from fastapi import FastAPI

# from .dependencies import
# from .internal import
from .routers import orchard
from .routers import tree
from .routers import file
from .routers import tree_image
from .routers import file_batch
from .routers import tree_data
from .routers import harvest
from .routers import spraying
from .routers import agent
from .routers import fruit_thinning
from .routers import flower_thinning
from .routers import map_proxy 


logger = logging.getLogger("uvicorn")

@asynccontextmanager
async def lifespan(app_: FastAPI):
    # Code to run on startup
    logger.info("Starting up...")
    logger.info("run alembic upgrade head...")
    run_migrations()
    yield
    # Code to run on shutdown
    logger.info("Shutting down...")


app = FastAPI(
    title=OPEN_API_TITLE,
    description=OPEN_API_DESCRIPTION,
    summary=OPEN_API_SUMMARY,
    version=__version__,
    terms_of_service=OPEN_API_TERMS_OF_SERVICE,
    contact=OPEN_API_CONTACT,
    license_info=OPEN_API_LICENSE,
    lifespan=lifespan,
)

prefix=f"/api/{__api_version__}"

app.include_router(orchard.router, prefix=prefix)
app.include_router(tree.router, prefix=prefix)
app.include_router(file_batch.router, prefix=prefix)
app.include_router(file.router, prefix=prefix)
app.include_router(tree_image.router, prefix=prefix)
app.include_router(tree_data.router, prefix=prefix)
app.include_router(harvest.router, prefix=prefix)
app.include_router(spraying.router, prefix=prefix)
app.include_router(agent.router, prefix=prefix)
app.include_router(fruit_thinning.router, prefix=prefix)
app.include_router(flower_thinning.router, prefix=prefix)
app.include_router(map_proxy.router, prefix=prefix)


@app.get("/")
async def root():
    return {"message": "Hello FMS!"}
