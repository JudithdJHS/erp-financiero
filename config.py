from pydantic_settings import BaseSettings
class Settings(BaseSettings):
          DATABASE_URL: str = ""
          GCP_PROJECT_ID: str = ""
          GCP_LOCATION: str = "us"
          GCP_PROCESSOR_ID: str = ""
          SECRET_KEY: str = "9261aa73-00e0-4899-a451-0713ad90a8b9"
          ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
          class Config: env_file = ".env"
    settings = Settings()
