import os
import json
import httpx
from dotenv import load_dotenv

load_dotenv()

OLLAMA_URL = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
MODEL_NAME = "llama3.2:3b"

async def query_ollama(prompt: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OLLAMA_URL}/api/generate",
                json={
                    "model": MODEL_NAME,
                    "prompt": prompt,
                    "format": "json",
                    "stream": False,
                    "options": {
                        "temperature": 0.0,
                        "num_predict": 256,
                        "num_ctx": 1024
                    }
                }
            )
            if response.status_code != 200:
                raise Exception(response.text)
            res_json = response.json()
            return json.loads(res_json["response"])
    except Exception as e:
        return {"error": str(e), "is_fallback": True}

async def check_clinical_safety(prescriptions: list, allergies: list) -> dict:
    prompt = f"""
    Analyze the following patient clinical data for potential health safety risks.
    Allergies: {json.dumps(allergies)}
    Prescriptions: {json.dumps(prescriptions)}

    Identify any drug-drug interactions, duplicate therapies, allergy mismatches, or dosage risks.
    Return ONLY a JSON object with this exact structure:
    {{
      "isSafe": false,
      "safetyScore": 45,
      "warnings": [
        {{
          "type": "Drug Interaction",
          "severity": "High",
          "message": "Detailed description of the interaction and why it is unsafe"
        }}
      ],
      "recommendations": [
        "Recommendation message 1",
        "Recommendation message 2"
      ]
    }}
    """
    res = await query_ollama(prompt)
    if res.get("is_fallback"):
        return run_local_clinical_fallback(prescriptions, allergies)
    return res

async def check_fraud_patterns(prescriptions: list) -> dict:
    prompt = f"""
    Inspect the following prescription history for anomalous patterns, insurance anomalies, or abuse (e.g. overlapping dates, high frequency, doctor-shopping).
    History: {json.dumps(prescriptions)}

    Return ONLY a JSON object with this exact structure:
    {{
      "fraudScore": 72,
      "anomalies": [
        {{
          "type": "Doctor Shopping",
          "severity": "Medium",
          "description": "Details of the pattern and why it is flagged"
        }}
      ],
      "verdict": "Flagged"
    }}
    """
    res = await query_ollama(prompt)
    if res.get("is_fallback"):
        return run_local_fraud_fallback(prescriptions)
    return res

def run_local_clinical_fallback(prescriptions: list, allergies: list) -> dict:
    warnings = []
    lowercase_allergies = [a.lower() for a in (allergies or [])]
    
    for rx in prescriptions:
        med = rx.get("medication_name", "").lower()
        for allergy in lowercase_allergies:
            if allergy in med or med in allergy:
                warnings.append({
                    "type": "Allergy Conflict",
                    "severity": "Critical",
                    "message": f"Medication {rx.get('medication_name')} conflicts with patient's allergy: {allergy}"
                })

    med_names = [rx.get("medication_name", "").lower() for rx in prescriptions]
    if "warfarin" in med_names and "aspirin" in med_names:
        warnings.append({
            "type": "Drug Interaction",
            "severity": "High",
            "message": "Co-administration of Warfarin and Aspirin increases major bleeding risk."
        })

    is_safe = len(warnings) == 0
    return {
        "isSafe": is_safe,
        "safetyScore": 100 if is_safe else max(10, 100 - len(warnings) * 30),
        "warnings": warnings,
        "recommendations": ["No immediate safety issues identified."] if is_safe else ["Review prescription combinations with the attending physician."]
    }

def run_local_fraud_fallback(prescriptions: list) -> dict:
    anomalies = []
    prescribers = {p.get("prescriber") for p in prescriptions if p.get("prescriber")}
    physician_count = len(prescribers)
    count_map = {}

    for rx in prescriptions:
        med = rx.get("medication_name", "").lower()
        count_map[med] = count_map.get(med, 0) + 1

    duplicate_meds = [med for med, count in count_map.items() if count > 1]
    if duplicate_meds:
        for med in duplicate_meds:
            anomalies.append({
                "type": "Duplicate Prescriptions",
                "severity": "Medium",
                "description": f"Medication '{med}' was prescribed multiple times in the history."
            })

    if physician_count >= 3:
        anomalies.append({
            "type": "Doctor Shopping",
            "severity": "High",
            "description": f"Patient has prescriptions from {physician_count} different medical providers."
        })

    has_high = any(a["severity"] == "High" for a in anomalies)
    return {
        "fraudScore": 5 if not anomalies else min(95, len(anomalies) * 25),
        "anomalies": anomalies,
        "verdict": "Flagged" if has_high else ("Suspicious" if anomalies else "Clear")
    }

