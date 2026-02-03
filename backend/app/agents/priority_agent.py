from app.agents.agent_interface import AgentInterface
from app.llm_router import call_llm


class PriorityAgent(AgentInterface):
    system_prompt = """
    Assign severity (Low/Medium/High/Critical) and confidence score (0-1).
    """

    async def execute(self, input_data: dict) -> dict:
        return await call_llm(self.system_prompt, input_data)
