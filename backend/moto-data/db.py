import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def fetch_mileage(cur) -> int:
    cur.execute("SELECT km FROM moto_mileage ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    return row[0] if row else 8450


def fetch_maintenance_log(cur) -> list:
    cur.execute(
        "SELECT id, operation, done_km, done_date::text, note, created_at::text "
        "FROM moto_maintenance_log ORDER BY done_date DESC, id DESC"
    )
    return [
        {"id": r[0], "operation": r[1], "done_km": r[2], "done_date": r[3], "note": r[4], "created_at": r[5]}
        for r in cur.fetchall()
    ]


def insert_mileage(cur, km: int) -> None:
    cur.execute("INSERT INTO moto_mileage (km) VALUES (%s)", (km,))


def insert_maintenance_log(cur, operation: str, done_km: int, done_date: str, note: str) -> int:
    cur.execute(
        "INSERT INTO moto_maintenance_log (operation, done_km, done_date, note) "
        "VALUES (%s, %s, %s, %s) RETURNING id",
        (operation, done_km, done_date, note),
    )
    return cur.fetchone()[0]
