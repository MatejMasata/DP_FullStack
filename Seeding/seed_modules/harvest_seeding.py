import httpx
from typing import List, Dict
from datetime import datetime, timedelta, timezone
import random

# Config
HARVEST_MONTH = 9   # September
HARVEST_DAY = 15    # 15th of September
HARVEST_HOUR = 10   # 10 AM UTC
HARVEST_MINUTE = 0  # 00 minutes

# HARVESTS TESTING DATA GENERATOR
def generate_harvest_data_entry(tree_id: int, harvest_datetime: datetime) -> dict:
    
    # Rlapsed time - random - minutes
    elapsed_time = random.randint(5, 30)

    # Fruit quantities and weights - random - grams
    # - Larger fruits should weight more
    qty_60 = random.randint(10, 50)
    weight_60 = int(round(qty_60 * random.uniform(0.05, 0.08), 0))

    qty_70 = random.randint(50, 150)
    weight_70 = int(round(qty_70 * random.uniform(0.08, 0.12), 0))

    qty_over_70 = random.randint(30, 100)
    weight_over_70 = int(round(qty_over_70 * random.uniform(0.12, 0.25), 0))

    total_fruit_quantity = qty_60 + qty_70 + qty_over_70
    total_fruit_weight = weight_60 + weight_70 + weight_over_70

    # Average fruit weight
    average_fruit_weight = round(total_fruit_weight / total_fruit_quantity, 2) if total_fruit_quantity > 0 else 0.0

    # Damage - random
    aphids_damage_quantity = 0
    aphids_damage_weight = 0
    damaged_percentage = 0

    if random.random() < 0.3: # 30% chance of some damage
        aphids_damage_quantity = random.randint(1, int(total_fruit_quantity * 0.1)) # Up to 10% of quantity
        aphids_damage_weight = int(round(aphids_damage_quantity * random.uniform(0.05, 0.20), 0))
        if total_fruit_quantity > 0:
            damaged_percentage = int(round((aphids_damage_quantity / total_fruit_quantity) * 100, 0))
    
    data_entry = {
        "note": f"Harvest for Tree ID {tree_id} on {harvest_datetime.year}",
        "tree_id": tree_id,
        "datetime": harvest_datetime.isoformat(),
        "elapsed_time": elapsed_time,
        "fruit_under_60mm_quantity": qty_60,
        "fruit_under_60mm_weight": weight_60,
        "fruit_under_70mm_quantity": qty_70,
        "fruit_under_70mm_weight": weight_70,
        "fruit_over_70mm_quantity": qty_over_70,
        "fruit_over_70mm_weight": weight_over_70,
        "average_fruit_weight": average_fruit_weight,
        "aphids_damage_quantity": aphids_damage_quantity,
        "aphids_damage_weight": aphids_damage_weight,
        "damaged_percentage": damaged_percentage
    }
    return data_entry

# POST THE TESTING DATA TO THE BACKEND
async def post_initial_harvests(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str, 
    created_tree_info: List[Dict],
):
    print(f"\n--- Posting harvest data entries---")

    if not created_tree_info:
        print("Warning: No tree info provided to generate harvest data for. Skipping.")
        return

    current_year = datetime.now(timezone.utc).year

    for tree_item in created_tree_info:
        tree_id = tree_item['id']
        planting_date_str = tree_item['planting_date']
        planting_year = datetime.strptime(planting_date_str, '%Y-%m-%d').year

        # Generate harvests from planting year up to the current year
        for year in range(planting_year, current_year + 1):
            
            harvest_datetime = datetime(year, HARVEST_MONTH, HARVEST_DAY, HARVEST_HOUR, HARVEST_MINUTE, tzinfo=timezone.utc)

            # Don't post future harvests
            if harvest_datetime > datetime.now(timezone.utc):
                #print(f"Skipping future harvest for Tree ID {tree_id} in year {year}.")
                continue

            harvest_entry = generate_harvest_data_entry(tree_id, harvest_datetime)

            try:
                response = await client.post(f"{fastapi_api_prefix}/harvest/", json=harvest_entry)
                response.raise_for_status() 
                #print(f"Successfully created harvest entry for Tree ID: {tree_id} in year: {year}")

            except httpx.HTTPStatusError as e:
                print(f"ERROR posting harvest entry (Tree ID: {tree_id}, Year: {year}): {e.response.status_code} - {e.response.text}")
                if e.response.status_code == 409:
                    print("Likely already exists - skipping")
                else:
                    raise 
                
            except httpx.RequestError as e:
                print(f"ERROR network issue posting harvest entry (Tree ID: {tree_id}, Year: {year}): {e}")
                raise 
    
    print(f"--- Harvest data seeding complete ---")