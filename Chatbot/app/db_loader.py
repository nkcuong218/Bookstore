from __future__ import annotations

from typing import Any, Dict, List, Optional
import mysql.connector

from .config import settings


def _get_conn():
    return mysql.connector.connect(
        host=settings.mysql_host,
        port=settings.mysql_port,
        database=settings.mysql_database,
        user=settings.mysql_user,
        password=settings.mysql_password,
    )


def fetch_books() -> List[Dict[str, Any]]:
    sql = """
        SELECT id, title, author, price, description, cover_url, stock
        FROM books
        ORDER BY id DESC
    """
    conn = _get_conn()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql)
        rows = cursor.fetchall()
        return rows
    finally:
        conn.close()


def fetch_orders(order_id: Optional[int], order_code: Optional[str], user_id: Optional[int]) -> List[Dict[str, Any]]:
    conn = _get_conn()
    try:
        cursor = conn.cursor(dictionary=True)

        if order_id is not None:
            cursor.execute(
                "SELECT id, order_code, status, total_amount, created_at FROM orders WHERE id = %s LIMIT 1",
                (order_id,),
            )
            rows = cursor.fetchall()
            if rows:
                return rows

        if order_code:
            cursor.execute(
                "SELECT id, order_code, status, total_amount, created_at FROM orders WHERE order_code = %s LIMIT 1",
                (order_code,),
            )
            rows = cursor.fetchall()
            if rows:
                return rows

        if user_id is not None:
            cursor.execute(
                """
                SELECT id, order_code, status, total_amount, created_at
                FROM orders
                WHERE user_id = %s
                ORDER BY created_at DESC
                LIMIT 5
                """,
                (user_id,),
            )
            return cursor.fetchall()

        return []
    finally:
        conn.close()
