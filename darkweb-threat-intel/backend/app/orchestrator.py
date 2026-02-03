from app.agents.scraper_agent import ScraperAgent
from app.agents.translation_agent import TranslationAgent
from app.agents.classification_agent import ClassificationAgent
from app.agents.priority_agent import PriorityAgent
from app.agents.analysis_agent import ThreatAnalysisAgent
from app.agents.prediction_agent import PredictionAgent
from app.agents.aggregation_agent import AggregationAgent
from app.logger import get_logger

log = get_logger("Orchestrator")


class Orchestrator:
    """
    Executes the CTI multi-agent pipeline.
    If AI providers are unavailable, returns an empty but frontend-safe response.
    No synthetic or fabricated intelligence is generated.
    """

    def __init__(self):
        self.agents = [
            ScraperAgent(),
            TranslationAgent(),
            ClassificationAgent(),
            PriorityAgent(),
            ThreatAnalysisAgent(),
            PredictionAgent(),
            AggregationAgent(),
        ]

    async def run(self, payload: dict) -> dict:
        data = payload

        for agent in self.agents:
            agent_name = agent.__class__.__name__
            log.info(f"Running {agent_name}")

            try:
                data = await agent.execute(data)

            except RuntimeError as e:
                error_text = str(e)

                # AI unavailable / quota exceeded / all providers failed
                if (
                    "AI_QUOTA_EXCEEDED" in error_text
                    or "ALL_LLM_PROVIDERS_FAILED" in error_text
                ):
                    log.warning(
                        f"{agent_name} skipped due to AI unavailability; continuing pipeline"
                    )
                continue

                raise

        return data

    @staticmethod
    def _empty_cti_response() -> dict:
        """
        Frontend-safe empty response.
        This contains NO fabricated threats or intelligence.
        """
        return {
            "stats": {
                "total_threats": 0,
                "critical": 0,
                "high": 0,
                "medium": 0,
                "low": 0
            },
            "risk_distribution": [],
            "threat_types": [],
            "timeline": [],
            "threats": [],
            "note": "No intelligence available (AI providers unavailable or quota exceeded)"
        }
