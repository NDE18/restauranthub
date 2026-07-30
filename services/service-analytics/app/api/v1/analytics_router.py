from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.services import analytics_service

router = APIRouter(tags=["Analytics"])


@router.get("/dashboard")
def get_dashboard(
    restaurantId: str = Query(...),
    period: str = Query("month", regex="^(day|week|month)$"),
    db: Session = Depends(get_db),
):
    """KPI consolidés : CA, panier moyen, commandes."""
    return analytics_service.get_dashboard(db, restaurantId, period)


@router.get("/sales")
def get_sales(restaurantId: str = Query(...), db: Session = Depends(get_db)):
    """Analyse des ventes par type de commande."""
    return analytics_service.get_sales_analysis(db, restaurantId)


@router.get("/customers")
def get_customers(restaurantId: str = Query(...), db: Session = Depends(get_db)):
    """Segmentation des clients."""
    return {"restaurantId": restaurantId, "segments": []}


@router.get("/recommendations/{userId}")
def get_recommendations(userId: str, db: Session = Depends(get_db)):
    """Plats recommandés pour un utilisateur."""
    return analytics_service.get_recommendations(db, userId)


@router.post("/reports/export")
def export_report(restaurantId: str, format: str = "pdf"):
    """Export des rapports format PDF ou Excel."""
    return {"message": f"Export {format} lancé pour {restaurantId}", "status": "queued"}
