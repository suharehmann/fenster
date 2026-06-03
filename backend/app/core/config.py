from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8')

    app_name: str = 'Fenster API'
    database_url: str = 'sqlite:///./fenster.db'
    allowed_origins: str = 'http://localhost:5173'
    admin_email: str = 'admin@fensterwerk.de'

    smtp_host: str = ''
    smtp_port: int = 587
    smtp_user: str = ''
    smtp_password: str = ''
    smtp_from: str = 'bot@fensterwerk.de'
    smtp_use_tls: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()
