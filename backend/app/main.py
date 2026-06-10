from fastapi import FastAPI
from app.database.connection import engine, Base
from app.models.user import User

app = FastAPI(title="SaaS Platform API")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-check")
def db_check():
    return {"database": "connected"}