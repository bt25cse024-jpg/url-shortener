from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import Click, Link
from .schemas import LinkCreate, LinkResponse
from .utils import base62_encode

# Ensure tables exist on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(title="URL Shortener API")


@app.post("/shorten", response_model=LinkResponse, status_code=201)
def create_short_link(payload: LinkCreate, db: Session = Depends(get_db)):
    # 1. Insert row first to generate auto-incrementing primary key ID
    db_link = Link(original_url=payload.original_url, short_code="TEMP")
    db.add(db_link)
    db.commit()
    db.refresh(db_link)

    # 2. Derive unique short_code via Base62 from DB ID
    db_link.short_code = base62_encode(db_link.id)
    db.commit()
    db.refresh(db_link)

    return db_link 


@app.get("/{short_code}")
def redirect_to_url(short_code: str, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Short code not found")

    # Record click event in the analytics diary
    click = Click(link_id=link.id)
    db.add(click)
    db.commit()

    return RedirectResponse(url=link.original_url, status_code=307)