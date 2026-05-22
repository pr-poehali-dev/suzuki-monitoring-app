import json
import os
import psycopg2

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """
    GET  /  — получить пробег и историю ТО
    POST /  — обновить пробег или добавить запись ТО
    """
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = get_conn()
        cur = conn.cursor()

        cur.execute("SELECT km FROM moto_mileage ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        km = row[0] if row else 8450

        cur.execute(
            "SELECT id, operation, done_km, done_date::text, note, created_at::text "
            "FROM moto_maintenance_log ORDER BY done_date DESC, id DESC"
        )
        logs = [
            {"id": r[0], "operation": r[1], "done_km": r[2], "done_date": r[3], "note": r[4], "created_at": r[5]}
            for r in cur.fetchall()
        ]

        cur.close()
        conn.close()

        return {
            "statusCode": 200,
            "headers": HEADERS,
            "body": json.dumps({"km": km, "maintenance_log": logs}),
        }

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        action = body.get("action")

        conn = get_conn()
        cur = conn.cursor()

        if action == "update_km":
            km = int(body["km"])
            cur.execute("INSERT INTO moto_mileage (km) VALUES (%s)", (km,))
            conn.commit()
            cur.close()
            conn.close()
            return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"ok": True, "km": km})}

        if action == "add_maintenance":
            cur.execute(
                "INSERT INTO moto_maintenance_log (operation, done_km, done_date, note) "
                "VALUES (%s, %s, %s, %s) RETURNING id",
                (body["operation"], int(body.get("done_km", 0)), body["done_date"], body.get("note", "")),
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            cur.close()
            conn.close()
            return {"statusCode": 200, "headers": HEADERS, "body": json.dumps({"ok": True, "id": new_id})}

        cur.close()
        conn.close()
        return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "unknown action"})}

    return {"statusCode": 405, "headers": HEADERS, "body": json.dumps({"error": "method not allowed"})}
