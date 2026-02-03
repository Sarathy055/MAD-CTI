import json
from typing import List, Dict


SEVERITY_MAP = {
    "LOW": "Low",
    "MEDIUM": "Medium",
    "HIGH": "High",
    "CRITICAL": "High"
}


def parse_nvd_file(path: str) -> List[Dict]:
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    events = []

    for item in data.get("CVE_Items", []):
        cve = item.get("cve", {})
        impact = item.get("impact", {})
        published = item.get("publishedDate")

        if not published:
            continue

        severity = "Medium"

        try:
            cvss = impact["baseMetricV3"]["cvssV3"]["baseSeverity"]
            severity = SEVERITY_MAP.get(cvss, "Medium")
        except Exception:
            pass

        events.append({
            "date": published[:10],
            "threat_type": "Vulnerability Exploitation",
            "severity": severity,
            "source": "NVD",
            "confidence": 0.9
        })

    return events
