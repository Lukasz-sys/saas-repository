from app.tasks.celery_app import celery_app

from app.database.connection import SessionLocal

from app.models.user import User
from app.models.job import Job

from app.engines.engine_1 import run_engine as run_engine_1
from app.engines.engine_2 import run_engine as run_engine_2


@celery_app.task(name="app.tasks.jobs.run_job")
def run_job(job_id: int):

    db = SessionLocal()

    try:
        job = db.query(Job).filter(Job.id == job_id).first()

        if not job:
            return

        job.status = "RUNNING"
        db.commit()

        if job.engine_type == "engine_1":
            result = run_engine_1(job.input_data)

        elif job.engine_type == "engine_2":
            result = run_engine_2(job.input_data)

        else:
            job.status = "FAILED"
            job.result = "Unknown engine type"
            db.commit()
            return

        job.result = result
        job.status = "COMPLETED"

        db.commit()

    except Exception as e:

        job = db.query(Job).filter(Job.id == job_id).first()

        if job:
            job.status = "FAILED"
            job.result = str(e)
            db.commit()

    finally:
        db.close()