import random
import string
from sqlalchemy.orm import Session
from app.db.models import LoyaltyAccount, PointTransaction, TransactionType, LoyaltyTier, Reward
from app.config import settings


TIER_THRESHOLDS = {
    LoyaltyTier.BRONZE: 0,
    LoyaltyTier.SILVER: 1000,
    LoyaltyTier.GOLD: 5000,
    LoyaltyTier.PLATINUM: 15000,
}


def get_or_create_account(db: Session, user_id: str) -> LoyaltyAccount:
    account = db.query(LoyaltyAccount).filter_by(user_id=user_id).first()
    if not account:
        account = LoyaltyAccount(
            user_id=user_id,
            referral_code=_generate_referral_code(),
        )
        db.add(account)
        db.commit()
        db.refresh(account)
    return account


def credit_points(db: Session, user_id: str, amount: float, reference_id: str, description: str) -> dict:
    account = get_or_create_account(db, user_id)
    points = int(amount * settings.points_per_euro)

    transaction = PointTransaction(
        account_id=account.id,
        type=TransactionType.CREDIT,
        points=points,
        description=description,
        reference_id=reference_id,
    )
    db.add(transaction)

    account.points_balance += points
    account.total_points_earned += points

    # Vérification montée en palier
    old_tier = account.tier
    new_tier = _compute_tier(account.total_points_earned)
    tier_upgraded = new_tier != old_tier
    if tier_upgraded:
        account.tier = new_tier

    db.commit()
    return {"pointsCredited": points, "newBalance": account.points_balance, "tierUpgraded": tier_upgraded, "newTier": account.tier}


def redeem_reward(db: Session, user_id: str, reward_id: str) -> dict:
    account = get_or_create_account(db, user_id)
    reward = db.query(Reward).filter_by(id=reward_id, is_active=True).first()

    if not reward:
        raise ValueError("Récompense introuvable")
    if account.points_balance < reward.points_cost:
        raise ValueError("Points insuffisants")
    if reward.stock is not None and reward.stock <= 0:
        raise ValueError("Récompense épuisée")

    account.points_balance -= reward.points_cost

    transaction = PointTransaction(
        account_id=account.id,
        type=TransactionType.DEBIT,
        points=-reward.points_cost,
        description=f"Échange : {reward.name}",
        reference_id=str(reward_id),
    )
    db.add(transaction)

    if reward.stock is not None:
        reward.stock -= 1

    db.commit()
    return {"rewardName": reward.name, "pointsUsed": reward.points_cost, "newBalance": account.points_balance}


def get_transactions(db: Session, user_id: str) -> list:
    account = get_or_create_account(db, user_id)
    return db.query(PointTransaction).filter_by(account_id=account.id).order_by(
        PointTransaction.created_at.desc()
    ).limit(50).all()


def _compute_tier(total_points: int) -> LoyaltyTier:
    if total_points >= TIER_THRESHOLDS[LoyaltyTier.PLATINUM]:
        return LoyaltyTier.PLATINUM
    elif total_points >= TIER_THRESHOLDS[LoyaltyTier.GOLD]:
        return LoyaltyTier.GOLD
    elif total_points >= TIER_THRESHOLDS[LoyaltyTier.SILVER]:
        return LoyaltyTier.SILVER
    return LoyaltyTier.BRONZE


def _generate_referral_code() -> str:
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
