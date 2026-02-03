import json
import os
import joblib
import pandas as pd
from pathlib import Path
from sklearn.preprocessing import LabelEncoder
from sklearn.linear_model import LinearRegression

from app.ml.feature_builder import build_features
from app.ml.nvd_parser import parse_nvd_file


CERT_EU_PATH = "data/processed/global_threat_events.json"
NVD_DIR = Path("data/nvd")
MODEL_DIR = "app/models/"

# ✅ ENSURE OUTPUT DIRECTORY EXISTS
os.makedirs(MODEL_DIR, exist_ok=True)


def load_cert_eu():
    with open(CERT_EU_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def load_nvd():
    events = []
    for file in NVD_DIR.glob("nvdcve-*.json"):
        events.extend(parse_nvd_file(str(file)))
    return events


def train_global_model():
    cert_events = load_cert_eu()
    nvd_events = load_nvd()

    all_events = cert_events + nvd_events

    rows = build_features(all_events)
    if len(rows) < 5:
        raise ValueError("Not enough data to train")

    df = pd.DataFrame(rows)

    threat_encoder = LabelEncoder()
    severity_encoder = LabelEncoder()

    df["threat_type"] = threat_encoder.fit_transform(df["threat_type"])
    df["severity"] = severity_encoder.fit_transform(df["severity"])

    X = df[["threat_type", "severity"]]
    y = df["gap_days"]

    model = LinearRegression()
    model.fit(X, y)

    # ✅ SAVE MODELS
    joblib.dump(model, os.path.join(MODEL_DIR, "prediction_model.pkl"))
    joblib.dump(threat_encoder, os.path.join(MODEL_DIR, "threat_encoder.pkl"))
    joblib.dump(severity_encoder, os.path.join(MODEL_DIR, "severity_encoder.pkl"))

    print("✅ Global model trained using CERT-EU + NVD data")


if __name__ == "__main__":
    train_global_model()
