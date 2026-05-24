import json
from actions import HEADERS, handle_get, handle_update_km, handle_add_maintenance


def handler(event: dict, context) -> dict:
    """
    GET  /  — получить пробег и историю ТО
    POST /  — обновить пробег (action=update_km) или добавить запись ТО (action=add_maintenance)
    """
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        return handle_get()

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        action = body.get("action")

        if action == "update_km":
            return handle_update_km(body)

        if action == "add_maintenance":
            return handle_add_maintenance(body)

        return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "unknown action"})}

    return {"statusCode": 405, "headers": HEADERS, "body": json.dumps({"error": "method not allowed"})}
