from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, relationship
from datetime import datetime
import uuid
import enum


class Base(DeclarativeBase):
    pass


class LoyaltyTier(str, enum.Enum):
    BRONZE = "BRONZE"
    SILVER = "SILVER"
    GOLD = "GOLD"
    PLATINUM = "PLATINUM"


class TransactionType(str, enum.Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"
    EXPIRY = "EXPIRY"


class LoyaltyAccount(Base):
    __tablename__ = "loyalty_accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)
    points_balance = Column(Integer, nullable=False, default=0)
    total_points_earned = Column(Integer, nullable=False, default=0)
    tier = Column(Enum(LoyaltyTier), nullable=False, default=LoyaltyTier.BRONZE)
    referral_code = Column(String(20), unique=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = relationship("PointTransaction", back_populates="account")


class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("loyalty_accounts.id"), nullable=False, index=True)
    type = Column(Enum(TransactionType), nullable=False)
    points = Column(Integer, nullable=False)
    description = Column(String(255))
    reference_id = Column(String(100))  # order_id, reservation_id, etc.
    expires_at = Column(DateTime)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    account = relationship("LoyaltyAccount", back_populates="transactions")


class Reward(Base):
    __tablename__ = "rewards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(String(500))
    points_cost = Column(Integer, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    stock = Column(Integer)  # None = illimité
    min_tier = Column(Enum(LoyaltyTier), default=LoyaltyTier.BRONZE)
