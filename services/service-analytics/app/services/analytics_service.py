from datetime import datetime, timedelta

import pandas as pd
from sqlalchemy.orm import Session

from app.db.models import OrderEvent


def get_dashboard(db: Session, restaurant_id: str, period: str) -> dict:
    """KPI consolidés pour un établissement et une période."""
    days = {"day": 1, "week": 7, "month": 30}.get(period, 30)
    since = datetime.utcnow() - timedelta(days=days)

    events = db.query(OrderEvent).filter(
        OrderEvent.restaurant_id == restaurant_id,
        OrderEvent.event_type == "order.paid",
        OrderEvent.event_time >= since,
    ).all()

    if not events:
        return {
            "restaurantId": restaurant_id,
            "period": period,
            "totalRevenue": 0,
            "ordersCount": 0,
            "avgBasket": 0,
        }

    df = pd.DataFrame([{
        "total_amount": e.total_amount or 0,
        "event_time": e.event_time,
    } for e in events])

    total_revenue = df["total_amount"].sum()
    orders_count = len(df)
    avg_basket = df["total_amount"].mean() if orders_count > 0 else 0

    return {
        "restaurantId": restaurant_id,
        "period": period,
        "totalRevenue": round(total_revenue, 2),
        "ordersCount": orders_count,
        "avgBasket": round(avg_basket, 2),
        "revenueByDay": _revenue_by_day(df),
    }


def get_sales_analysis(db: Session, restaurant_id: str) -> dict:
    """Analyse des ventes des 30 derniers jours."""
    since = datetime.utcnow() - timedelta(days=30)
    events = db.query(OrderEvent).filter(
        OrderEvent.restaurant_id == restaurant_id,
        OrderEvent.event_type == "order.paid",
        OrderEvent.event_time >= since,
    ).all()

    if not events:
        return {"restaurantId": restaurant_id, "sales": []}

    df = pd.DataFrame(
        [{"amount": e.total_amount or 0, "type": e.order_type} for e in events],
    )
    by_type = df.groupby("type")["amount"].agg(["count", "sum"]).reset_index()

    return {
        "restaurantId": restaurant_id,
        "byOrderType": by_type.to_dict(orient="records"),
        "total": {"count": len(events), "revenue": df["amount"].sum()},
    }


def get_recommendations(db: Session, user_id: str) -> list:
    """Recommandations basées sur l'historique (collaborative filtering)."""
    # Placeholder — en production : sklearn CollaborativeFilter
    return [
        {"itemId": "item_001", "name": "Burger Artisanal", "score": 0.92},
        {"itemId": "item_047", "name": "Salade César", "score": 0.87},
        {"itemId": "item_023", "name": "Tiramisu Maison", "score": 0.84},
    ]


def _revenue_by_day(df: pd.DataFrame) -> list:
    df["date"] = pd.to_datetime(df["event_time"]).dt.date
    by_day = df.groupby("date")["total_amount"].sum().reset_index()
    return [{"date": str(r["date"]), "revenue": round(r["total_amount"], 2)}
            for _, r in by_day.iterrows()]
