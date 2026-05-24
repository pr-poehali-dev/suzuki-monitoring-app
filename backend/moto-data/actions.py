import json
from db import (
    get_conn,
    fetch_mileage, fetch_maintenance_log, insert_mileage, insert_maintenance_log,
    fetch_profiles, insert_profile, update_profile, set_active_profile, delete_profile,
)

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def respond(status: int, data: dict) -> dict:
    return {"statusCode": status, "headers": HEADERS, "body": json.dumps(data)}


# ─── GET ──────────────────────────────────────────────────────────────────────

def handle_get() -> dict:
    conn = get_conn()
    cur = conn.cursor()
    km = fetch_mileage(cur)
    logs = fetch_maintenance_log(cur)
    profiles = fetch_profiles(cur)
    cur.close()
    conn.close()
    return respond(200, {"km": km, "maintenance_log": logs, "profiles": profiles})


# ─── Mileage ──────────────────────────────────────────────────────────────────

def handle_update_km(body: dict) -> dict:
    km = int(body["km"])
    conn = get_conn()
    cur = conn.cursor()
    insert_mileage(cur, km)
    conn.commit()
    cur.close()
    conn.close()
    return respond(200, {"ok": True, "km": km})


# ─── Maintenance ──────────────────────────────────────────────────────────────

def handle_add_maintenance(body: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    new_id = insert_maintenance_log(
        cur,
        operation=body["operation"],
        done_km=int(body.get("done_km", 0)),
        done_date=body["done_date"],
        note=body.get("note", ""),
    )
    conn.commit()
    cur.close()
    conn.close()
    return respond(200, {"ok": True, "id": new_id})


# ─── Profiles ─────────────────────────────────────────────────────────────────

def handle_create_profile(body: dict) -> dict:
    conn = get_conn()
    cur = conn.cursor()
    new_id = insert_profile(cur, body)
    conn.commit()
    cur.close()
    conn.close()
    return respond(200, {"ok": True, "id": new_id})


def handle_update_profile(body: dict) -> dict:
    profile_id = int(body["id"])
    conn = get_conn()
    cur = conn.cursor()
    update_profile(cur, profile_id, body)
    conn.commit()
    cur.close()
    conn.close()
    return respond(200, {"ok": True})


def handle_set_active_profile(body: dict) -> dict:
    profile_id = int(body["id"])
    conn = get_conn()
    cur = conn.cursor()
    set_active_profile(cur, profile_id)
    conn.commit()
    cur.close()
    conn.close()
    return respond(200, {"ok": True})


def handle_delete_profile(body: dict) -> dict:
    profile_id = int(body["id"])
    conn = get_conn()
    cur = conn.cursor()
    delete_profile(cur, profile_id)
    conn.commit()
    cur.close()
    conn.close()
    return respond(200, {"ok": True})
