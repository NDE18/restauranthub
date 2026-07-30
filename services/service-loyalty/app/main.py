from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import loyalty_router
from app.db.database import Base  # noqa: F401 — init des tables
from app.kafka.consumer import KafkaConsumer

kafka_consumer = KafkaConsumer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage
    await kafka_consumer.start()
    yield
    # Arrêt
    await kafka_consumer.stop()


app = FastAPI(
    title="service-loyalty",
    description="Programme de fidélité — points, paliers, récompenses",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(loyalty_router.router, prefix="/api/v1/loyalty")


@app.get("/actuator/health")
def health():
    return {"status": "UP"}
