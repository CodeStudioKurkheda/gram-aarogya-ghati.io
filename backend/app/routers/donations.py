import os
import razorpay
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from app.database import get_session
from app.models import Donation
from app.security import verify_admin

load_dotenv()

router = APIRouter(prefix="/api/donations", tags=["Donations (Razorpay)"])

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

rzp_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class CreateOrderRequest(BaseModel):
    donor_name: str
    donor_phone: str = Field(min_length=10, max_length=15)
    donor_email: str | None = None
    amount_inr: int = Field(gt=0, description="Minimum ₹1")
    pan_number: str | None = None

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


@router.post("/create-order")
def create_donation_order(body: CreateOrderRequest, session: Session = Depends(get_session)):
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=500, detail="Razorpay keys not configured on server.")

    # Razorpay expects amount in paise (₹1 = 100 paise)
    rzp_order = rzp_client.order.create({
        "amount": body.amount_inr * 100,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {
            "donor_name": body.donor_name,
            "donor_phone": body.donor_phone,
            "pan": body.pan_number or "N/A",
        },
    })

    donation = Donation(
        donor_name=body.donor_name,
        donor_phone=body.donor_phone,
        donor_email=body.donor_email or None,
        amount_inr=body.amount_inr,
        pan_number=body.pan_number.upper() if body.pan_number else None,
        payment_reference=rzp_order["id"],
        status="pending",
    )
    
    session.add(donation)
    session.commit()

    return {
        "order_id": rzp_order["id"],
        "amount_paise": rzp_order["amount"],
        "currency": "INR",
        "key_id": RAZORPAY_KEY_ID,
    }


@router.post("/verify")
def verify_donation_payment(body: VerifyPaymentRequest, session: Session = Depends(get_session)):
    try:
        rzp_client.utility.verify_payment_signature({
            "razorpay_order_id": body.razorpay_order_id,
            "razorpay_payment_id": body.razorpay_payment_id,
            "razorpay_signature": body.razorpay_signature,
        })
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid payment signature.")

    donation = session.exec(
        select(Donation).where(Donation.payment_reference == body.razorpay_order_id)
    ).first()

    if not donation:
        raise HTTPException(status_code=404, detail="Donation order not found.")

    donation.status = "paid"
    donation.payment_reference = body.razorpay_payment_id
    session.add(donation)
    session.commit()

    return {"verified": True, "payment_id": body.razorpay_payment_id}


@router.get("/", response_model=list[Donation])
def list_donations(
    session: Session = Depends(get_session),
    _admin: str = Depends(verify_admin),
):
    return session.exec(select(Donation).order_by(Donation.created_at.desc())).all()
