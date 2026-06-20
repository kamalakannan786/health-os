import os
import asyncio
import asyncpg
from dotenv import load_dotenv

load_dotenv()

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

CREATE TABLE IF NOT EXISTS lab_reports (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT NOT NULL,
    status TEXT NOT NULL,
    report_date TEXT NOT NULL
);
"""

async def main():
    host     = os.getenv("PGHOST",     "localhost")
    port     = int(os.getenv("PGPORT", 5432))
    user     = os.getenv("PGUSER",     "postgres")
    password = os.getenv("PGPASSWORD", "postgres")

    try:
        conn = await asyncpg.connect(
            host=host, port=port, user=user,
            password=password, database="postgres"
        )
        db_exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname = 'health_os'"
        )
        if not db_exists:
            await conn.execute("CREATE DATABASE health_os")
            print("Database 'health_os' created successfully")
        else:
            print("Database 'health_os' already exists")
        await conn.close()
    except Exception as e:
        print(f"Database error: {e}")
        return

    try:
        conn = await asyncpg.connect(
            host=host, port=port, user=user,
            password=password, database="health_os"
        )
        await conn.execute(SCHEMA_SQL)
        print("Schema initialized successfully")
        await conn.close()
    except Exception as e:
        print(f"Schema error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
