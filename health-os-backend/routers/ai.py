from fastapi import APIRouter, HTTPException
from config.db import db
from services.ollama import check_clinical_safety, check_fraud_patterns, generate_history_report

router = APIRouter(prefix="/api/ai", tags=["ai"])

# In-memory caches for AI analysis results
safety_cache = {}  # patient_id -> (cache_key, analysis_result)
fraud_cache = {}   # patient_id -> (cache_key, analysis_result)
history_cache = {} # (patient_id, medication_lower) -> (cache_key, analysis_result)

def get_safety_cache_key(allergies: list, prescriptions: list):
    allergies_key = tuple(sorted(allergies))
    prescriptions_key = tuple(sorted((r["medication_name"], r["dosage"]) for r in prescriptions))
    return (allergies_key, prescriptions_key)

def get_fraud_cache_key(prescriptions: list):
    prescriptions_key = tuple(sorted((r["medication_name"], r["dosage"], r.get("created_at", "")) for r in prescriptions))
    return prescriptions_key

def get_history_cache_key(allergies: list, prescriptions: list):
    allergies_key = tuple(sorted(allergies))
    prescriptions_key = tuple(sorted((r["prescriber"], r["dosage"], r.get("created_at", "")) for r in prescriptions))
    return (allergies_key, prescriptions_key)

def clear_ai_caches():
    safety_cache.clear()
    fraud_cache.clear()
    history_cache.clear()

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
        allergies = patient["allergies"]
    
    # Check cache
    cache_key = get_safety_cache_key(allergies, rx_list)
    if patient_id in safety_cache and safety_cache[patient_id][0] == cache_key:
        return safety_cache[patient_id][1]
        
    analysis = await check_clinical_safety(rx_list, allergies)
    
    # Store in cache
    safety_cache[patient_id] = (cache_key, analysis)
    
    async with db.pool.acquire() as conn:
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
            
    # Check cache
    cache_key = get_fraud_cache_key(rx_list)
    if patient_id in fraud_cache and fraud_cache[patient_id][0] == cache_key:
        return fraud_cache[patient_id][1]
        
    analysis = await check_fraud_patterns(rx_list)
    
    # Store in cache
    fraud_cache[patient_id] = (cache_key, analysis)
    
    async with db.pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO access_logs (user_role, description) VALUES ($1, $2)",
            "System", f"Ran AI prescription fraud audit for patient ID {patient_id}"
        )
    return analysis

@router.get("/history")
async def get_medication_history_report(patient_id: int, medication: str):
    async with db.pool.acquire() as conn:
        patient = await conn.fetchrow("SELECT allergies, full_name FROM patients WHERE id = $1", patient_id)
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        prescriptions = await conn.fetch(
            "SELECT medication_name, dosage, prescriber, created_at FROM prescriptions WHERE patient_id = $1 AND LOWER(medication_name) = LOWER($2) ORDER BY created_at DESC",
            patient_id, medication
        )
        
        rx_list = []
        for r in prescriptions:
            rx_dict = dict(r)
            if rx_dict.get("created_at"):
                rx_dict["created_at"] = rx_dict["created_at"].isoformat()
            rx_list.append(rx_dict)
            
        allergies = patient["allergies"]
        patient_name = patient["full_name"]
        
    # Check cache
    cache_key = get_history_cache_key(allergies, rx_list)
    cache_lookup_key = (patient_id, medication.lower())
    if cache_lookup_key in history_cache and history_cache[cache_lookup_key][0] == cache_key:
        return history_cache[cache_lookup_key][1]
        
    analysis = await generate_history_report(medication, patient_name, allergies, rx_list)
    
    # Store in cache
    history_cache[cache_lookup_key] = (cache_key, analysis)
    
    async with db.pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO access_logs (user_role, description) VALUES ($1, $2)",
            "System", f"Ran AI clinical history audit for patient ID {patient_id} (Drug: {medication})"
        )
    return analysis
