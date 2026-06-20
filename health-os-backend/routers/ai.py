from fastapi import APIRouter, HTTPException
from config.db import db
from services.ollama import check_clinical_safety, check_fraud_patterns

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.get("/safety/{patient_id}")
async def get_safety_analysis(patient_id: int):
    async with db.pool.acquire() as conn:
        patient = await conn.fetchrow("SELECT allergies FROM patients WHERE id = $1", patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        prescriptions = await conn.fetch(
            "SELECT medication_name, dosage, prescriber FROM prescriptions WHERE patient_id = $1",
            patient_id
        )
        
        rx_list = [dict(r) for r in prescriptions]
        analysis = await check_clinical_safety(rx_list, patient["allergies"])
        
        await conn.execute(
            "INSERT INTO access_logs (user_role, description) VALUES ($1, $2)",
            "System", f"Ran AI clinical safety audit for patient ID {patient_id}"
        )
        return analysis

@router.get("/fraud/{patient_id}")
async def get_fraud_analysis(patient_id: int):
    async with db.pool.acquire() as conn:
        patient = await conn.fetchrow("SELECT id FROM patients WHERE id = $1", patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        prescriptions = await conn.fetch(
            "SELECT medication_name, dosage, prescriber, created_at FROM prescriptions WHERE patient_id = $1",
            patient_id
        )
        
        rx_list = []
        for r in prescriptions:
            rx_dict = dict(r)
            if rx_dict.get("created_at"):
                rx_dict["created_at"] = rx_dict["created_at"].isoformat()
            rx_list.append(rx_dict)
            
        analysis = await check_fraud_patterns(rx_list)
        
        await conn.execute(
            "INSERT INTO access_logs (user_role, description) VALUES ($1, $2)",
            "System", f"Ran AI prescription fraud audit for patient ID {patient_id}"
        )
        return analysis
