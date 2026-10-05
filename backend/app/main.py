from fastapi import BackgroundTasks, Depends, FastAPI, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from .cache import get_link, set_link
from .database import Base, SessionLocal, engine, get_db
from .models import Click, Link
from .schemas import LinkCreate, LinkResponse, LinkStatsResponse
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


def record_click(link_id: int):
    db = SessionLocal()
    try:
        click = Click(link_id=link_id)
        db.add(click)
        db.commit()
    finally:
        db.close()


@app.get("/stats/{short_code}", response_model=LinkStatsResponse)
def get_link_stats(short_code: str, db: Session = Depends(get_db)):
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(status_code=404, detail="Short code not found")

    total_clicks = db.query(Click).filter(Click.link_id == link.id).count()
    daily_clicks = (
        db.query(
            func.date(Click.clicked_at).label("date"),
            func.count(Click.id).label("clicks"),
        )
        .filter(Click.link_id == link.id)
        .group_by(func.date(Click.clicked_at))
        .order_by(func.date(Click.clicked_at).desc())
        .all()
    )

    return {
        "short_code": link.short_code,
        "original_url": link.original_url,
        "total_clicks": total_clicks,
        "clicks_per_day": [
            {"date": row.date.isoformat(), "clicks": row.clicks} for row in daily_clicks
        ],
    }


@app.get("/{short_code}")
def redirect_to_url(
    short_code: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    cached_link = get_link(short_code)
    if cached_link is None:
        link = db.query(Link).filter(Link.short_code == short_code).first()
        if not link:
            raise HTTPException(status_code=404, detail="Short code not found")

        link_id = link.id
        original_url = link.original_url
        set_link(short_code, link_id, original_url)
    else:
        link_id, original_url = cached_link

    background_tasks.add_task(record_click, link_id)
    return RedirectResponse(url=original_url, status_code=307)