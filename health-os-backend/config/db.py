import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

PGHOST = os.getenv("PGHOST", "localhost")
PGPORT = int(os.getenv("PGPORT", 5432))
PGUSER = os.getenv("PGUSER", "postgres")
PGPASSWORD = os.getenv("PGPASSWORD", "postgres")
PGDATABASE = os.getenv("PGDATABASE", "health_os")

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    public_key TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    allergies TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    prescriber TEXT NOT NULL,
    medication_name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    encrypted_data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS consents (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    requester_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    digital_signature TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS access_logs (
    id SERIAL PRIMARY KEY,
    user_role TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

class Database:
    def __init__(self):
        self.pool = None

    async def _ensure_database_exists(self):
        conn = await asyncpg.connect(
            host=PGHOST,
            port=PGPORT,
            user=PGUSER,
            password=PGPASSWORD,
            database="postgres"
        )
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = $1", PGDATABASE
        )
        if not exists:
            await conn.execute(f'CREATE DATABASE "{PGDATABASE}"')
        await conn.close()

    async def connect(self):
        await self._ensure_database_exists()
        self.pool = await asyncpg.create_pool(
            host=PGHOST,
            port=PGPORT,
            user=PGUSER,
            password=PGPASSWORD,
            database=PGDATABASE,
            min_size=5,
            max_size=20
        )
        async with self.pool.acquire() as conn:
            await conn.execute(SCHEMA_SQL)

    async def disconnect(self):
        if self.pool:
            await self.pool.close()

db = Database()
