import uuid
from datetime import datetime

from sqlalchemy import JSON, Column, DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class OrderEvent(Base):
    """Événements de commande dénormalisés pour analytics (Event Sourcing)."""
    __tablename__ = "analytics_order_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False, index=True)
    order_id = Column(String(100), index=True)
    user_id = Column(String(100), index=True)
    restaurant_id = Column(String(100), index=True)
    total_amount = Column(Float)
    order_type = Column(String(50))
    raw_payload = Column(JSON)
    event_time = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)


class ReservationEvent(Base):
    __tablename__ = "analytics_reservation_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(100), nullable=False)
    reservation_id = Column(String(100))
    restaurant_id = Column(String(100), index=True)
    guests_count = Column(Integer)
    raw_payload = Column(JSON)
    event_time = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)


class DailyKpi(Base):
    """KPI agrégés quotidiennement par restaurant."""
    __tablename__ = "daily_kpis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(String(100), nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    total_revenue = Column(Float, default=0)
    orders_count = Column(Integer, default=0)
    avg_basket = Column(Float, default=0)
    reservations_count = Column(Integer, default=0)
    occupancy_rate = Column(Float, default=0)
