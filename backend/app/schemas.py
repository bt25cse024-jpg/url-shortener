from datetime import datetime
from pydantic import BaseModel


class LinkCreate(BaseModel):
  original_url: str


class LinkResponse(BaseModel):
  id: int
  short_code: str
  original_url: str
  created_at: datetime

  class Config:
    from_attributes = True