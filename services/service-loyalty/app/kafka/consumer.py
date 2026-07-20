import json
import asyncio
import logging
from aiokafka import AIOKafkaConsumer
from app.config import settings
from app.db.database import SessionLocal
from app.services import loyalty_service

logger = logging.getLogger(__name__)


class KafkaConsumer:
    def __init__(self):
        self.consumer = None
        self._task = None

    async def start(self):
        self.consumer = AIOKafkaConsumer(
            "order-events",
            "delivery-events",
            "user-events",
            bootstrap_servers=settings.kafka_bootstrap_servers,
            group_id=settings.kafka_group_id,
            auto_offset_reset="latest",
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        )
        await self.consumer.start()
        self._task = asyncio.create_task(self._consume())
        logger.info("Kafka consumer démarré")

    async def _consume(self):
        try:
            async for msg in self.consumer:
                await self._handle(msg.value)
        except Exception as e:
            logger.error(f"Erreur consumer Kafka : {e}")

    async def _handle(self, event: dict):
        event_type = event.get("eventType")
        db = SessionLocal()
        try:
            if event_type == "user.created":
                loyalty_service.get_or_create_account(db, event["userId"])

            elif event_type == "order.paid":
                amount = float(event.get("totalAmount", 0))
                loyalty_service.credit_points(
                    db, event["userId"], amount,
                    event["orderId"], "Points commande"
                )

            elif event_type == "order.cancelled":
                # Retirer les points si commande annulée
                loyalty_service.credit_points(
                    db, event["userId"], 0,
                    event["orderId"], "Annulation commande"
                )

            elif event_type == "delivery.delivered":
                # Bonus livraison
                loyalty_service.credit_points(
                    db, event["customerId"], 5,
                    event["deliveryId"], "Bonus livraison reçue"
                )

        except Exception as e:
            logger.error(f"Erreur traitement événement {event_type} : {e}")
        finally:
            db.close()

    async def stop(self):
        if self._task:
            self._task.cancel()
        if self.consumer:
            await self.consumer.stop()
