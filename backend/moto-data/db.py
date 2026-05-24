import os
import psycopg2


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


# ─── Mileage ──────────────────────────────────────────────────────────────────

def fetch_mileage(cur) -> int:
    cur.execute("SELECT km FROM moto_mileage ORDER BY id DESC LIMIT 1")
    row = cur.fetchone()
    return row[0] if row else 8450


def insert_mileage(cur, km: int) -> None:
    cur.execute("INSERT INTO moto_mileage (km) VALUES (%s)", (km,))


# ─── Maintenance log ──────────────────────────────────────────────────────────

def fetch_maintenance_log(cur) -> list:
    cur.execute(
        "SELECT id, operation, done_km, done_date::text, note, created_at::text "
        "FROM moto_maintenance_log ORDER BY done_date DESC, id DESC"
    )
    return [
        {"id": r[0], "operation": r[1], "done_km": r[2], "done_date": r[3], "note": r[4], "created_at": r[5]}
        for r in cur.fetchall()
    ]


def insert_maintenance_log(cur, operation: str, done_km: int, done_date: str, note: str) -> int:
    cur.execute(
        "INSERT INTO moto_maintenance_log (operation, done_km, done_date, note) "
        "VALUES (%s, %s, %s, %s) RETURNING id",
        (operation, done_km, done_date, note),
    )
    return cur.fetchone()[0]


# ─── Profiles ─────────────────────────────────────────────────────────────────

def _row_to_profile(r) -> dict:
    return {
        "id": r[0], "name": r[1], "brand": r[2], "model": r[3],
        "year": r[4], "engine_cc": r[5], "color": r[6], "vin": r[7],
        "purchase_date": r[8], "purchase_km": r[9], "current_km": r[10],
        "notes": r[11], "is_active": r[12], "created_at": r[13],
    }


def fetch_profiles(cur) -> list:
    cur.execute(
        "SELECT id, name, brand, model, year, engine_cc, color, vin, "
        "purchase_date::text, purchase_km, current_km, notes, is_active, created_at::text "
        "FROM moto_profiles ORDER BY is_active DESC, id ASC"
    )
    return [_row_to_profile(r) for r in cur.fetchall()]


def insert_profile(cur, data: dict) -> int:
    cur.execute(
        "INSERT INTO moto_profiles (name, brand, model, year, engine_cc, color, vin, "
        "purchase_date, purchase_km, current_km, notes) "
        "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
        (
            data["name"], data["brand"], data["model"], int(data["year"]),
            int(data.get("engine_cc") or 0) or None,
            data.get("color", ""), data.get("vin", ""),
            data.get("purchase_date") or None,
            int(data.get("purchase_km") or 0),
            int(data.get("current_km") or 0),
            data.get("notes", ""),
        ),
    )
    return cur.fetchone()[0]


def update_profile(cur, profile_id: int, data: dict) -> None:
    cur.execute(
        "UPDATE moto_profiles SET name=%s, brand=%s, model=%s, year=%s, engine_cc=%s, "
        "color=%s, vin=%s, purchase_date=%s, purchase_km=%s, current_km=%s, notes=%s, "
        "updated_at=NOW() WHERE id=%s",
        (
            data["name"], data["brand"], data["model"], int(data["year"]),
            int(data.get("engine_cc") or 0) or None,
            data.get("color", ""), data.get("vin", ""),
            data.get("purchase_date") or None,
            int(data.get("purchase_km") or 0),
            int(data.get("current_km") or 0),
            data.get("notes", ""),
            profile_id,
        ),
    )


def set_active_profile(cur, profile_id: int) -> None:
    cur.execute("UPDATE moto_profiles SET is_active = (id = %s), updated_at=NOW()", (profile_id,))


def delete_profile(cur, profile_id: int) -> None:
    cur.execute("DELETE FROM moto_profiles WHERE id = %s", (profile_id,))
