import httpx
import os
import pathlib
from typing import List
from datetime import datetime, timezone
import random
import mimetypes

# Define the directory where files are located
FILE_STORAGE_DIR = pathlib.Path(__file__).parent.parent / "seed_files"

# List of image filenames
IMAGE_FILENAMES = [
    "troja_1.jpeg",
    "troja_2.jpeg",
    "troja_3.jpeg",
    "troja_4.jpeg",
]

async def post_initial_files(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str, 
    created_file_batch_ids: List[int]
) -> List[int]:
    
    print(f"\n--- Seeding Files ---")
    
    if not created_file_batch_ids:
        print("Warning: No file batches found. Skipping file seeding")
        return []
    
    if not FILE_STORAGE_DIR.exists():
        print(f"ERROR: '{FILE_STORAGE_DIR}' directory not found. Please create it and place image files inside")
        return []

    created_file_ids: List[int] = []

    for filename in IMAGE_FILENAMES:
        file_path = FILE_STORAGE_DIR / filename
        
        if not file_path.is_file():
            print(f"Warning: File not found at '{file_path}'. Skipping this file")
            continue

        # Randomly select a file_batch_id
        file_batch_id = random.choice(created_file_batch_ids)

        # Get current datetime and format it
        file_datetime_obj = datetime.now(timezone.utc)
        file_datetime_str = file_datetime_obj.strftime("%y%m%d_%H%M%S")

        # Infer MIME type
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if mime_type is None:
            mime_type = 'application/octet-stream'

        try:
            # Open the file in binary mode for upload
            with open(file_path, "rb") as f:
                file_content = f.read()

                files_payload = {
                    'upload_file': (filename, file_content, mime_type)
                }

                # Construct the URL with query parameters
                url = f"{fastapi_api_prefix}/file/?file_batch_id={file_batch_id}&file_datetime={file_datetime_str}"
                
                response = await client.post(url, files=files_payload)
                response.raise_for_status() 
                created_file = response.json()
                created_file_ids.append(created_file['id'])
                # print(f"Successfully uploaded file '{filename}' (ID: {created_file['id']}) to Batch ID: {file_batch_id}")

        except httpx.HTTPStatusError as e:
            print(f"ERROR posting File '{filename}': {e.response.status_code} - {e.response.text}")
            raise 
        except httpx.RequestError as e:
            print(f"ERROR network issue posting File '{filename}': {e}")
            raise
        except IOError as e:
            print(f"ERROR reading file '{file_path}': {e}")
            raise
    
    print(f"--- Files seeding complete ---")
    return created_file_ids