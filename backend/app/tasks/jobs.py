import time
from unittest import result


from app.tasks.celery_app import celery_app
from app.database.connection import SessionLocal
from app.models.user import User
from app.models.job import Job
from app.engines.engine_1 import run_engine

@celery_app.task(name="app.tasks.jobs.run_job")
def run_job(job_id: int):
    db = SessionLocal()

    try:
        job = db.query(Job).filter(Job.id == job_id).first()

        if not job:
            return

        job.status = "RUNNING"
        db.commit()

        result = run_engine(job_id)

        job.result = result
        job.status = "COMPLETED"

        db.commit()

    finally:
        db.close()