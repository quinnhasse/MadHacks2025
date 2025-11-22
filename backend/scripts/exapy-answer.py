from exa_py import Exa
from dotenv import load_dotenv
import os

load_dotenv()

exa = Exa(api_key=os.getenv("EXA_API_KEY"))
exa.answer("What's the TCP structure?")
