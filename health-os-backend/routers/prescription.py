from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from config.db import db

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])

class PrescriptionCreate(BaseModel):
    patient_id: int
    prescriber: str
    medication_name: str
    dosage: str
    encrypted_data: str

@router.post("")
async def create_prescription(rx: PrescriptionCreate):
    async with db.pool.acquire() as conn:
        patient = await conn.fetchrow("SELECT id FROM patients WHERE id = $1", rx.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        await conn.execute(
            """
            INSERT INTO prescriptions (patient_id, prescriber, medication_name, dosage, encrypted_data)
            VALUES ($1, $2, $3, $4, $5)
            """,
            rx.patient_id, rx.prescriber, rx.medication_name, rx.dosage, rx.encrypted_data
        )
        
        await conn.execute(
            "INSERT INTO access_logs (user_role, description) VALUES ($1, $2)",
            "Provider", f"Created new prescription for patient ID {rx.patient_id}"
        )
        return {"status": "success"}

@router.get("")
async def get_prescriptions(
    patient_id: int, 
    requester: str = Query(...), 
    signature: str = Query(None),
    public_key: str = Query(None)
):
    async with db.pool.acquire() as conn:
        if requester != "Patient":
            consent = await conn.fetchrow(
                """
                SELECT status, digital_signature 
                FROM consents 
                WHERE patient_id = $1 AND requester_name = $2 AND status = 'approved'
                """,
                patient_id, requester
            )
            if not consent:
                raise HTTPException(status_code=403, detail="Access denied. No active approved consent found.")
            
        records = await conn.fetch(
            "SELECT id, patient_id, prescriber, medication_name, dosage, encrypted_data, created_at FROM prescriptions WHERE patient_id = $1 ORDER BY created_at DESC",
            patient_id
        )
        
        await conn.execute(
            "INSERT INTO access_logs (user_role, description) VALUES ($1, $2)",
            requester, f"Accessed prescriptions list for patient ID {patient_id}"
        )
        
        result = []
        for r in records:
            d = dict(r)
            if d.get("created_at"):
                d["created_at"] = d["created_at"].isoformat()
            result.append(d)
        return result

