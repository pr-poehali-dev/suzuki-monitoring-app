import json
from db import get_conn, fetch_mileage, fetch_maintenance_log, insert_mileage, insert_maintenance_log

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}


def respond(status: int, data: dict) -> dict:
    return {"statusCode": status, "headers": HEADERS, "body": json.dumps(data)}


def handle_get() -> dict:
    conn = get_conn()
    cur = conn.cursor()
    km = fetch_mileage(cur)
    logs = fetch_maintenance_log(cur)
    cur.close()
    conn.close()
    return respond(200, {"km": km, "maintenance_log": logs})


def handle_update_km(body: dict) -> dict:
    km = int(body["km"])
    conn = get_conn()
    cur = conn.cursor()
    insert_mileage(cur, km)
    conn.commit()
    cur.close()
    conn.close()
    return respond(200, {"ok": True, "km": km})


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
