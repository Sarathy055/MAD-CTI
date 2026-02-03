from pydantic import BaseModel
from typing import List

class AnalyzeRequest(BaseModel):
    query: str
    time_range: str

class ExportRequest(BaseModel):
    format: str
    threats: List[dict]
