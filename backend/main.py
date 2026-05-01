from fastapi import FastAPI
from pydantic import BaseModel
import tensorflow as tf
import joblib
import pandas as pd
import urllib.parse
import re

app = FastAPI() # <--- THIS IS THE EXACT LINE RENDER IS LOOKING FOR

# Load the brain and the filter
model = tf.keras.models.load_model('csic_ids_model.h5')
scaler = joblib.load('ids_scaler.pkl')

class RequestData(BaseModel):
    payload: str

def extract_features(request_string):
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
    feat_dict = extract_features(data.payload)
    df = pd.DataFrame([feat_dict])
    
    cols_to_scale = ['request_length', 'special_char_count', 'sqli_keyword_count', 'xss_keyword_count']
    df[cols_to_scale] = scaler.transform(df[cols_to_scale])
    
    prediction = model.predict(df)[0][0]
    return {
        "probability": float(prediction),
        "action": "BLOCK" if prediction > 0.5 else "ALLOW"
    }