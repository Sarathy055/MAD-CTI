import joblib

MODEL_DIR = "app/models/"

try:
    model = joblib.load(MODEL_DIR + "prediction_model.pkl")
    threat_encoder = joblib.load(MODEL_DIR + "threat_encoder.pkl")
    severity_encoder = joblib.load(MODEL_DIR + "severity_encoder.pkl")
    MODEL_READY = True
except Exception:
    MODEL_READY = False


def predict_gap_days(threat_type, severity, fallback_days):
    if not MODEL_READY:
        return fallback_days

    try:
        X = [[
            threat_encoder.transform([threat_type])[0],
            severity_encoder.transform([severity])[0]
        ]]
        return max(7, int(model.predict(X)[0]))
    except Exception:
        return fallback_days
