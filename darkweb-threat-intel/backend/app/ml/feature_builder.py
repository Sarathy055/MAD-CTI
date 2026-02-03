from datetime import datetime


def build_features(events):
    events = sorted(events, key=lambda x: x["date"])
    rows = []
    prev_date_by_type = {}


    for e in events:
        try:
            d = datetime.fromisoformat(e["date"])
        except Exception:
            continue

        from datetime import datetime
from typing import List, Dict, Any


def build_features(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Build training features from global CTI events.

    - Computes time gaps PER threat type
    - Avoids same-day collisions
    - Produces sufficient samples for training
    - Works with CERT-EU + NVD merged data
    """

    # Sort by date globally
    events = sorted(events, key=lambda x: x.get("date", ""))

    rows: List[Dict[str, Any]] = []

    # Track last seen date per threat type
    last_seen_by_type: Dict[str, datetime] = {}

    for event in events:
        date_str = event.get("date")
        threat_type = event.get("threat_type")
        severity = event.get("severity", "Medium")

        if not date_str or not threat_type:
            continue

        try:
            current_date = datetime.fromisoformat(date_str)
        except ValueError:
            continue

        # Compute gap PER threat type
        if threat_type in last_seen_by_type:
            prev_date = last_seen_by_type[threat_type]
            gap_days = (current_date - prev_date).days

            if gap_days > 0:
                rows.append({
                    "threat_type": threat_type,
                    "severity": severity,
                    "gap_days": gap_days
                })

        # Update last seen
        last_seen_by_type[threat_type] = current_date

    return rows

