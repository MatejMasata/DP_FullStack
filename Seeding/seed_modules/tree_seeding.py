import httpx
from typing import List, Dict
from datetime import datetime, timedelta
import random

"""
STARTING COORDINATES:
    Orchard 1: 50.3703019N, 15.5675036E;
    Orchard 2: 50.3700881N, 15.5685108E;
    Orchard 3: 50.3697711N, 15.5697647E;
"""
ORCHARD_START_COORDS = [
    (50.3703019, 15.5675036),  # Orchard 1
    (50.3700881, 15.5685108),  # Orchard 2
    (50.3697711, 15.5697647),  # Orchard 3
]

"""
STEPS IN LAT AND LONG
latitude - north -> south
longitude - west -> east
"""
LAT_STEP_PER_TREE_IN_ROW = -0.0000150
LONG_STEP_PER_ROW = +0.0000578

"""
rows, numbers, fields
"""
ORCHARD_LAYOUTS = [
    (5, 5, 4),      # Layout for orchard 1
    (10, 10, 2),    # Layout for orchard 2
    (2, 6, 3)       # Layout for orchard 3
]

# TREES TESTING DATA GEBERATOR
def generate_tree_data(
    orchard_id: int,
    rows: int,
    numbers: int,
    fields: int,
    start_lat: float,
    start_long: float
) -> List[Dict]:
    
    tree_data = []

    for row in range(1, rows + 1):
        long = start_long + ((row-1) * LONG_STEP_PER_ROW)

        for number in range(1, numbers + 1):
            for field in range(1, fields + 1):

                lat = start_lat + (((field-1) + (number-1)*fields) * LAT_STEP_PER_TREE_IN_ROW)

                planting_date = (datetime.today() + timedelta(days=random.randint(-365*5, -1))).date() # Planted sometime in the last 5 years

                tree = {
                    "note": "Test tree",
                    "orchard_id": orchard_id,
                    "genotype_id": 1,
                    "rootstock_id": 1,
                    "row": row,
                    "field": field,
                    "number": number,
                    "latitude": lat,
                    "longitude": long,
                    "spacing": 1.5,
                    "growth_type": random.choice(["upright", "spreading", "compact"]),
                    "training_shape": random.choice(["central leader", "open center", "trellis"]),
                    "planting_date": planting_date.isoformat(),
                    "initial_age": random.choice(["1 year", "2 years", "3 years"]),
                    "nursery_tree_type": random.choice(["whip", "feathered", "branched"]),
                }

                tree_data.append(tree)

    return tree_data


# POST THE TESTING DATA TO THE BACKEND
async def post_initial_trees(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str, 
    orchard_ids: List[int],
) -> List[Dict]:
    
    print(f"\n--- Seeding trees ---")

    created_tree_info = []

    for i, orchard_id in enumerate(orchard_ids):
        rows, numbers, fields = ORCHARD_LAYOUTS[i % len(ORCHARD_LAYOUTS)]
        start_lat, start_long = ORCHARD_START_COORDS[i % len(ORCHARD_START_COORDS)]

        tree_data = generate_tree_data(orchard_id, rows, numbers, fields, start_lat, start_long)

        if not tree_data:
            print(f"Warning: No trees to post for orchard {orchard_id}.")
            continue

        for index, tree_item in enumerate(tree_data):

            try:
                response = await client.post(f"{fastapi_api_prefix}/tree/", json=tree_item)
                response.raise_for_status() 
                created_tree = response.json()
                tree_id = created_tree.get("id")

                if tree_id:
                    #print(f"Successfully created tree: ID: {tree_id} in Orchard ID: {created_tree.get('orchard_id')}")
                    created_tree_info.append({
                        'id': tree_id, 
                        'planting_date': tree_item['planting_date']
                    })
                else:
                    print("Warning: API returns a 2xx but no ID returned for tree")

            except httpx.HTTPStatusError as e:
                print(f"ERROR posting tree (Index: {index}, Orchard ID: {orchard_id}): {e.response.status_code} - {e.response.text}")
                if e.response.status_code == 409:
                    print("Likely already exists - skipping")
                else:
                    raise 
                
            except httpx.RequestError as e:
                print(f"ERROR network issue posting tree (dataset id = {index}): {e}")
                raise 
    
    print(f"--- Trees seeding complete ---")
    return created_tree_info
