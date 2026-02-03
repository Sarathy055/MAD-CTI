import json
import asyncio
from app.logger import get_logger
from app.providers.openai_client import call_openai
from app.providers.groq_client import call_groq


log = get_logger("LLM_ROUTER")

LLM_PROVIDERS = [
    ("OpenAI", call_openai),
    ("Groq", call_groq),
]
try:
    from app.config import GROQ_API_KEY
    if GROQ_API_KEY:
        LLM_PROVIDERS.append(("Groq", call_groq))
except Exception:
    pass
async def call_llm(system_prompt: str, input_data: dict) -> dict:
    last_error = None

    for name, provider in LLM_PROVIDERS:
        try:
            log.info(f"Trying LLM provider: {name}")
            result = await asyncio.wait_for(
                provider(system_prompt, input_data),
                timeout=20
            )
            log.info(f"LLM provider succeeded: {name}")
            return result

        except Exception as e:
            last_error = e
            log.warning(f"{name} failed: {str(e)}")

    log.error("All LLM providers failed")
    raise RuntimeError("ALL_LLM_PROVIDERS_FAILED") from last_error
