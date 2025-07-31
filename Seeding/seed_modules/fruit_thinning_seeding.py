import httpx
from typing import List, Dict
from datetime import datetime, timezone
import random

async def post_initial_fruit_thinnings(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str, 
    thinning_spray_info: Dict[int, Dict[int, Dict[str, Dict]]],
    created_tree_info: List[Dict] # Needed to get planting_year for iterating
) -> None:

    print(f"\n--- Seeding Fruit Thinnings ---")
    
    if not thinning_spray_info:
        print("Warning: No spraying info available for thinning linkage. Skipping fruit thinnings.")
        return
    if not created_tree_info:
        print("Warning: No tree info available. Skipping fruit thinnings.")
        return

    current_year = datetime.now(timezone.utc).year

    for tree_item in created_tree_info:
        tree_id = tree_item['id']
        planting_date_str = tree_item['planting_date']
        planting_year = datetime.strptime(planting_date_str, '%Y-%m-%d').year

        for year in range(planting_year, current_year + 1):
            if tree_id in thinning_spray_info and year in thinning_spray_info[tree_id]:

                # Check if summer_spray data exists for this tree and year
                summer_spray_data = thinning_spray_info[tree_id][year].get("summer_spray")

                if summer_spray_data:
                    spraying_id = summer_spray_data['id']
                    thinning_datetime = summer_spray_data['datetime']

                    # Only seed if the datetime is not in the future
                    if thinning_datetime <= datetime.now(timezone.utc):
                        
                        # Generate random values for croploads
                        cropload_for_4 = random.randint(5, 20)
                        cropload_for_3 = random.randint(10, 30)
                        cropload_for_1 = random.randint(20, 50)

                        # Generate random values for fruits removed and time
                        fruit_for_thinning = random.randint(20, 100)
                        fruit_thinning_time = random.randint(5, 60)

                        fruit_thinning_data = {
                            "note": f"Fruit thinning for Tree ID {tree_id} in {year}",
                            "tree_id": tree_id,
                            "spraying_id": spraying_id,
                            "datetime": thinning_datetime.isoformat(),
                            "mechanical": random.choice([True, False]),
                            "cropload_for_4": cropload_for_4,
                            "cropload_for_3": cropload_for_3,
                            "cropload_for_1": cropload_for_1,
                            "fruit_for_thinning": fruit_for_thinning,
                            "fruit_thinning_time": fruit_thinning_time,
                        }

                        try:
                            response = await client.post(f"{fastapi_api_prefix}/fruit-thinning/", json=fruit_thinning_data)
                            response.raise_for_status() 
                            # created_thinning = response.json()
                            # print(f"Successfully created Fruit Thinning for Tree ID: {tree_id}, Year: {year}, Spray ID: {spraying_id}")
                        except httpx.HTTPStatusError as e:
                            print(f"ERROR posting Fruit Thinning (Tree ID: {tree_id}, Year: {year}, Spray ID: {spraying_id}): {e.response.status_code} - {e.response.text}")
                            raise 
                        except httpx.RequestError as e:
                            print(f"ERROR network issue posting Fruit Thinning (Tree ID: {tree_id}, Year: {year}, Spray ID: {spraying_id}): {e}")
                            raise
    
    print(f"--- Fruit Thinnings seeding complete. ---")