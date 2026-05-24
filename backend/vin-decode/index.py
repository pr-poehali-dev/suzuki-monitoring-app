import json
import urllib.request

HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
}

FIELDS = {
    "Make": "brand",
    "Model": "model",
    "Model Year": "year",
    "Vehicle Type": "vehicle_type",
    "Plant Country": "plant_country",
    "Plant City": "plant_city",
    "Manufacturer Name": "manufacturer",
    "Engine Number of Cylinders": "cylinders",
    "Displacement (CC)": "engine_cc",
    "Fuel Type - Primary": "fuel_type",
    "Engine Brake (hp) From": "engine_hp",
    "Body Class": "body_class",
    "Series": "series",
    "Trim": "trim",
    "Error Code": "error_code",
    "Error Text": "error_text",
    "Additional Error Text": "additional_error",
}


def handler(event: dict, context) -> dict:
    """Декодирование VIN через NHTSA VPIC API (бесплатно, без ключа).
    GET /?vin=JS1GT79A1N2100001&year=2022
    Параметр year опциональный, улучшает точность декодирования.
    """
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": HEADERS, "body": ""}

    params = event.get("queryStringParameters") or {}
    vin = (params.get("vin") or "").strip().upper()

    if not vin or len(vin) < 11:
        return {"statusCode": 400, "headers": HEADERS, "body": json.dumps({"error": "VIN должен содержать минимум 11 символов"})}

    year = params.get("year", "")
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/{vin}?format=json"
    if year:
        url += f"&modelyear={year}"

    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read())

    raw = {r["Variable"]: r["Value"] for r in data.get("Results", [])}

    result = {}
    for nhtsa_key, our_key in FIELDS.items():
        val = raw.get(nhtsa_key)
        if val and val not in ("", "Not Applicable", "null"):
            result[our_key] = val

    # Нормализуем числовые поля
    for field in ("year", "engine_cc", "engine_hp", "cylinders"):
        if field in result:
            try:
                result[field] = int(float(result[field]))
            except (ValueError, TypeError):
                pass

    # Определяем — это мотоцикл или нет
    vtype = result.get("vehicle_type", "").upper()
    result["is_motorcycle"] = "MOTORCYCLE" in vtype or "MOPED" in vtype

    # Запчасти, совместимые с этой моделью (подбираем по make+model)
    result["parts_query"] = _build_parts_query(result)

    return {"statusCode": 200, "headers": HEADERS, "body": json.dumps(result, ensure_ascii=False)}


def _build_parts_query(info: dict) -> dict:
    """Формируем поисковые запросы для подбора запчастей по декодированному VIN."""
    brand = info.get("brand", "")
    model = info.get("model", "")
    year = info.get("year", "")

    base = f"{brand} {model}".strip()
    base_year = f"{year} {base}".strip() if year else base

    return {
        "avito_base": base,
        "avito_year": base_year,
        "oil_filter": f"масляный фильтр {base}",
        "air_filter": f"воздушный фильтр {base}",
        "spark_plugs": f"свечи зажигания {base}",
        "brake_pads_front": f"тормозные колодки передние {base}",
        "brake_pads_rear": f"тормозные колодки задние {base}",
        "chain": f"приводная цепь {base}",
        "brake_fluid": f"тормозная жидкость DOT4 мото",
        "engine_oil": f"моторное масло {brand} мотоцикл 10W-40",
    }
