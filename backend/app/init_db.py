from app.database import Base, engine
from app.models import Click, Link


def init_db():
  print('Creating database tables...')
  Base.metadata.create_all(bind=engine)
  print('Tables created successfully!')


if __name__ == '__main__':
  init_db()