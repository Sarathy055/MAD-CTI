import json
import httpx
from app.config import GROQ_API_KEY

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

async def call_groq(system_prompt: str, input_data: dict) -> dict:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_NOT_CONFIGURED")

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {
                "role": "system",
                "content": (
                    system_prompt
                    + "\n\nReturn ONLY valid JSON. No markdown. No explanation."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(input_data),
            },
        ],
        "temperature": 0.2,
        "max_tokens": 1024
    }

    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            GROQ_API_URL,
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

        resp.raise_for_status()

        content = resp.json()["choices"][0]["message"]["content"]

        try:
            return json.loads(content)
        except json.JSONDecodeError:
            raise RuntimeError("GROQ_RETURNED_NON_JSON")
