# Health-OS

A sovereign, end-to-end encrypted health ledger that integrates real-time AI clinical safety checks with signature-verified access control.

---

## Features Summary

### AI
- **Clinical Safety Auditing**: Cross-references patient prescriptions with known allergies and flags drug-drug interactions using a local LLM (Ollama `llama3.2:3b`) or fallback clinical engine.
- **Anomalous Refill & Fraud Detection**: Inspects prescription histories for abuse patterns, doctor-shopping (multiple prescribing entities), and overlapping intervals.

### Blockchain & Cryptography
- **Patient Private-Key Vault Decryption**: Patient data is client-side encrypted using public keys. Viewing clear-text records requires entering the patient's private key (`VORTEXA_PRIV_ALICE_67890`) to decrypt them in the browser.
- **Signature-Verified Consent**: Consent approvals are signed on the client side using SHA-256 digital signatures before being committed to the ledger database.
- **Access Control Ledger**: The backend verifies active provider consent against the ledger before releasing prescription records, returning a 403 Forbidden state if unauthorized.
- **Audit Trails**: Real-time logging of decryptions, consent changes, and access queries is recorded in an immutable event database.

---

## In-Depth Feature Architecture

### 1. Client-Side Cryptography & Vault Decryption
To ensure true patient data sovereignty, data is not stored in plaintext on server databases:
- **Encryption**: When a provider issues a prescription, the client-side system binds the text with the patient's public key (e.g., `VORTEXA_PUB_ALICE_12345`), base64-scrambles the payload, and prefixes it with `VORTEXA_ENC:`.
- **Decryption**: On the patient dashboard, locked records are rendered with blur filters and ciphertext tags. Entering the corresponding private key (`VORTEXA_PRIV_ALICE_67890`) triggers local decryption in browser memory, revealing the medication, dosage, and prescriber without revealing keys to the server.

### 2. Signature-Verified Consent Engine
Enforces decentralized zero-trust permissions instead of centralized server-managed roles:
- **Handshake Verification**: When a provider requests access, a pending consent request is logged.
- **Digital Signatures**: When the patient grants consent, the browser Web Crypto API signs the request:
- **Access Checks**: The backend check verifies that the requester's name has an approved consent signature. If unauthorized or missing, the API throws an HTTP `403 Forbidden` response and renders a lock warning screen on the client.

### 3. AI Clinical Safety Agent
Continuous clinical pharmacist check running automatically during profile queries:
- **LLM Pipeline**: The backend queries a local Ollama server running `llama3.2:3b` with a structured system prompt combining patient allergies (Postgres `patients.allergies`) and active prescriptions.
- **Clinical Fallback**: If Ollama is offline, the backend executes deterministic checks mapping known allergen substrings (e.g. penicillin) to active records, and flags high-risk drug-drug interactions (e.g., co-administration of `Warfarin` and `Aspirin`).

### 4. Explainable AI (XAI) Fraud Detector
Prevents insurance scams, opioid shop violations, and drug diversion:
- **Pattern Matching**: The backend checks dosage frequencies and timestamps.
- **Explainable AI (XAI)**: Returns threat ratings alongside specific explanation factors (e.g. *"Doctor Shopping: Patient has active prescriptions from 3 or more separate medical providers"*).
- **Client Mitigation**: The frontend captures flagged threat statuses, adjusts grid priorities, and displays critical alert actions ("Decline & Report" or "This was me").

### 5. Immutable Event Auditing
Immutable compliance logs tracking all operations:
- Every registration, consent update, and decryption attempt inserts a record into the database table `access_logs`.
- The frontend terminal pulls logs from this endpoint in 10-second intervals to render compliance events categorized by role (`SYSTEM`, `PATIENT`, `PROVIDER`, or `AUDITOR`).

---

## User Roles

### 1. Patient
- Controls access consent for all external healthcare entities.
- Decrypts their private health ledger locally using their private key.
- Views clinical alerts and logs.

### 2. Provider (e.g. City General Hospital, CVS Pharmacy)
- Issues new encrypted prescriptions to the patient's ledger.
- Requests access consent to view the patient's medical history.
- Restrained by a lock screen if the patient has not signed an active approval.

### 3. Auditor
- Conducts automated compliance and clinical safety reviews.
- Inspects real-time cryptographic audit logs for verification checkouts.

---

## How it Works (Consent Flow)
1. **Request**: A provider (e.g., `CVS Pharmacy`) requests access to the patient's vault.
2. **Authorize**: The patient views the request in the Consent tab, clicks **Authorize**, and signs it. This generates a signature stored in the database.
3. **Decryption**: The provider's console now clears the 403 authorization check and displays the decrypted medical profile.

---

## Running Commands (macOS Quickstart)

### 1. Database Setup
Ensure PostgreSQL is running locally, then initialize the database and schema:
```bash
# Start PostgreSQL (Homebrew)
brew services start postgresql@14

# Run database setup script
cd health-os-backend
python3 setup_db.py
cd ..
```

### 2. Run Backend (FastAPI)
Launch the API server on port `8080`:
```bash
cd health-os-backend
python3 -m venv env
source env/bin/activate
uvicorn main:app --reload --port 8080
```

### 3. Run Frontend (Vite + React)
Start the frontend development server:
```bash
cd health-os-frontend
npm install
npm run dev
```
Open `http://localhost:5173` to access the application.
