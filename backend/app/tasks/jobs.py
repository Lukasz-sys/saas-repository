import time

from app.tasks.celery_app import celery_app
from app.database.connection import SessionLocal
from app.models.user import User
from app.models.job import Job

@celery_app.task(name="app.tasks.jobs.run_job")
def run_job(job_id: int):
    db = SessionLocal()

    try:
        job = db.query(Job).filter(Job.id == job_id).first()

        if not job:
            return

        job.status = "RUNNING"
        db.commit()

        time.sleep(10)

        job.status = "COMPLETED"
        job.result = f"Result for job {job_id}"
        db.commit()

    finally:
        db.close()