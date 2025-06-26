from fastapi import FastAPI
from app.routes import generate  # 👈 import your generate.py router
from dotenv import load_dotenv
import os
load_dotenv()

app = FastAPI()

# Include your generate router
app.include_router(generate.router)

@app.get("/")
def read_root():
    return {"message": "Hello World"}
