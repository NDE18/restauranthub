from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5437/loyalty_db"
    redis_url: str = "redis://:redis_secret@localhost:6379/0"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_group_id: str = "service-loyalty-group"
    keycloak_issuer_uri: str = "http://localhost:8080/realms/restaurant"

    # Règles de fidélité (configurables)
    points_per_euro: float = 10.0
    points_expiry_days: int = 365

    class Config:
        env_file = ".env"


settings = Settings()
