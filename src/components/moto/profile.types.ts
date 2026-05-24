export const VIN_DECODE_URL = "https://functions.poehali.dev/969ef91d-bb0f-4111-aed2-6ba8a3a2296c";

export interface MotoProfile {
  id: number;
  name: string;
  brand: string;
  model: string;
  year: number;
  engine_cc: number | null;
  color: string;
  vin: string;
  purchase_date: string | null;
  purchase_km: number;
  current_km: number;
  notes: string;
  is_active: boolean;
  created_at: string;
}

export interface VinResult {
  brand?: string;
  model?: string;
  year?: number;
  engine_cc?: number;
  engine_hp?: number;
  cylinders?: number;
  fuel_type?: string;
  vehicle_type?: string;
  manufacturer?: string;
  plant_country?: string;
  plant_city?: string;
  body_class?: string;
  series?: string;
  trim?: string;
  is_motorcycle?: boolean;
  error_code?: string;
  parts_query?: Record<string, string>;
}

export const EMPTY_FORM = {
  name: "", brand: "", model: "", year: new Date().getFullYear(),
  engine_cc: "", color: "", vin: "", purchase_date: "",
  purchase_km: "", current_km: "", notes: "",
};

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function partLabel(key: string): string {
  const MAP: Record<string, string> = {
    oil_filter: "Масл. фильтр",
    air_filter: "Возд. фильтр",
    spark_plugs: "Свечи",
    brake_pads_front: "Колодки перед.",
    brake_pads_rear: "Колодки зад.",
    chain: "Цепь",
    brake_fluid: "Торм. жидкость",
    engine_oil: "Моторное масло",
  };
  return MAP[key] || key;
}
