import json
import asyncio
import logging
from aiokafka import AIOKafkaConsumer
from app.config import settings
from app.db.database import SessionLocal
from app.db.models import OrderEvent, ReservationEvent

logger = logging.getLogger(__name__)

ALL_TOPICS = [
    "order-events",
    "reservation-events",
    "payment-events",
    "delivery-events",
    "loyalty-events",
    "user-events",
    "restaurant-events",
    "menu-events",
]


class AnalyticsKafkaConsumer:
    def __init__(self):
        self.consumer = None
        self._task = None

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            *ALL_TOPICS,
            bootstrap_servers=settings.kafka_bootstrap_servers,
            group_id=settings.kafka_group_id,
            auto_offset_reset="latest",
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        )
        await self.consumer.start()
        self._task = asyncio.create_task(self._consume())
        logger.info("Analytics Kafka consumer démarré")

    async def _consume(self):
        try:
            async for msg in self.consumer:
                await self._handle(msg.value)
        except Exception as e:
            logger.error(f"Erreur consumer analytics : {e}")

    async def _handle(self, event: dict):
        event_type = event.get("eventType", "")
        db = SessionLocal()
        try:
            if event_type.startswith("order."):
                db.add(OrderEvent(
                    event_type=event_type,
                    order_id=event.get("orderId"),
                    user_id=event.get("userId"),
                    restaurant_id=event.get("restaurantId"),
                    total_amount=event.get("totalAmount"),
                    order_type=event.get("type"),
                    raw_payload=event,
                ))
                db.commit()

            elif event_type.startswith("reservation."):
                db.add(ReservationEvent(
                    event_type=event_type,
                    reservation_id=event.get("reservationId"),
                    restaurant_id=event.get("restaurantId"),
                    guests_count=event.get("guests"),
                    raw_payload=event,
                ))
                db.commit()

        except Exception as e:
            db.rollback()
            logger.error(f"Erreur stockage événement analytics : {e}")
        finally:
            db.close()

    async def stop(self):
        if self._task:
            self._task.cancel()
        if self.consumer:
            await self.consumer.stop()
