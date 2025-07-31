import httpx
from typing import List

# ORCHARDS TESTING DATA
ORCHARD_DATA = [
    {
        "name": "Holovousy 1",
        "note": "Testing data"
    },
    {
        "name": "Holovousy 2",
        "note": "Testing data"
    },
    {
        "name": "Holovousy 3",
        "note": "Testing data"
    }
]

# POST THE TESTING DATA TO THE BACKEND
async def post_initial_orchards(
        client: httpx.AsyncClient,
        fastapi_api_prefix: str
) -> List[str]:
    
    if not ORCHARD_DATA:
        print("Warning: ORCHARD_DATA list is empty. No orchards to post.")
        return []

    print("\n--- Seeding orchards ---")
    
    created_orchard_ids = []
    for orchard_item in ORCHARD_DATA:

        orchard_name_log = orchard_item.get("name") 

        print(f" Creating Orchard: {orchard_name_log}")
        try:
            response = await client.post(f"{fastapi_api_prefix}/orchard/", json=orchard_item)
            response.raise_for_status() 

            # Parse the data from response
            created_orchard = response.json()
            orchard_id = created_orchard.get("id") 

            if orchard_id:
                #print(f"Successfully created orchard: ID: {orchard_id}, Name: {created_orchard.get("name")}")
                created_orchard_ids.append(orchard_id)
            else:
                print(f"Warning: API returns a 2xx but no ID returned for {orchard_item['name']}")

        except httpx.HTTPStatusError as e:
            print(f"ERROR posting orchard '{orchard_name_log}': {e.response.status_code} - {e.response.text}")
            if e.response.status_code == 409:
                 print("Likely already exists - skipping")
            else:
                 raise 
            
        except httpx.RequestError as e:
            print(f"ERROR network issue posting orchard (name = {orchard_name_log})': {e}")
            raise 
    
    print(f"--- Orchards seeding complete ---")
    return created_orchard_ids