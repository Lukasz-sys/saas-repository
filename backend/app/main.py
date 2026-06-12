from fastapi import FastAPI

from app.database.connection import engine, Base
from app.models.user import User
from app.models.job import Job
from app.api.auth import router as auth_router
from fastapi import FastAPI
from app.api.jobs import router as jobs_router

app = FastAPI(title="SaaS Platform API")

app.include_router(auth_router)
app.include_router(jobs_router)

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-check")
def db_check():
    return {"database": "connected"}