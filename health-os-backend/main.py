import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from config.db import db
from routers import consent, prescription, ai

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consent.router)
app.include_router(prescription.router)
app.include_router(ai.router)

@app.get("/api/logs")
async def get_logs():
    async with db.pool.acquire() as conn:
        records = await conn.fetch("SELECT id, user_role, description, timestamp FROM access_logs ORDER BY timestamp DESC LIMIT 50")
        return [
            {
                "id": r["id"],
                "user_role": r["user_role"],
                "description": r["description"],
                "timestamp": r["timestamp"].isoformat()
            }
            for r in records
        ]

@app.post("/api/seed")
async def seed_database():
    async with db.pool.acquire() as conn:
        await conn.execute("TRUNCATE access_logs, consents, prescriptions, patients RESTART IDENTITY CASCADE")
        
        await conn.execute(
            """
            INSERT INTO patients (id, public_key, full_name, allergies)
            VALUES (1, 'VORTEXA_PUB_ALICE_12345', 'Alice Smith', ARRAY['sulfa', 'penicillin'])
            """
        )
        
        await conn.execute(
            """
            INSERT INTO prescriptions (patient_id, prescriber, medication_name, dosage, encrypted_data)
            VALUES 
            (1, 'Dr. Robert Chen', 'Lisinopril', '10mg daily', 'VORTEXA_ENC:S0V5OlZPUlRFWEFfUFVCX0FMSUNFXzEyMzQ1fERBVEE6TGlzaW5vcHJpbCAxMG1nIGRhaWx5IGZvciBoeXBlcnRlbnNpb24='),
            (1, 'Dr. Sarah Jenkins', 'Lipitor', '20mg at bedtime', 'VORTEXA_ENC:S0V5OlZPUlRFWEFfUFVCX0FMSUNFXzEyMzQ1fERBVEE6TGlwaXRvciAyMG1nIGF0IGJlZHRpbWUgZm9yIGNob2xlc3Rlcm9s')
            """
        )
        
        await conn.execute(
            """
            INSERT INTO consents (patient_id, requester_name, status, digital_signature)
            VALUES 
            (1, 'City General Hospital', 'approved', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
            (1, 'Health-OS Clinical Agent', 'approved', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b857'),
            (1, 'CVS Pharmacy', 'pending', NULL)
            """
        )
        
        await conn.execute(
            """
            INSERT INTO access_logs (user_role, description)
            VALUES 
            ('Patient', 'Registered Vortexa Health-OS digital health vault'),
            ('System', 'Generated secure client-side RSA key pairs'),
            ('Provider', 'City General Hospital requested medical records access'),
            ('Patient', 'Signed and approved City General Hospital access request')
            """
        )
        return {"status": "success", "message": "Database seeded successfully"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
