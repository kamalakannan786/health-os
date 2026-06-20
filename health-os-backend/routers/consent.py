from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from config.db import db

router = APIRouter(prefix="/api/consents", tags=["consents"])

class ConsentRequest(BaseModel):
    patient_id: int
    requester_name: str

class ConsentUpdate(BaseModel):
    status: str
    digital_signature: str = None

@router.get("")
async def get_consents(patient_id: int = None):
    async with db.pool.acquire() as conn:
        if patient_id:
            records = await conn.fetch(
                "SELECT id, patient_id, requester_name, status, digital_signature, updated_at FROM consents WHERE patient_id = $1 ORDER BY updated_at DESC",
                patient_id
            )
        else:
            records = await conn.fetch(
                "SELECT id, patient_id, requester_name, status, digital_signature, updated_at FROM consents ORDER BY updated_at DESC"
            )
        result = []
        for r in records:
            d = dict(r)
            if d.get("updated_at"):
                d["updated_at"] = d["updated_at"].isoformat()
            result.append(d)
        return result


@router.post("")
async def create_consent_request(req: ConsentRequest):
    async with db.pool.acquire() as conn:
        patient = await conn.fetchrow("SELECT id FROM patients WHERE id = $1", req.patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        await conn.execute(
            """
            INSERT INTO consents (patient_id, requester_name, status)
            VALUES ($1, $2, 'pending')
            """,
            req.patient_id, req.requester_name
        )
        await conn.execute(
            "INSERT INTO access_logs (user_role, description) VALUES ($1, $2)",
            req.requester_name, f"Requested records access consent for patient ID {req.patient_id}"
        )
        return {"status": "success"}

@router.put("/{consent_id}")
async def update_consent(consent_id: int, update: ConsentUpdate):
    async with db.pool.acquire() as conn:
        consent = await conn.fetchrow("SELECT id, patient_id, requester_name FROM consents WHERE id = $1", consent_id)
        if not consent:
            raise HTTPException(status_code=404, detail="Consent record not found")
        
        await conn.execute(
            """
            UPDATE consents 
            SET status = $1, digital_signature = $2, updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
            """,
            update.status, update.digital_signature, consent_id
        )
        
        await conn.execute(
            "INSERT INTO access_logs (user_role, description) VALUES ($1, $2)",
            "Patient", f"Updated consent status for {consent['requester_name']} to {update.status} (ID: {consent_id})"
        )
        return {"status": "success"}
