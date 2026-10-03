from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from .database import Base

class Link(Base):
    __tablename__ = 'links'  # Actual name of the table in Postgres

    id = Column(Integer, primary_key=True, index=True) # Primary key, auto-incrementing
    short_code = Column(String(50), unique=True, index=True, nullable=False) # e.g., 'abc1', unique + fast lookup index
    original_url = Column(String(2048), nullable=False) # e.g., 'https://github.com'
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Magic SQLAlchemy shortcut: allows python code like my_link.clicks to list all related clicks
    clicks = relationship("Click", back_populates="link")


class Click(Base):
    __tablename__ = 'clicks' # Actual name of the table in Postgres

    id = Column(Integer, primary_key=True, index=True)
    link_id = Column(Integer, ForeignKey('links.id'), nullable=False) # Points to links.id (Foreign Key)
    clicked_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    referrer = Column(String(500), nullable=True) # e.g., 'https://twitter.com'
    country = Column(String(100), nullable=True)  # e.g., 'IN'

    # Reverse link shortcut: my_click.link gives you the parent Link object
    link = relationship("Link", back_populates="clicks")