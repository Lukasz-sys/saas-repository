from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.job import Job
from app.models.user import User
from app.schemas.job import JobCreate
from app.core.auth import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from app.tasks.jobs import run_job

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/")
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_job = Job(
    user_id=current_user.id,
    engine_type=job.engine_type,
    input_data=job.input_data,
    status="PENDING"
)

    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    run_job.delay(new_job.id)

    return new_job

@router.get("/")
def get_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    jobs = (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .all()
    )

    return jobs

@router.get("/{job_id}")
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user.id
        )
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job
