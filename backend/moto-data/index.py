import json
from actions import (
    HEADERS,
    handle_get,
    handle_update_km,
    handle_add_maintenance,
    handle_create_profile,
    handle_update_profile,
    handle_set_active_profile,
    handle_delete_profile,
)


def handler(event: dict, context) -> dict:
    """
    GET  /  — пробег, история ТО, профили мотоциклов
    POST /  — update_km | add_maintenance |
              create_profile | update_profile | set_active_profile | delete_profile
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
        if action == "create_profile":
            return handle_create_profile(body)
        if action == "update_profile":
            return handle_update_profile(body)
        if action == "set_active_profile":
            return handle_set_active_profile(body)
        if action == "delete_profile":
            return handle_delete_profile(body)

        return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "unknown action"})}

    return {"statusCode": 405, "headers": HEADERS, "body": json.dumps({"error": "method not allowed"})}