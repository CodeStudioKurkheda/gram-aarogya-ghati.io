from contextlib import asynccontextmanager
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables
from app import models
from app.routers import activities, admin, donations, ngo_content

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Gram Aarogya Ghati API", lifespan=lifespan)

frontend_origins = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activities.router)
app.include_router(admin.router)
app.include_router(ngo_content.router)
app.include_router(donations.router)

@app.get("/")
def health_check():
    return {"status": "running", "ngo": "Gram Aarogya Ghati"}
