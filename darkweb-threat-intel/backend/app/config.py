import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
NVD_API_KEY = os.getenv("NVD_API_KEY")