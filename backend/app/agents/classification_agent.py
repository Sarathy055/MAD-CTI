from typing import Dict, Any, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.agents.agent_interface import AgentInterface
from app.logger import get_logger

log = get_logger("ClassificationAgent")

THREAT_DEFINITIONS = {
    "Malware": "Malicious software designed to damage, disrupt, or gain unauthorized access to systems.",
    "Ransomware": "Malware that encrypts data and demands payment for decryption.",
    "Phishing": "Social engineering attacks using deceptive emails or messages to steal credentials.",
    "Vulnerability": "A security weakness in software or hardware that can be exploited.",
    "Zero-Day": "A vulnerability exploited before a patch is available.",
    "Data Breach": "Unauthorized exposure or theft of sensitive data.",
    "Supply Chain Attack": "Compromise of software or hardware through third-party vendors.",
    "APT / Nation-State Activity": "Advanced persistent threats linked to state-sponsored actors.",
    "Insider Threat": "Malicious or negligent actions by authorized users.",
    "Credential Compromise": "Unauthorized access due to stolen or leaked credentials.",
    "Dark Web Sale / Leak": "Sale or publication of stolen data on underground markets.",
    "Exploit Proof-of-Concept": "Demonstration code showing how a vulnerability can be exploited.",
    "Command-and-Control Activity": "Infrastructure used to control compromised systems.",
    "Reconnaissance / Scanning": "Scanning or probing systems to identify attack surfaces."
}

THREAT_TYPES = list(THREAT_DEFINITIONS.keys())
THREAT_TEXTS = list(THREAT_DEFINITIONS.values())


class ClassificationAgent(AgentInterface):

    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            max_features=5000
        )
        self.definition_vectors = self.vectorizer.fit_transform(THREAT_TEXTS)

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        threats = (
            input_data.get("translated_threats")
            or input_data.get("raw_threats")
            or []
        )

        if not threats:
            return input_data

        classified = []

        for threat in threats:
            text = self._build_text(threat)
            primary, confidence = self._classify(text)

            classified.append({
                "title": threat.get("title", "Threat Event"),
                "date": threat.get("date") or threat.get("published"),
                "source": threat.get("source", "CTI Feed"),
                "domain": threat.get("domain"),
                "ip": threat.get("ip"),
                "primary_threat_type": primary,
                "secondary_threat_types": [],
                "classification_confidence": confidence
            })

        input_data["classified_threats"] = classified
        return input_data

    def _classify(self, text: str) -> Tuple[str, float]:
        vec = self.vectorizer.transform([text])
        sims = cosine_similarity(vec, self.definition_vectors)[0]
        idx = sims.argmax()
        return THREAT_TYPES[idx], max(float(sims[idx]), 0.55)

    def _build_text(self, threat: Dict[str, Any]) -> str:
        return " ".join([
            threat.get("title", ""),
            threat.get("summary", ""),
            threat.get("description", ""),
            threat.get("content", "")
        ])
