from datetime import datetime as datetime_type

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Response, status
from sqlalchemy.orm import Session
from typing import List

from app.backend.session import create_session
from app.schemas import FileSchema, CreateFileSchema, UpdateFileSchema
from app.services import FileService, FileBatchService

from app.security.auth import verify_any_orchard_view_access, verify_any_orchard_admin_access, verify_global_admin_access
from app.schemas.user_permissions import UserOrchardPermissions

router = APIRouter(prefix="/file", tags=["file"])


@router.get("/", response_model=List[FileSchema])
async def get_file_mastertable(
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to at least one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_view_access)
) -> List[FileSchema]:
    # The dependency chain handles authorization
    return FileService(session).get_file_mastertable()


@router.get("/{file_id}", response_model=FileSchema)
async def get_file(
    file_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to at least one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_view_access)
) -> FileSchema:
    # The dependency chain handles authorization
    return FileService(session).get_file(file_id)


@router.get("/{file_id}/content", response_class=Response)
async def get_file_content(
    file_id: int,
    session: Session = Depends(create_session),
    # User must have VIEW ACCESS to at least one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_view_access)
) -> Response:
    content, media_type = FileService(session).get_file_content(file_id)
    # The dependency chain handles authorization
    return Response(content=content, media_type=media_type)


@router.post("/", response_model=FileSchema)
async def create_file(
    file_batch_id: int,
    file_datetime: str,
    upload_file: UploadFile = File(...),
    session: Session = Depends(create_session),
    # User must have ADMIN ACCESS to at least one orchard
    permissions: UserOrchardPermissions = Depends(verify_any_orchard_admin_access)
) -> FileSchema:
    
    try:
        file_datetime = datetime_type.strptime(file_datetime, "%y%m%d_%H%M%S")
    except ValueError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Provided datetime string ({file_datetime}), does not match desired format '%y%m%d_%H%M%S'")

    file = CreateFileSchema(
            file_batch_id=file_batch_id,
            name=upload_file.filename,
            datetime=file_datetime,
            mime=upload_file.content_type,
        )

    FileBatchService(session).get_file_batch(file_batch_id)
    # The dependency chain handles authorization
    return FileService(session).create_file(file, content=upload_file.file.read())


# @router.put("/", response_model=FileSchema)
# async def update_file(
#     file_dto: UpdateFileSchema,
#     session: Session = Depends(create_session)
# ) -> FileSchema:
#
#     return FileService(session).update_file(file_dto)


# @router.delete("/", response_model=FileSchema)
# async def delete_file(
#     file_id: int,
#     session: Session = Depends(create_session)
# ) -> FileSchema:
#
#     return FileService(session).delete_file(file_id)
