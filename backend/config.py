from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://erp_user:erp_password@db:5432/erp_financiero"
    GCP_PROJECT_ID: str = "extended-creek-465314-n5"
    GCP_LOCATION: str = "eu"
    GCP_PROCESSOR_ID: str = "6013e3d8da1781b7"
    GCP_CREDENTIALS: Optional[str] = None
    SECRET_KEY: str = "your-super-secret-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 semana

    class Config:
        env_file = ".env"

settings = Settings()
