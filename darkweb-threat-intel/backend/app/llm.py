import json
from openai import AsyncOpenAI
from app.config import OPENAI_API_KEY, OPENAI_MODEL
from app.logger import get_logger

log = get_logger("LLM")

client = AsyncOpenAI(api_key=OPENAI_API_KEY)

async def call_llm(system_prompt: str, input_data: dict) -> dict:
    try:
        response = await client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": json.dumps(input_data)}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )

        return json.loads(response.choices[0].message.content)

    except Exception as e:
        error_text = str(e)

        # Quota / rate-limit detection (SDK-safe)
        if "quota" in error_text.lower() or "rate limit" in error_text.lower():
            log.error("OpenAI quota exceeded – returning safe empty CTI payload")

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
                "note": "Live AI analysis unavailable (quota exceeded)"
            }

        log.error("LLM unexpected failure", exc_info=True)
        raise
