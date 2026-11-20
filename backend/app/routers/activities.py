import io
import os
import time
from datetime import date
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from PIL import Image
from pydantic import BaseModel
from sqlmodel import Session, func, select
from supabase import Client, create_client
from typing import Union
from app.security import verify_admin

from app.database import get_session
from app.models import Activity, ActivityImage

router = APIRouter(prefix="/api/activities", tags=["Activities & Gallery"])

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY"),
)

BUCKET_NAME = os.getenv("SUPABASE_BUCKET", "ngo-gram-aarogya-ghati-gallery")
MAX_STORAGE_BYTES = 800 * 1024 * 1024  # 800 MB safe cap on 1 GB free tier


# Response schemas so Next.js receives activities bundled with their images
class ImageRead(BaseModel):
    id: int
    public_url: str
    size_bytes: int


class ActivityRead(BaseModel):
    id: int
    headline: str
    description: str
    location: str
    event_date: date
    images: list[ImageRead] = []


def compress_image_to_webp(raw_bytes: bytes) -> bytes:
    """Resize large photos to max 1600px width and convert to lightweight WebP."""
    img = Image.open(io.BytesIO(raw_bytes))
    if img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.thumbnail((1600, 1600))
    output = io.BytesIO()
    img.save(output, format="WEBP", quality=82, optimize=True)
    return output.getvalue()


def ensure_storage_space(session: Session, incoming_bytes: int):
    """Delete oldest images from Supabase Storage & DB if total size exceeds 800 MB."""
    total_used = session.exec(
        select(func.coalesce(func.sum(ActivityImage.size_bytes), 0))
    ).one()

    if total_used + incoming_bytes <= MAX_STORAGE_BYTES:
        return

    oldest_images = session.exec(
        select(ActivityImage).order_by(ActivityImage.uploaded_at.asc())
    ).all()

    for old_img in oldest_images:
        if total_used + incoming_bytes <= MAX_STORAGE_BYTES:
            break
        supabase.storage.from_(BUCKET_NAME).remove([old_img.storage_path])
        total_used -= old_img.size_bytes
        session.delete(old_img)

    session.commit()


@router.get("/", response_model=list[ActivityRead])
def list_activities(session: Session = Depends(get_session)):
    activities = session.exec(
        select(Activity).order_by(Activity.event_date.desc())
    ).all()
    return activities


@router.post("/", response_model=ActivityRead)
async def create_activity(
    headline: str = Form(...),
    description: str = Form(...),
    event_date: date = Form(...),
    location: str = Form("Kurkheda, Gadchiroli"),
    files: list[UploadFile] = File(None),
    session: Session = Depends(get_session),
    _admin: str = Depends(verify_admin)
):
    valid_files = [f for f in (files or []) if f.filename]

    if len(valid_files) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 images allowed per activity.")

    processed_images: list[tuple[str, bytes]] = []
    for file in valid_files:
        if not file.content_type or not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail=f"{file.filename} is not a valid image.")
        raw_bytes = await file.read()
        webp_bytes = compress_image_to_webp(raw_bytes)
        safe_base = os.path.splitext(file.filename)[0].replace(" ", "_")
        storage_path = f"activities/{int(time.time())}_{safe_base}.webp"
        processed_images.append((storage_path, webp_bytes))

    # Free up oldest photos if adding these images exceeds 800 MB
    total_incoming = sum(len(data) for _, data in processed_images)
    if total_incoming > 0:
        ensure_storage_space(session, total_incoming)

    # 1. Save the Activity record
    activity = Activity(
        headline=headline,
        description=description,
        location=location,
        event_date=event_date,
    )
    session.add(activity)
    session.commit()
    session.refresh(activity)

    # 2. Upload images to Supabase and link them to the Activity
    for storage_path, webp_bytes in processed_images:
        supabase.storage.from_(BUCKET_NAME).upload(
            path=storage_path,
            file=webp_bytes,
            file_options={"content-type": "image/webp"},
        )
        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(storage_path)

        img_record = ActivityImage(
            activity_id=activity.id,
            storage_path=storage_path,
            public_url=public_url,
            size_bytes=len(webp_bytes),
        )
        session.add(img_record)

    session.commit()
    session.refresh(activity)
    return activity


@router.delete("/{activity_id}")
def delete_activity(activity_id: int, session: Session = Depends(get_session), _admin: str = Depends(verify_admin)):
    activity = session.get(Activity, activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found.")

    # Clean up all attached images from Supabase Storage first
    paths = [img.storage_path for img in activity.images]
    if paths:
        supabase.storage.from_(BUCKET_NAME).remove(paths)

    session.delete(activity)
    session.commit()
    return {"deleted": True, "id": activity_id}
