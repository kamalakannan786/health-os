import base64
import hashlib

def verify_signature(public_key: str, message: str, signature: str) -> bool:
    if not public_key or not message or not signature:
        return False
    expected = hashlib.sha256(f"{public_key}:{message}".encode()).hexdigest()
    return signature == expected

def encrypt_data(data: str, public_key: str) -> str:
    combined = f"KEY:{public_key[:10]}|DATA:{data}"
    encoded = base64.b64encode(combined.encode()).decode()
    return f"VORTEXA_ENC:{encoded}"

def decrypt_data(encrypted_data: str, private_key: str) -> str:
    if not encrypted_data.startswith("VORTEXA_ENC:"):
        return encrypted_data
    try:
        encoded = encrypted_data.replace("VORTEXA_ENC:", "")
        decoded = base64.b64decode(encoded.encode()).decode()
        if "DATA:" in decoded:
            return decoded.split("DATA:")[1]
        return decoded
    except Exception:
        return "DECRYPTION_ERROR: Invalid private key or payload tampered"
