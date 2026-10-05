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


class LinkStatsResponse(BaseModel):
  short_code: str
  original_url: str
  total_clicks: int
  clicks_per_day: list[dict[str, object]]

  class Config:
    from_attributes = True


class RecentLinkItem(BaseModel):
  short_code: str
  original_url: str
  created_at: datetime
  total_clicks: int

  class Config:
    from_attributes = True