async def generate_history_report(medication: str, patient_name: str, allergies: list, prescriptions: list) -> dict:
    prompt = f"""
    Generate a clinical history report for patient {patient_name} regarding their prescription of {medication}.
    Patient Allergies: {json.dumps(allergies)}
    Prescription History for this drug: {json.dumps(prescriptions)}

    Identify the therapeutic purpose, check for any dosage escalations or safety conflicts with active allergies, and provide a clinical guideline check.
    Return ONLY a JSON object with this exact structure:
    {{
      "medication": "{medication}",
      "patientName": "{patient_name}",
      "therapeuticPurpose": "Description of what this drug is for",
      "allergyConflictStatus": "Clear" or "Conflict found (details)",
      "clinicalGuidelineCheck": "Summary of guideline recommendations for this class",
      "recommendations": [
        "Patient recommendation 1",
        "Patient recommendation 2"
      ]
    }}
    """
    res = await query_ollama(prompt)
    if res.get("is_fallback"):
        return run_local_history_fallback(medication, patient_name, allergies, prescriptions)
    return res

def run_local_history_fallback(medication: str, patient_name: str, allergies: list, prescriptions: list) -> dict:
    med_lower = medication.lower()
    purpose = "Therapeutic treatment for cardiorespiratory or metabolic recovery."
    if "lisinopril" in med_lower:
        purpose = "Angiotensin-Converting Enzyme (ACE) Inhibitor used to treat hypertension (high blood pressure) and protect renal function."
    elif "lipitor" in med_lower:
        purpose = "HMG-CoA Reductase Inhibitor (Statin) used to lower LDL cholesterol and mitigate cardiovascular event risk."
    elif "penicillin" in med_lower:
        purpose = "Beta-lactam antibiotic used to treat bacterial infections."
    elif "oxycodone" in med_lower:
        purpose = "Opioid analgesic indicated for the management of severe acute pain."

    has_allergy = any(a.lower() in med_lower or med_lower in a.lower() for a in allergies)
    allergy_status = f"CRITICAL: Patient has a recorded allergy to {allergies} conflicting with this drug class." if has_allergy else "Clear (No allergy conflicts detected)."

    guideline = f"Ensure regular blood work monitoring and patient compliance checks for {medication}."
    if "lisinopril" in med_lower:
        guideline = "Monitor serum potassium and renal function (eGFR/Creatinine) within 1-2 weeks of initiation or dose increases."
    elif "lipitor" in med_lower:
        guideline = "Monitor lipid panels periodically. Advise patient to report unexplained muscle pain or weakness (rhabdomyolysis risk)."
    elif "penicillin" in med_lower:
        guideline = "Advise patient to complete the full course of treatment to prevent antibiotic resistance. Monitor for hypersensitivity reactions."
    elif "oxycodone" in med_lower:
        guideline = "Use lowest effective dose for shortest duration. Monitor closely for respiratory depression, sedation, and opioid use disorder (OUD) signs."

    recs = [
        "Take medication strictly as directed by the prescriber.",
        "Report any unusual side effects or symptoms immediately."
    ]
    if "lisinopril" in med_lower:
        recs.append("Avoid excessive potassium intake or potassium supplements without physician approval.")
    elif "lipitor" in med_lower:
        recs.append("Limit grapefruit juice intake, which can increase systemic exposure of this statin.")

    return {
        "medication": medication,
        "patientName": patient_name,
        "therapeuticPurpose": purpose,
        "allergyConflictStatus": allergy_status,
        "clinicalGuidelineCheck": guideline,
        "recommendations": recs
    }
