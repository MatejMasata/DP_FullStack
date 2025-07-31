import httpx
from typing import List, Dict
from datetime import datetime, timezone
import random

# SPRAYING CONFIG
# Dates for two annual sprays - spring adn summer
SPRING_SPRAY_MONTH = 5 # May
SPRING_SPRAY_DAY = 10  # 10th

SUMMER_SPRAY_MONTH = 6 # June
SUMMER_SPRAY_DAY = 20  # 20th of June

SPRAY_HOUR = 9         # 9 AM UTC
SPRAY_MINUTE = 0       # 00 minutes

async def post_initial_sprayings(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str, 
    created_tree_info: List[Dict],
    created_agents_info: List[Dict]
) -> Dict[int, Dict[int, Dict[str, Dict]]]:
    # {
    # 1: {
    #     2022: {
    #         "spring_spray": {"id": 101, "datetime": datetime(2022, 5, 10, ...)},
    #         "summer_spray": {"id": 102, "datetime": datetime(2022, 6, 20, ...)}
    #     },
    #     2023: {
    #         "spring_spray": {"id": 103, "datetime": datetime(2023, 5, 10, ...)},
    #         "summer_spray": {"id": 104, "datetime": datetime(2023, 6, 20, ...)}
    #     },
    #     ...
    #     }
    # }

    print(f"\n--- Seeding Sprayings ---")
    
    if not created_tree_info:
        print("Warning: No tree info provided to generate spraying data for. Skipping.")
        return {}
    if not created_agents_info:
        print("Error: No agent info provided. Cannot seed sprayings. Skipping.")
        return {}

    # Extract agent IDs
    agent_ids = [agent['id'] for agent in created_agents_info]
    
    # Return dict
    thinning_spray_info = {}

    current_year = datetime.now(timezone.utc).year

    for tree_item in created_tree_info:
        tree_id = tree_item['id']
        planting_date_str = tree_item['planting_date']
        planting_year = datetime.strptime(planting_date_str, '%Y-%m-%d').year

        thinning_spray_info[tree_id] = {}

        # Generate sprayings
        for year in range(planting_year, current_year + 1):
            
            thinning_spray_info[tree_id][year] = {}

            # Spring Spraying
            spring_spray_datetime = datetime(year, SPRING_SPRAY_MONTH, SPRING_SPRAY_DAY, SPRAY_HOUR, SPRAY_MINUTE, tzinfo=timezone.utc)
            if spring_spray_datetime <= datetime.now(timezone.utc): # Only seed if not in future
                
                random_agent_id = random.choice(agent_ids)
                spray_data = {
                    "note": f"Spring in {year}",
                    "tree_id": tree_id,
                    "agent_id": random_agent_id,
                    "datetime": spring_spray_datetime.isoformat(),
                    "volume": round(random.uniform(5.0, 50.0), 2)
                }
                try:
                    response = await client.post(f"{fastapi_api_prefix}/spraying/", json=spray_data)
                    response.raise_for_status() 
                    created_spray = response.json()
                    # print(f"Successfully created spring spraying for Tree ID: {tree_id}, Year: {year}, ID: {created_spray['id']}")
                    
                    thinning_spray_info[tree_id][year]["spring_spray"] = {
                        "id": created_spray['id'],
                        "datetime": spring_spray_datetime
                    }

                except httpx.HTTPStatusError as e:
                    print(f"ERROR posting Spring Spray (Tree ID: {tree_id}, Year: {year}): {e.response.status_code} - {e.response.text}")
                    raise 
                except httpx.RequestError as e:
                    print(f"ERROR network issue posting Spring Spray (Tree ID: {tree_id}, Year: {year}): {e}")
                    raise

            # Summer spraying
            summer_spray_datetime = datetime(year, SUMMER_SPRAY_MONTH, SUMMER_SPRAY_DAY, SPRAY_HOUR, SPRAY_MINUTE, tzinfo=timezone.utc)
            if summer_spray_datetime <= datetime.now(timezone.utc): # Only seed if not in future
                
                random_agent_id = random.choice(agent_ids)
                spray_data = {
                    "note": f"Summer in {year}",
                    "tree_id": tree_id,
                    "agent_id": random_agent_id,
                    "datetime": summer_spray_datetime.isoformat(),
                    "volume": round(random.uniform(5.0, 50.0), 2)
                }
                try:
                    response = await client.post(f"{fastapi_api_prefix}/spraying/", json=spray_data)
                    response.raise_for_status() 
                    created_spray = response.json()
                    # print(f"Successfully created summer spraying for Tree ID: {tree_id}, Year: {year}, ID: {created_spray['id']}")
                    
                    thinning_spray_info[tree_id][year]["summer_spray"] = {
                        "id": created_spray['id'],
                        "datetime": summer_spray_datetime
                    }

                except httpx.HTTPStatusError as e:
                    print(f"ERROR posting Summer Spray (Tree ID: {tree_id}, Year: {year}): {e.response.status_code} - {e.response.text}")
                    raise 
                except httpx.RequestError as e:
                    print(f"ERROR network issue posting Summer Spray (Tree ID: {tree_id}, Year: {year}): {e}")
                    raise
    
    print(f"--- Sprayings seeding complete. ---")
    return thinning_spray_info

