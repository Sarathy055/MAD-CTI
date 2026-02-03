from typing import Dict, Any
from app.agents.agent_interface import AgentInterface
from app.llm_router import call_llm
from app.logger import get_logger

log = get_logger("TranslationAgent")


class TranslationAgent(AgentInterface):
    """
    Optional AI-based translation & normalization agent.

    - Translates non-English threat text
    - Normalizes wording
    - NEVER invents new data
    - Skips cleanly if AI is unavailable
    """

    system_prompt = """
    You are a cyber threat intelligence translation and normalization agent.

    Input contains REAL threat data under `raw_threats`.

    Your tasks:
    - Translate non-English text to English if needed
    - Normalize wording for consistency
    - Preserve original meaning
    - DO NOT add new threats
    - DO NOT invent CVEs
    - DO NOT remove existing fields

    Output JSON ONLY with:
    {
      "translated_threats": [...]
    }
    """

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        raw_threats = input_data.get("raw_threats")

        # Nothing to translate
        if not raw_threats:
            return input_data

        try:
            result = await call_llm(
                self.system_prompt,
                {"raw_threats": raw_threats}
            )

            translated = result.get("translated_threats")
            if not translated:
                return input_data

            return {
                **input_data,
                "translated_threats": translated
            }

        except Exception as e:
            log.warning(f"Translation skipped (AI unavailable): {str(e)}")
            return input_data
