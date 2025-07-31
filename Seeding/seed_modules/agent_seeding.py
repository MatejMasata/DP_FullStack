import httpx
from typing import List, Dict

# AGENT DATA
AGENTS_TO_CREATE = [
    {"name": "Universal Pesticide", "description": "General-purpose pesticide for common orchard pests."},
    {"name": "General Fungicide", "description": "Broad-spectrum fungicide for disease prevention."},
    {"name": "Foliar Feed A", "description": "Nutrient spray to promote tree health and fruit development."},
    {"name": "Growth Regulator X", "description": "Agent to influence tree growth or fruit size."}
]

# POST THE TESTING DATA TO THE BACKEND
async def post_initial_agents(
    client: httpx.AsyncClient, 
    fastapi_api_prefix: str
) -> List[Dict]:

    print(f"\n--- Seeding Agents ---")
    created_agents_info = []

    for agent_data in AGENTS_TO_CREATE:
        try:
            response = await client.post(f"{fastapi_api_prefix}/agent/", json=agent_data)
            response.raise_for_status()
            created_agent = response.json()

            # print(f"Successfully created agent: ID: {created_agent['id']}, Name: {created_agent['name']}")
            created_agents_info.append({"name": created_agent['name'], "id": created_agent['id']})
            
        except httpx.HTTPStatusError as e:
                print(f"ERROR posting agent '{agent_data['name']}': {e.response.status_code} - {e.response.text}")
                raise
        except httpx.RequestError as e:
            print(f"ERROR network issue posting agent '{agent_data['name']}': {e}")
            raise
    
    print(f"--- Agents seeding complete ---")
    return created_agents_info
