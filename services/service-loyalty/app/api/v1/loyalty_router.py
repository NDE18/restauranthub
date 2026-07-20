from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.db.models import LoyaltyAccount, Reward
from app.services import loyalty_service

router = APIRouter(tags=["Loyalty"])


class RedeemRequest(BaseModel):
    rewardId: str


class ReferralRequest(BaseModel):
    code: str


@router.get("/me")
def get_my_account(user_id: str, db: Session = Depends(get_db)):
    """Solde et palier du compte fidélité."""
    account = loyalty_service.get_or_create_account(db, user_id)
    return {
        "userId": str(account.user_id),
        "pointsBalance": account.points_balance,
        "totalPointsEarned": account.total_points_earned,
        "tier": account.tier,
        "referralCode": account.referral_code,
    }


@router.get("/me/transactions")
def get_transactions(user_id: str, db: Session = Depends(get_db)):
    """Historique des points."""
    transactions = loyalty_service.get_transactions(db, user_id)
    return [
        {
            "id": str(t.id),
            "type": t.type,
            "points": t.points,
            "description": t.description,
            "referenceId": t.reference_id,
            "createdAt": t.created_at.isoformat(),
        }
        for t in transactions
    ]


@router.get("/rewards")
def get_rewards(db: Session = Depends(get_db)):
    """Récompenses disponibles."""
    rewards = db.query(Reward).filter_by(is_active=True).all()
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "description": r.description,
            "pointsCost": r.points_cost,
            "minTier": r.min_tier,
        }
        for r in rewards
    ]


@router.post("/redeem")
def redeem(request: RedeemRequest, user_id: str, db: Session = Depends(get_db)):
    """Échanger des points contre une récompense."""
    try:
        result = loyalty_service.redeem_reward(db, user_id, request.rewardId)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/referral")
def generate_referral(user_id: str, db: Session = Depends(get_db)):
    """Récupérer le code de parrainage."""
    account = loyalty_service.get_or_create_account(db, user_id)
    return {"referralCode": account.referral_code}


@router.post("/referral/apply")
def apply_referral(request: ReferralRequest, user_id: str, db: Session = Depends(get_db)):
    """Appliquer un code de parrainage."""
    referrer = db.query(LoyaltyAccount).filter_by(referral_code=request.code).first()
    if not referrer:
        raise HTTPException(status_code=404, detail="Code de parrainage invalide")
    if str(referrer.user_id) == user_id:
        raise HTTPException(status_code=400, detail="Auto-parrainage interdit")

    # Créditer le parrain et le filleul
    loyalty_service.credit_points(db, str(referrer.user_id), 50, user_id, "Parrainage")
    loyalty_service.credit_points(db, user_id, 20, request.code, "Bonus parrainage")
    return {"message": "Code appliqué avec succès"}
