import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
OLLAMA_BASE_URL= os.getenv("OLLAMA_BASE_URL")
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)
