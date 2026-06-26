import os
from dotenv import load_dotenv

load_dotenv()

STEAM_API_KEY = os.getenv("STEAM_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
