import httpx
import asyncio
import os
from typing import List, Dict
from dotenv import load_dotenv

# Import clients
from .keycloak.user_client import get_user_access_token
from .keycloak.admin_client import KeycloakAdminSeederClient

# Import seeding functions
from .seed_modules.orchard_seeding import post_initial_orchards
from .seed_modules.tree_seeding import post_initial_trees
from .seed_modules.tree_data_seeding import post_initial_tree_data
from .seed_modules.harvest_seeding import post_initial_harvests
from .seed_modules.agent_seeding import post_initial_agents
from .seed_modules.spraying_seeding import post_initial_sprayings
from .seed_modules.flower_thinning_seeding import post_initial_flower_thinnings
from .seed_modules.fruit_thinning_seeding import post_initial_fruit_thinnings
from .seed_modules.file_batch_seeding import post_initial_file_batches
from .seed_modules.file_seeding import post_initial_files
from .seed_modules.tree_image_seeding import post_initial_tree_images

load_dotenv()

async def main():

    print("--- Starting database seeding process ---")

    # Configuration from environment variables
    FASTAPI_API_URL = os.getenv("FASTAPI_BASE_URL", "http://localhost:8000")
    GLOBAL_ADMIN_USERNAME = os.getenv("GLOBAL_ADMIN_USERNAME")
    GLOBAL_ADMIN_PASSWORD = os.getenv("GLOBAL_ADMIN_PASSWORD")
    TEST_USERNAME = os.getenv("TEST_USERNAME")
    TEST_PASSWORD = os.getenv("TEST_PASSWORD")

    
    # The API prefix for your FastAPI application (e.g., "http://localhost:8000/api/v1")
    fastapi_api_prefix = f"{FASTAPI_API_URL}/api/v1"


# --- GLOBAL ADMIN SETUP ---


    # Initialize Keycloak Admin Client
    admin_client = KeycloakAdminSeederClient()

    # Create GlobalAdmin user and assign Orchard-Global-Admin role
    print("\n--- Ensuring GlobalAdmin user exists and has roles ---")
    try:
        # Create GlobalAdmin
        global_admin_id = await admin_client.create_user(
            username=GLOBAL_ADMIN_USERNAME,
            password=GLOBAL_ADMIN_PASSWORD,
            email=f"{GLOBAL_ADMIN_USERNAME.lower()}@OrchardEmail.com"
        )

        # Get the ID of the 'Orchard-Global-Admin' role
        orchard_global_admin_role_name = "Orchard-Global-Admin"
        orchard_global_admin_role_id = await admin_client.get_realm_role_id(
            role_name=orchard_global_admin_role_name
        )

        # Assign the role to GlobalAdmin user
        await admin_client.assign_realm_role_to_user(
            user_id=global_admin_id,
            role_id=orchard_global_admin_role_id,
            role_name=orchard_global_admin_role_name
        )
        print("--- GlobalAdmin user and role setup complete ---")

    except Exception as e:
        print(f" Initial Keycloak setup for GlobalAdmin failed: {e}")
        print("Please ensure Keycloak is running and admin credentials in .env are correct.")
        exit(1)


