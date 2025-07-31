# Farm management system

## About

This repository contains all the neccessary files to run full stack application using Docker Compose.
It contains Postgres database, FastAPI backend, React javascript frontend, Keycloak identity provider and Mailhog fake SMTP server.

It also contains files to seed the database with mock data, which might be usefull for testing of the frontend.

## Setup

### Prerequisites

- Docker
- Docker Compose

### First Time Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Set up the secrets:

   Inside the repository-directory/Secrets you can find two .env template files.

   ```
    MAPY_CZ_API_KEY=""
   ```

   ```
    POSTGRES_PASSWORD=
    KC_DB_PASSWORD=
   ```

   You need to enter your valid API key. You can obtain the key here [Mapy developer website](https://developer.mapy.com/cs/) or you can contact the Github repository owner.

   ```
    MAPY_CZ_API_KEY="your mapy cz API key"
   ```

   You need to enter the passwords for Keycloak and Postgres databases. You can use whatever you like, but it's recomended to use strong password.

   ```
    POSTGRES_PASSWORD=YourStrongPassword123.
    KC_DB_PASSWORD=YourStrongPassword123.
   ```

### Start the Application

1. Build and start the application using Docker Compose:
   ```bash
   docker compose up -d --build  # with older version use `docker-compose up -d --build` instead
   ```

### Seeding the Database (Optional)

This project includes a separate Python script to seed the database with mock data. It's meant for testing the frontend, not for deployment of the app.

The seeding process is designed to run outside of Docker.

Prerequisites for Seeding

- Python 3.x
- `pip` (Python package installer)

1.  Navigate to the project directory:

    ```bash
    cd <repository-directory>
    ```

2.  Create a Virtual Environment:

    It's recommended to create a Python virtual environment to manage dependencies. You can name it `.venv`:

    ```bash
    python3 -m venv Seeding/.venv
    ```

    (If `python3` does not work, try `python`.)

3.  Activate the Virtual Environment:

    - On macOS and Linux:

      ```bash
      source Seeding/.venv/bin/activate
      ```

    - On Windows (Command Prompt):

      ```cmd
      Seeding\.venv\Scripts\activate.bat
      ```

    - On Windows (PowerShell):
      ```powershell
      .\Seeding\.venv\Scripts\Activate.ps1
      ```

    Your terminal prompt will show `(.venv)` when the environment is active.

4.  Install Required Packages:

    With the virtual environment active, install the dependencies listed in `requirements.txt`:

    ```bash
    pip install -r Seeding/requirements.txt
    ```

5.  Configure Environment Variables:

    The seeding script requires several environment variables for API communication and mock user credentials. A `.env` file should be present in the `Seeding` directory. Ensure it is configured with your specific values. An example `.env` structure:

    ```
    GLOBAL_ADMIN_USERNAME="your_global_admin_username"
    GLOBAL_ADMIN_PASSWORD="your_global_admin_password"

    TEST_USERNAME="your_test_username"
    TEST_PASSWORD="your_test_password"
    ```

6.  Run the Seeding Script as a Module:

    Execute the main seeding script using the `-m` flag.

    ```bash
    python -m Seeding.seeding_main
    ```

7.  Deactivate Virtual Environment (Optional):

    Once the seeding is complete, you can deactivate the virtual environment:

    ```bash
    deactivate
    ```

### Use the application

- [Frontend](http://localhost:3000/)
- [Keycloak Admin Console](http://localhost:8080/)
- [Mailhog](http://localhost:8025/)
- [FastAPI documentation](http://localhost:8000/docs#/)

## Resources

- [Structuring FastAPI Project Using 3-Tier Design Pattern](https://levelup.gitconnected.com/structuring-fastapi-project-using-3-tier-design-pattern-4d2e88a55757)
- [FastAPI](https://fastapi.tiangolo)
- [Docker](https://www.docker.com/)

## License

TBD
