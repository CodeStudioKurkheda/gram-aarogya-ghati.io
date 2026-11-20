from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import ImpactStat, Program, Volunteer
from app.security import verify_admin
from pydantic import BaseModel

router = APIRouter(prefix="/api/content", tags=["NGO Content & Volunteers"])

class VolunteerCreate(BaseModel):
    full_name: str
    phone: str
    email: str | None = None
    village_or_city: str
    skills_or_interest: str
    consent: bool
    honeypot: str = ""  # Hidden anti-spam trap

# --- Public Endpoints (No Login Required) ---
@router.get("/programs", response_model=list[Program])
def get_programs(session: Session = Depends(get_session)):
    return session.exec(select(Program).where(Program.is_active == True)).all()

@router.get("/impact", response_model=list[ImpactStat])
def get_impact_stats(session: Session = Depends(get_session)):
    return session.exec(select(ImpactStat).order_by(ImpactStat.display_order.asc())).all()

@router.post("/volunteers", response_model=Volunteer)
def submit_volunteer(payload: VolunteerCreate, session: Session = Depends(get_session)):
    if payload.honeypot:
        raise HTTPException(status_code=400, detail="Invalid submission.")
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Consent is required to submit.")

    volunteer = Volunteer(
        full_name=payload.full_name,
        phone=payload.phone,
        email=payload.email or None,
        village_or_city=payload.village_or_city,
        skills_or_interest=payload.skills_or_interest,
    )
    session.add(volunteer)
    session.commit()
    session.refresh(volunteer)
    return volunteer

# --- Admin-Only Endpoints (JWT Required) ---
@router.delete("/volunteers/{volunteer_id}")
def delete_volunteer(
    volunteer_id: int,
    session: Session = Depends(get_session),
    _admin: str = Depends(verify_admin),
):
    vol = session.get(Volunteer, volunteer_id)
    if not vol:
        raise HTTPException(status_code=404, detail="Volunteer not found.")
    session.delete(vol)
    session.commit()
    return {"deleted": True, "id": volunteer_id}

@router.post("/programs", response_model=Program)
def add_program(
    program: Program,
    session: Session = Depends(get_session),
    _admin: str = Depends(verify_admin),
):
    session.add(program)
    session.commit()
    session.refresh(program)
    return program

@router.post("/impact", response_model=ImpactStat)
def add_or_update_impact(
    stat: ImpactStat,
    session: Session = Depends(get_session),
    _admin: str = Depends(verify_admin),
):
    if stat.id:
        existing = session.get(ImpactStat, stat.id)
        if not existing:
            raise HTTPException(status_code=404, detail="Impact stat not found.")
        existing.label = stat.label
        existing.value = stat.value
        existing.display_order = stat.display_order
        session.add(existing)
        session.commit()
        session.refresh(existing)
        return existing

    session.add(stat)
    session.commit()
    session.refresh(stat)
    return stat
