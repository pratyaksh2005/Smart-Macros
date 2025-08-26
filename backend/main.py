# Create Starter API with FastAPI
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Smart Macros API is running"}
