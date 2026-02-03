from abc import ABC, abstractmethod
from typing import Dict, Any


class AgentInterface(ABC):
    """
    Strict contract for all MAD-CTI agents
    """

    system_prompt: str | None = None

    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        pass
