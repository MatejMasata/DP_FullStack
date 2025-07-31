import httpx
from typing import List, Dict
from datetime import datetime, timedelta, timezone
import random

NUM_YEARS_OF_DATA = 5

# TREE DATA TESTING DATA GENERATOR
def generate_tree_data_entry(
    tree_id: int,
    measurement_date: datetime, # Pass the specific datetime for this entry
    year_offset: int # Indicates how many years past planting this entry is
) -> dict:

    # Base values (for year 0/1)
    base_one_year_height = 0.8 # m
    base_fruiting_wood_height = 0.1 # m
    base_total_height = 1.0 # m
    base_trunk_girth = 0.05 # cm

    # Increment values based on year_offset
    one_year_height = round(base_one_year_height + (year_offset * random.uniform(0.1, 0.4)), 2)
    fruiting_wood_height = round(base_fruiting_wood_height + (year_offset * random.uniform(0.05, 0.2)), 2)
    total_height = round(base_total_height + (year_offset * random.uniform(0.5, 1.5)), 2)
    trunk_girth = round(base_trunk_girth + (year_offset * random.uniform(0.02, 0.08)), 2)

    # Convert to integers
    one_year_height = int(round(one_year_height * 100))
    fruiting_wood_height = int(round(fruiting_wood_height * 100))
    total_height = int(round(total_height * 100))
    trunk_girth = int(round(trunk_girth * 100))

    # Suckering can remain somewhat random year to year
    suckering = random.randint(0, 5) 

    # Generate pruning dates
    # - Assume summer pruning is around July, winter pruning around Feb/March
    # - Adjusting to the specific year of the measurement_datetime
    year = measurement_date.year
    summer_pruning_date_obj = datetime(year, 7, random.randint(1, 30), random.randint(9, 17), random.randint(0, 59), tzinfo=timezone.utc)
    winter_pruning_date_obj = datetime(year, 2, random.randint(1, 28), random.randint(9, 17), random.randint(0, 59), tzinfo=timezone.utc)

    summer_pruning_date = summer_pruning_date_obj.isoformat()
    winter_pruning_date = winter_pruning_date_obj.isoformat()


    data_entry = {
        "note": f"Year {year_offset+1} data for tree {tree_id}",
        "tree_id": tree_id,
        "datetime": measurement_date.isoformat(),
        "one_year_height": one_year_height,
        "fruiting_wood_height": fruiting_wood_height,
        "total_height": total_height,
        "trunk_girth": trunk_girth,
        "suckering": suckering,
        "summer_pruning_date": summer_pruning_date,
        "winter_pruning_date": winter_pruning_date, 
        "summer_pruning_note": f"Summer pruning for year {year_offset+1}",
        "winter_pruning_note": f"Winter pruning for year {year_offset+1}",
    }
    return data_entry



# POST THE TESTING DATA TO THE BACKEND
async def post_initial_tree_data(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str, 
    created_tree_info: List[Dict],
) -> List[int]:
    
    print(f"\n--- Seeding tree data entries ---")

    created_tree_data_ids = []

    if not created_tree_info:
        print("Warning: No tree info provided to generate tree data for. Skipping.")
        return []

    for tree_data_item in created_tree_info:

        tree_id = tree_data_item['id']
        planting_date_str = tree_data_item['planting_date']

        planting_datetime = datetime.strptime(planting_date_str, '%Y-%m-%d').replace(hour=12, minute=0, second=0, tzinfo=timezone.utc)

        for year_offset in range(NUM_YEARS_OF_DATA):
            # Calculate the measurement date for this specific year
            measurement_datetime = planting_datetime + timedelta(days=year_offset * 365) # 1 year intervals
            
            # Ensure the measurement datetime is not in the future for current year's data
            if measurement_datetime > datetime.now(timezone.utc):
                #print(f"Skipping future data for Tree ID {tree_id} for year offset {year_offset}. Date: {measurement_datetime.isoformat()}")
                continue

            tree_data_entry = generate_tree_data_entry(tree_id, measurement_datetime, year_offset)

            try:
                response = await client.post(f"{fastapi_api_prefix}/tree_data/", json=tree_data_entry)
                response.raise_for_status() 
                created_entry = response.json()
                entry_id = created_entry.get("id")

                if entry_id:
                    #print(f"Successfully created tree data entry: ID: {entry_id} for Tree ID: {created_entry.get('tree_id')}")
                    created_tree_data_ids.append(entry_id)
                else:
                    print(f"Warning: API returns a 2xx but no ID returned for tree data entry (Tree ID: {tree_id})")

            except httpx.HTTPStatusError as e:
                print(f"ERROR posting tree data entry (Tree ID: {tree_id}, Year Offset: {year_offset}): {e.response.status_code} - {e.response.text}")
                if e.response.status_code == 409:
                    print("Likely already exists - skipping")
                else:
                    raise 
                
            except httpx.RequestError as e:
                print(f"ERROR network issue posting tree data entry (Tree ID: {tree_id}, Year Offset: {year_offset}): {e}")
                raise 
    
    print(f"--- Tree data seeding complete ---")
    return created_tree_data_ids