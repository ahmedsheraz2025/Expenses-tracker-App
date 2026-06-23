from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from src.db.database import init_db, create_pool, close_pool
from src.api.routes import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_pool()
    await init_db()
    yield
    await close_pool()


app = FastAPI(title="Expenses Tracker", lifespan=lifespan)
app.include_router(router)

frontend_path = Path(__file__).resolve().parent.parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")
