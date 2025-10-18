DevChama backend (Django + DRF)

Quick start (local dev)

1. Create a Python venv and activate it

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Run migrations and start server

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

4. Create a superuser to access the admin

```bash
python manage.py createsuperuser
```

Notes
- Uses SQLite by default for quick local dev. Change `DATABASES` in `devchama/settings.py` to use Postgres for production.
- JWT auth endpoints are at `/api/auth/token/` and `/api/auth/token/refresh/`.
- API root is `/api/` and includes chamas, contributions, tasks, rewards, and membership nested routes.
- Interactive Swagger UI available at `/api/docs/` once the server is running. Redoc documentation at `/api/redoc/`. Raw schema: `/api/schema/`.
- A starter Postman/Insomnia collection is in `api_collection.json` at the repository root. Import it to quickly exercise the auth and profile endpoints.
