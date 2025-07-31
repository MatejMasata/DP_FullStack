import httpx
from typing import List, Dict
from datetime import datetime, timezone
import random

async def post_initial_flower_thinnings(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str, 
    thinning_spray_info: Dict[int, Dict[int, Dict[str, Dict]]],
    created_tree_info: List[Dict]
) -> None:

    print(f"\n--- Seeding Flower Thinnings ---")
    
    if not thinning_spray_info:
        print("Warning: No spraying info available for thinning linkage. Skipping flower thinnings.")
        return
    if not created_tree_info:
        print("Warning: No tree info available. Skipping flower thinnings.")
        return

    current_year = datetime.now(timezone.utc).year

    for tree_item in created_tree_info:
        tree_id = tree_item['id']
        planting_date_str = tree_item['planting_date']
        planting_year = datetime.strptime(planting_date_str, '%Y-%m-%d').year

        for year in range(planting_year, current_year + 1):
            if tree_id in thinning_spray_info and year in thinning_spray_info[tree_id]:

                # Check if spring_spray data exists for this tree and year
                spring_spray_data = thinning_spray_info[tree_id][year].get("spring_spray")

                if spring_spray_data:
                    spraying_id = spring_spray_data['id']
                    thinning_datetime = spring_spray_data['datetime']

                    # Only seed if the datetime is not in the future
                    if thinning_datetime <= datetime.now(timezone.utc):
                        
                        # Generate random values - current year
                        before_thinning_current = random.randint(15, 60)
                        for_thinning_current = random.randint(0, int(before_thinning_current * 0.7))
                        after_thinning_current = before_thinning_current - for_thinning_current

                        # Generate random values - one year ago
                        before_thinning_one_year = max(0, before_thinning_current + random.randint(-8, 8))
                        for_thinning_one_year = random.randint(0, int(before_thinning_one_year * 0.7))
                        after_thinning_one_year = before_thinning_one_year - for_thinning_one_year

                        flower_thinning_data = {
                            "note": f"Flower thinning in {year}",
                            "tree_id": tree_id,
                            "spraying_id": spraying_id,
                            "datetime": thinning_datetime.isoformat(),
                            "mechanical": random.choice([True, False]),
                            "flower_clusters_before_thinning": before_thinning_current,
                            "flower_clusters_for_thinning": for_thinning_current,
                            "flower_clusters_after_thinning": after_thinning_current,
                            "flower_clusters_before_thinning_one_year": before_thinning_one_year,
                            "flower_clusters_for_thinning_one_year": for_thinning_one_year,
                            "flower_clusters_after_thinning_one_year": after_thinning_one_year,
                        }

                        try:
                            response = await client.post(f"{fastapi_api_prefix}/flower-thinning/", json=flower_thinning_data)
                            response.raise_for_status() 
                            # created_thinning = response.json()
                            # print(f"Successfully created Flower Thinning for Tree ID: {tree_id}, Year: {year}, Spray ID: {spraying_id}")
                        except httpx.HTTPStatusError as e:
                            print(f"ERROR posting Flower Thinning (Tree ID: {tree_id}, Year: {year}, Spray ID: {spraying_id}): {e.response.status_code} - {e.response.text}")
                            raise 
                        except httpx.RequestError as e:
                            print(f"ERROR network issue posting Flower Thinning (Tree ID: {tree_id}, Year: {year}, Spray ID: {spraying_id}): {e}")
                            raise
    
    print(f"--- Flower Thinnings seeding complete. ---")