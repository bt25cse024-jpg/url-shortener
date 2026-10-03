from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Where the Postgres filing cabinet lives (user:pass@host:port/database_name)
DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/urlshortener"

# 2. Creates the actual network pipeline/bridge to PostgreSQL
engine = create_engine(DATABASE_URL)

# 3. A factory that generates temporary "visitor badges" (sessions) when requests arrive
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. The parent blueprint: any Python class inheriting from 'Base' becomes a DB table
Base = declarative_base()

# 5. FastAPI dependency: hands out a DB session per request, then safely revokes it
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()