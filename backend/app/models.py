from datetime import date, datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    headline: str
    description: str
    location: str = "Kurkheda, Gadchiroli"
    event_date: date
    created_at: datetime = Field(default_factory=utc_now)

    images: list["ActivityImage"] = Relationship(
        back_populates="activity",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

class ActivityImage(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    activity_id: int = Field(foreign_key="activity.id")
    storage_path: str
    public_url: str
    size_bytes: int
    uploaded_at: datetime = Field(default_factory=utc_now)

    activity: Optional[Activity] = Relationship(back_populates="images")

class Program(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    focus_area: str
    summary: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=utc_now)

class ImpactStat(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    label: str
    value: str
    display_order: int = 0

class Volunteer(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    full_name: str
    phone: str
    email: Optional[str] = None
    village_or_city: str
    skills_or_interest: str
    consent_at: datetime = Field(default_factory=utc_now)
    status: str = "new"  # "new" or "contacted"
    created_at: datetime = Field(default_factory=utc_now)

class Donation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    donor_name: str
    donor_phone: str
    donor_email: Optional[str] = None
    amount_inr: int
    pan_number: Optional[str] = None
    payment_reference: Optional[str] = None
    status: str = "pending"
    created_at: datetime = Field(default_factory=utc_now)