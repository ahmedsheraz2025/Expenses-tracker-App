from contextlib import asynccontextmanager

import aiomysql
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str = "root"
    db_password: str = "root123"
    db_name: str = "expenses_tracker"

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )


settings = Settings()
pool: aiomysql.Pool | None = None


async def create_pool() -> None:
    global pool
    pool = await aiomysql.create_pool(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        db=settings.db_name,
        minsize=1,
        maxsize=5,
        autocommit=False,
        pool_recycle=3600,
        cursorclass=aiomysql.cursors.DictCursor,
    )


async def close_pool() -> None:
    global pool
    if pool:
        pool.close()
        await pool.wait_closed()
        pool = None


@asynccontextmanager
async def get_connection():
    if pool is None:
        raise RuntimeError("Database pool not initialized. Call create_pool() first.")
    conn = await pool.acquire()
    try:
        yield conn
    finally:
        pool.release(conn)


async def init_db() -> None:
    async with get_connection() as conn:
        async with conn.cursor() as cursor:
            await cursor.execute("""
                CREATE TABLE IF NOT EXISTS expenses (
                    id VARCHAR(36) PRIMARY KEY,
                    description VARCHAR(200) NOT NULL,
                    amount_cents INT NOT NULL,
                    created_at VARCHAR(40) NOT NULL,
                    INDEX idx_expenses_created_at (created_at)
                )
            """)
            await cursor.execute("""
                CREATE TABLE IF NOT EXISTS settings (
                    `key` VARCHAR(100) PRIMARY KEY,
                    `value` TEXT NOT NULL
                )
            """)
        await conn.commit()
