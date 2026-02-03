from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.schemas import AnalyzeRequest, ExportRequest
from app.orchestrator import Orchestrator
import pandas as pd

app = FastAPI(title="CTI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = Orchestrator()

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    if not req.query:
        raise HTTPException(400, "Query required")
    return await orchestrator.run(req.dict())

@app.post("/export")
async def export(req: ExportRequest):
    if req.format == "csv":
        df = pd.DataFrame(req.threats)
        return df.to_csv(index=False)
    return req.threats
