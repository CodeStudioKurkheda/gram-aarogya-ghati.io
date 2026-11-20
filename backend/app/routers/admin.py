import os
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, func, select

from app.database import get_session
from app.models import Activity, ActivityImage, Donation, Program, Volunteer
from app.security import create_admin_token, verify_admin

router = APIRouter(prefix="/api/admin", tags=["Admin & Dashboard"])

MAX_STORAGE_BYTES = 800 * 1024 * 1024  # 800 MB safe cap

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
def admin_login(body: LoginRequest):
    expected_user = os.getenv("ADMIN_USERNAME", "admin")
    expected_pass = os.getenv("ADMIN_PASSWORD")
    if not expected_pass or body.username != expected_user or body.password != expected_pass:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password.")
    return {"access_token": create_admin_token(body.username), "token_type": "bearer"}

@router.get("/summary")
def dashboard_summary(
    session: Session = Depends(get_session),
    _admin: str = Depends(verify_admin),
):
    total_activities = session.exec(select(func.count(Activity.id))).one()
    total_programs = session.exec(select(func.count(Program.id))).one()
    total_volunteers = session.exec(select(func.count(Volunteer.id))).one()
    total_donations_inr = session.exec(
        select(func.coalesce(func.sum(Donation.amount_inr), 0)).where(Donation.status == "paid")
    ).one()
    used_bytes = session.exec(
        select(func.coalesce(func.sum(ActivityImage.size_bytes), 0))
    ).one()

    return {
        "counts": {
            "activities": total_activities,
            "programs": total_programs,
            "volunteers": total_volunteers,
            "donations_inr": total_donations_inr,
        },
        "storage": {
            "used_mb": round(used_bytes / (1024 * 1024), 2),
            "max_mb": round(MAX_STORAGE_BYTES / (1024 * 1024), 2),
            "percent_used": round((used_bytes / MAX_STORAGE_BYTES) * 100, 1),
        },
    }

@router.get("/volunteers", response_model=list[Volunteer])
def list_volunteers(
    session: Session = Depends(get_session),
    _admin: str = Depends(verify_admin),
):
    return session.exec(select(Volunteer).order_by(Volunteer.created_at.desc())).all()
