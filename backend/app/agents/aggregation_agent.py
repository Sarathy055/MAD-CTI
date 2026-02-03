from typing import Dict, Any, List
from collections import Counter
from datetime import datetime

from app.agents.agent_interface import AgentInterface
from app.logger import get_logger

log = get_logger("AggregationAgent")


class AggregationAgent(AgentInterface):
    """
    FINAL MAD-CTI AGGREGATION AGENT
    - Consumes classified_threats
    - Consumes future_threats
    - Produces UI-ready CTI output
    """

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:

        classified = input_data.get("classified_threats", [])
        future = input_data.get("future_threats", [])

        if not classified:
            log.warning("No classified threats found")
            return input_data

        past = [
            self._normalize_classified_threat(t, idx)
            for idx, t in enumerate(classified)
        ]

        future_norm = [
            {
                "id": f"future-{i}",
                "title": f"Predicted {t['threat_type']} activity",
                "threat_type": t["threat_type"],
                "severity": t["severity"],
                "source": "AI Prediction",
                "date": t["predicted_date"],
                "confidence": t["confidence"],
                "predicted": True
            }
            for i, t in enumerate(future)
        ]

        all_threats = past + future_norm
        all_threats.sort(key=lambda x: x["date"])

        stats = self._compute_stats(past)

        return {
            "stats": {
                "total_threats": stats["total"],
                "critical": stats["by_severity"].get("Critical", 0),
                "high": stats["by_severity"].get("High", 0),
                "medium": stats["by_severity"].get("Medium", 0),
                "low": stats["by_severity"].get("Low", 0),
            },
            "risk_distribution": [
                {"label": k, "value": v}
                for k, v in stats["by_severity"].items()
            ],
            "threat_types": [
                {"type": k, "count": v}
                for k, v in Counter(t["threat_type"] for t in past).items()
            ],
            "timeline": [
                {
                    "date": t["date"][:10],
                    "event": t["title"],
                    "severity": t["severity"],
                    "predicted": t["predicted"]
                }
                for t in all_threats
            ],
            "threats": all_threats
        }

    # --------------------------------------------------

    def _normalize_classified_threat(self, t: Dict[str, Any], idx: int) -> Dict[str, Any]:
        return {
            "id": f"threat-{idx}",
            "title": t.get("title", "Threat Event"),
            "threat_type": t["primary_threat_type"],
            "severity": self._severity_from_type(t["primary_threat_type"]),
            "source": t.get("source", "CTI Feed"),
            "date": t.get("date") or datetime.utcnow().isoformat(),
            "confidence": t.get("classification_confidence", 0.6),
            "predicted": False
        }

    def _severity_from_type(self, threat_type: str) -> str:
        mapping = {
            "Ransomware": "Critical",
            "APT / Nation-State Activity": "Critical",
            "Supply Chain Attack": "Critical",
            "Credential Compromise": "High",
            "Command-and-Control Activity": "High",
            "Dark Web Sale / Leak": "High",
            "Zero-Day": "High",
            "Malware": "Medium",
            "Phishing": "Medium",
            "Vulnerability": "Medium",
            "Exploit Proof-of-Concept": "Medium",
            "Reconnaissance / Scanning": "Low"
        }
        return mapping.get(threat_type, "Medium")

    def _compute_stats(self, threats: List[Dict[str, Any]]) -> Dict[str, Any]:
        counts = Counter(t["severity"] for t in threats)
        return {
            "total": len(threats),
            "by_severity": dict(counts)
        }
