from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/analytics_db"
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_group_id: str = "service-analytics-group"

    class Config:
        env_file = ".env"


settings = Settings()
