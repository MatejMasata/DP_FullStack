import httpx
from typing import List, Dict, Set
import random

async def post_initial_tree_images(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str, 
    created_tree_info: List[Dict],
    created_file_ids: List[int]
) -> None:

    print(f"\n--- Seeding Tree Images ---")
    
    if not created_tree_info:
        print("Warning: No trees found. Skipping tree image seeding.")
        return
    if not created_file_ids:
        print("Warning: No files (images) found. Skipping tree image seeding.")
        return

    # Define the number of images to link per tree and their biases
    num_images_options = [0, 1, 2, 3, 4]
    weights = [0.20, 0.40, 0.20, 0.10, 0.10] # 20%+40%+20%+10%+10% = 100%

    # Use a set to keep track of already seeded (tree_id, file_id) pairs to avoid duplicates
    seeded_links: Set[tuple[int, int]] = set()

    for tree_item in created_tree_info:
        tree_id = tree_item['id']

        # Determine how many images to link to this tree based on the defined bias
        num_images_to_link_for_this_tree = random.choices(num_images_options, weights=weights, k=1)[0]
        
        if num_images_to_link_for_this_tree > 0:

            available_files_for_this_tree = []
            for f_id in created_file_ids:
                if (tree_id, f_id) not in seeded_links:
                    available_files_for_this_tree.append(f_id)
            
            # If no unique files are left to link, skip
            if not available_files_for_this_tree:
                continue

            actual_num_links = min(num_images_to_link_for_this_tree, len(available_files_for_this_tree))
            
            # Select unique file_ids for this tree from the available ones
            selected_file_ids = random.sample(available_files_for_this_tree, k=actual_num_links)
            
            for file_id in selected_file_ids:
                # Add to set
                seeded_links.add((tree_id, file_id))

                tree_image_data = {
                    "note": f"Image link for Tree ID {tree_id} and File ID {file_id}",
                    "tree_id": tree_id,
                    "file_id": file_id,
                }

                try:
                    response = await client.post(f"{fastapi_api_prefix}/tree_image/", json=tree_image_data)
                    response.raise_for_status() 
                    # created_tree_image = response.json()
                    # print(f"Successfully linked Tree ID: {tree_id} with File ID: {file_id}")

                except httpx.HTTPStatusError as e:
                    print(f"ERROR posting Tree Image link (Tree ID: {tree_id}, File ID: {file_id}): {e.response.status_code} - {e.response.text}")
                except httpx.RequestError as e:
                    print(f"ERROR network issue posting Tree Image link (Tree ID: {tree_id}, File ID: {file_id}): {e}")
                    raise
    
    print(f"--- Tree Images seeding complete.---")
    