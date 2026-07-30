from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import analytics_router
from app.kafka.consumer import AnalyticsKafkaConsumer

kafka_consumer = AnalyticsKafkaConsumer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await kafka_consumer.start()
    yield
    await kafka_consumer.stop()


app = FastAPI(
    title="service-analytics",
    description="KPI, statistiques, recommandations IA et rapports",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analytics_router.router, prefix="/api/v1/analytics")


@app.get("/actuator/health")
def health():
    return {"status": "UP"}
