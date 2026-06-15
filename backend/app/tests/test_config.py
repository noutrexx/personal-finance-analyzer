import pytest
from pydantic import ValidationError

from app.config import Settings


def test_jwt_secret_is_required():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, jwt_secret_key=None)


def test_known_insecure_jwt_secret_is_rejected():
    with pytest.raises(ValidationError):
        Settings(_env_file=None, jwt_secret_key="change-me-in-production")


def test_strong_jwt_secret_is_accepted():
    settings = Settings(
        _env_file=None,
        jwt_secret_key="a-unique-test-secret-with-at-least-32-characters",
    )
    assert settings.jwt_secret_key.startswith("a-unique")
