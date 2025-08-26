import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
from dotenv import load_dotenv

load_dotenv()  # reads .env in /backend
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

app = FastAPI()

# Allow your Vite dev origin to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TokenIn(BaseModel):
    id_token: str

@app.get("/")
def root():
    return {"ok": True, "service": "Smart Macros API"}

@app.post("/auth/google")
def auth_google(payload: TokenIn):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Server misconfigured: missing GOOGLE_CLIENT_ID")
    try:
        info = id_token.verify_oauth2_token(
            payload.id_token, grequests.Request(), GOOGLE_CLIENT_ID
        )
        # TODO: upsert user in DB and mint your own session JWT
        return {
            "ok": True,
            "sub": info["sub"],
            "email": info.get("email"),
            "name": info.get("name"),
            "picture": info.get("picture"),
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Google ID token")