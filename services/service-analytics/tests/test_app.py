from app.config import settings


def test_settings_loaded():
    assert settings is not None
    assert settings.kafka_group_id == "service-analytics-group"
