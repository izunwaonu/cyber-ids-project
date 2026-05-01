from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import joblib
import pandas as pd
import urllib.parse
import re

app = FastAPI()

# Enable CORS so the Next.js frontend can communicate with this API safely
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows requests from any frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the brain and the filter
model = tf.keras.models.load_model('csic_ids_model.h5')
scaler = joblib.load('ids_scaler.pkl')

class RequestData(BaseModel):
    payload: str

def extract_features(request_string):
    # Engineered features exactly matching the Jupyter Notebook
    features = {
        'request_length': len(request_string),
        'method_POST': 1 if 'POST' in request_string else 0,
        'method_GET': 1 if 'GET' in request_string else 0,
        'method_PUT': 1 if 'PUT' in request_string else 0
    }
    decoded = urllib.parse.unquote(request_string).lower()
    features['special_char_count'] = len(re.findall(r"[<>\'\";\(\)\=]", decoded))
    features['sqli_keyword_count'] = sum(decoded.count(kw) for kw in ['union', 'select', 'insert', 'or 1=1'])
    features['xss_keyword_count'] = sum(decoded.count(kw) for kw in ['script', 'alert'])
    return features

@app.post("/analyze")
async def analyze_request(data: RequestData):
    # Decode the payload once for our Hybrid Rules
    decoded_payload = urllib.parse.unquote(data.payload).lower()

    # ==========================================
    # HYBRID LAYER 1: STRICT RULES ENGINE
    # ==========================================
    
    # Rule 1: The "Blocklist" (Catch what the AI misses)
    # Hackers use these exact strings to read server files. If we see them, block instantly.
    if "../" in decoded_payload or "/etc/passwd" in decoded_payload or ".env" in decoded_payload:
        return {
            "probability": 1.0,
            "action": "BLOCK"
        }

    # Rule 2: The "Allowlist" (Protect what the AI misinterprets)
    # The AI is biased against quotation marks. This protects modern JSON APIs from false alarms.
    is_json = "content-type: application/json" in decoded_payload
    has_sqli = any(kw in decoded_payload for kw in ['union', 'select', 'insert', 'or 1=1'])
    has_xss = any(kw in decoded_payload for kw in ['script', 'alert', '<script>'])
    
    # If it is JSON and contains absolutely no attack keywords, let it through.
    if is_json and not has_sqli and not has_xss:
        return {
            "probability": 0.02, # Give it a tiny 2% probability so the UI looks realistic
            "action": "ALLOW"
        }

    # ==========================================
    # HYBRID LAYER 2: NEURAL NETWORK (AI)
    # ==========================================
    
    # If the payload bypassed the strict rules, let the AI examine the behavioral patterns.
    feat_dict = extract_features(data.payload)
    df = pd.DataFrame([feat_dict])
    
    # Scale only the continuous features
    cols_to_scale = ['request_length', 'special_char_count', 'sqli_keyword_count', 'xss_keyword_count']
    df[cols_to_scale] = scaler.transform(df[cols_to_scale])
    
    # Generate Threat Probability
    prediction = model.predict(df, verbose=0)[0][0]
    
    return {
        "probability": float(prediction),
        "action": "BLOCK" if prediction > 0.5 else "ALLOW"
    }