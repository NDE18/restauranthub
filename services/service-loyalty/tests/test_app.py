from app.config import settings


def test_settings_loaded():
    assert settings is not None
    assert settings.points_per_euro > 0
