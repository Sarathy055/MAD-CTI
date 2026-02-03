from app.agents.agent_interface import AgentInterface
from app.llm_router import call_llm


class ThreatAnalysisAgent(AgentInterface):
    system_prompt = """
    Analyze attack context, targets, and implications.
    """

    async def execute(self, input_data: dict) -> dict:
        return await call_llm(self.system_prompt, input_data)