# --- SEEDING THE DATA ---


    async with httpx.AsyncClient() as client:
        try:
            # Get access token
            access_token = await get_user_access_token(
                username=GLOBAL_ADMIN_USERNAME,
                password=GLOBAL_ADMIN_PASSWORD
            )
            client.headers.update({"Authorization": f"Bearer {access_token}"}) # Apply token to client


            # SEED ORCHARDS
            created_orchard_ids: List[int] = await post_initial_orchards(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix
            )

            # SEED TREES
            created_tree_info: List[Dict] = await post_initial_trees(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix,
                orchard_ids=created_orchard_ids 
            )

            # SEED TREE DATA
            created_tree_data_ids: List[int] = await post_initial_tree_data(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix,
                created_tree_info=created_tree_info
            )

            # SEED HARVESTS
            await post_initial_harvests(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix,
                created_tree_info=created_tree_info
            )

            # SEED AGENTS
            created_agents_info: List[Dict] = await post_initial_agents(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix
            )

            # SEED SPRAYINGS
            thinning_spray_info: Dict[int, Dict[int, Dict[str, Dict]]] = await post_initial_sprayings( # <-- New call and variable
                client=client,
                fastapi_api_prefix=fastapi_api_prefix,
                created_tree_info=created_tree_info,
                created_agents_info=created_agents_info
            )

            # SEED FLOWER THINNINGS
            await post_initial_flower_thinnings(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix,
                thinning_spray_info=thinning_spray_info,
                created_tree_info=created_tree_info
            )
            # SEED FRUIT THINNINGS
            await post_initial_fruit_thinnings(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix,
                thinning_spray_info=thinning_spray_info,
                created_tree_info=created_tree_info
            )

            # SEED FILE BATCHES
            created_file_batch_ids: List[int] = await post_initial_file_batches(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix
            )

            # SEED FILES
            created_file_ids: List[int] = await post_initial_files(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix,
                created_file_batch_ids=created_file_batch_ids
            )

            # SEED TREE IMAGES
            await post_initial_tree_images(
                client=client,
                fastapi_api_prefix=fastapi_api_prefix,
                created_file_ids=created_file_ids,
                created_tree_info=created_tree_info
            )
            
            # DONE
            print("\n--- Database data seeding process completed successfully! ---")


        except Exception as e:
            print(f"\n--- Database data seeding failed with an error: {e} ---")
            print("Please ensure your FastAPI backend is running, Keycloak is accessible, and environment variables are set correctly.")
            # Exit with a non-zero status code to indicate failure
            exit(1)


# --- CREATE TEST USERS ---

    # Create users
    print("\n--- Creating Test Users ---")
    try:
        test_user_id = await admin_client.create_user(
            username=TEST_USERNAME,
            password=TEST_PASSWORD,
            email=f"{TEST_USERNAME.lower()}@OrchardEmail.com"
        )
        print(f"--- Test user '{TEST_USERNAME}' created successfully with ID: {test_user_id} ---")

    # Assign roles

        # Get Orchard 1 ID (first orchard created)
        orchard_1_id = created_orchard_ids[0]
        
        # Assign Orchard-1-Admin role to TestUser
        orchard_1_admin_role_name = f"Orchard-{orchard_1_id}-Admin"
        orchard_1_admin_role_id = await admin_client.get_realm_role_id(role_name=orchard_1_admin_role_name)
        await admin_client.assign_realm_role_to_user(
            user_id=test_user_id,
            role_id=orchard_1_admin_role_id,
            role_name=orchard_1_admin_role_name
        )
        print(f"Assigned '{orchard_1_admin_role_name}' to '{TEST_USERNAME}'.")

        # Get Orchard 2 ID (second orchard created)
        orchard_2_id = created_orchard_ids[1]

        # Assign Orchard-2-View role to TestUser
        orchard_2_viewer_role_name = f"Orchard-{orchard_2_id}-View"
        orchard_2_viewer_role_id = await admin_client.get_realm_role_id(role_name=orchard_2_viewer_role_name)
        await admin_client.assign_realm_role_to_user(
            user_id=test_user_id,
            role_id=orchard_2_viewer_role_id,
            role_name=orchard_2_viewer_role_name
        )
        print(f"Assigned '{orchard_2_viewer_role_name}' to '{TEST_USERNAME}'.")

    except Exception as e:
        print(f"\n--- Failed to create Test User or assign specific roles: {e} ---")
        exit(1)


# --- DONE ---


    print("\n--- Overall database and Keycloak seeding process completed successfully! ---")


# --- RUN THE MAIN FUNCTION ---


if __name__ == "__main__":
    asyncio.run(main())
    