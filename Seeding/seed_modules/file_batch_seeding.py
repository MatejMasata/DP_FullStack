import httpx
from typing import List, Dict

async def post_initial_file_batches(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str
) -> List[int]:
    print(f"\n--- Seeding File Batches ---")
    
    file_batches_to_create = [
        {
            "note": "Annual checkup",
            "label": "Orchard Health Survey 2024"
        },
        {
            "note": "Annual checkup",
            "label": "Orchard Health Survey 2025"
        }
    ]

    created_file_batch_ids: List[int] = []

    for batch_data in file_batches_to_create:
        try:
            response = await client.post(f"{fastapi_api_prefix}/file_batch/", json=batch_data)
            response.raise_for_status() 
            created_batch = response.json()
            created_file_batch_ids.append(created_batch['id'])
            # print(f"Successfully created File Batch: '{batch_data['label']}' with ID: {created_batch['id']}")
        except httpx.HTTPStatusError as e:
            print(f"ERROR posting File Batch ('{batch_data['label']}'): {e.response.status_code} - {e.response.text}")
            raise 
        except httpx.RequestError as e:
            print(f"ERROR network issue posting File Batch ('{batch_data['label']}'): {e}")
            raise
    
    print(f"--- File Batches seeding complete ---")
    return created_file_batch_ids