from typing import Dict, Any, List
from collections import Counter
from datetime import datetime, timedelta

from app.agents.agent_interface import AgentInterface
from app.ml.predictor import predict_gap_days


class PredictionAgent(AgentInterface):
    """
    MAD-CTI Hybrid Prediction Agent

    - Uses historical classified threats (org-specific)
    - Uses globally trained ML model (CERT-EU + NVD)
    - Anchors prediction to current date
    - Ensures future-only, month/year-level predictions
    """

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        classified = input_data.get("classified_threats", [])

        # ------------------------------------
        # No data → no prediction
        # ------------------------------------
        if not classified:
            input_data["future_threats"] = []
            return input_data

        # ------------------------------------
        # Dominant threat type
        # ------------------------------------
        type_counter = Counter(
            t.get("primary_threat_type") for t in classified
            if t.get("primary_threat_type")
        )
        dominant, count = type_counter.most_common(1)[0]

        # Base probability (existing logic)
        probability = min(0.95, 0.35 + 0.1 * count)

        # ------------------------------------
        # Extract historical dates
        # ------------------------------------
        dates: List[datetime] = []
        for t in classified:
            date_str = t.get("date")
            if not date_str:
                continue
            try:
                dates.append(datetime.fromisoformat(date_str[:19]))
            except Exception:
                continue

        if not dates:
            input_data["future_threats"] = []
            return input_data

        dates.sort()
        last_seen = dates[-1]

        # ------------------------------------
        # Deterministic average gap (local)
        # ------------------------------------
        if len(dates) >= 2:
            gaps = [
                (dates[i] - dates[i - 1]).days
                for i in range(1, len(dates))
                if (dates[i] - dates[i - 1]).days > 0
            ]
            avg_gap_days = sum(gaps) // len(gaps) if gaps else 30
        else:
            avg_gap_days = 30

        # ------------------------------------
        # ML refinement (global knowledge)
        # ------------------------------------
        avg_gap_days = predict_gap_days(
            dominant,
            "High" if probability > 0.7 else "Medium",
            avg_gap_days
        )

        # ------------------------------------
        # CURRENT DATE ANCHOR (KEY FIX)
        # ------------------------------------
        now = datetime.utcnow()

        # Anchor to the most recent of last_seen or now
        anchor_date = last_seen if last_seen > now else now

        predicted_date = anchor_date + timedelta(days=avg_gap_days)

        # ------------------------------------
        # Enforce CTI future horizon
        # ------------------------------------
        min_future = now + timedelta(days=30)      # ≥ 1 month
        max_future = now + timedelta(days=365)     # ≤ 1 year

        if predicted_date < min_future:
            predicted_date = min_future

        if predicted_date > max_future:
            predicted_date = max_future

        # ------------------------------------
        # Final output (timeline-safe)
        # ------------------------------------
        input_data["future_threats"] = [{
            "threat_type": dominant,
            "severity": "High" if probability > 0.7 else "Medium",
            "confidence": round(probability, 2),
            "predicted_date": predicted_date.isoformat(),
            "prediction_basis": {
                "anchor": "current_date",
                "average_gap_days": avg_gap_days,
                "historical_events": len(dates),
                "model": "Global CERT-EU + NVD trained regression"
            }
        }]

        return input_data
