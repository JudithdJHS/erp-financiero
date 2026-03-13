from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://erp_user:erp_password@db:5432/erp_financiero"
    GCP_PROJECT_ID: str = ""
    GCP_LOCATION: str = "us"
    GCP_PROCESSOR_ID: str = ""
    SECRET_KEY: str = "your-super-secret-key-change-in-prod"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 semana

    class Config:
        env_file = ".env"

settings = Settings()
