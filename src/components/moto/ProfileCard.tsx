import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MotoProfile, VinResult, VIN_DECODE_URL, capitalize, partLabel } from "./profile.types";

export function ProfileCard({
  profile, onEdit, onDelete, onSetActive,
}: {
  profile: MotoProfile;
  onEdit: () => void;
  onDelete: () => void;
  onSetActive: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showVinDetails, setShowVinDetails] = useState(false);
  const [vinData, setVinData] = useState<VinResult | null>(null);
  const [vinLoading, setVinLoading] = useState(false);

  const fetchVin = async () => {
    if (vinData || !profile.vin) return;
    setVinLoading(true);
    try {
      const res = await fetch(`${VIN_DECODE_URL}?vin=${profile.vin}&year=${profile.year}`);
      const data: VinResult = await res.json();
      if (data.brand) setVinData(data);
    } catch { /* silent */ }
    setVinLoading(false);
  };

  const handleToggleVin = () => {
    if (!showVinDetails) fetchVin();
    setShowVinDetails(v => !v);
  };

  return (
    <div className={`section-card p-5 space-y-3 transition-all duration-300 ${profile.is_active ? "ring-2 ring-primary/50" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 flex-shrink-0 ${profile.is_active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Icon name="Bike" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display font-bold tracking-wide">{profile.name}</p>
              {profile.is_active && (
                <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-medium">
                  Активный
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{profile.brand} {profile.model} · {profile.year}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!profile.is_active && (
            <button
              onClick={onSetActive}
              title="Сделать активным"
              className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground"
            >
              <Icon name="CheckCircle2" size={15} />
            </button>
          )}
          <button onClick={onEdit} className="p-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-colors text-muted-foreground">
            <Icon name="Pencil" size={15} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button onClick={onDelete} className="px-2 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-medium">
                Удалить
              </button>
              <button onClick={() => setConfirmDelete(false)} className="px-2 py-1.5 rounded-lg border border-border text-xs text-foreground">
                Нет
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-lg border border-border hover:border-destructive hover:text-destructive transition-colors text-muted-foreground">
              <Icon name="Trash2" size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        {[
          { icon: "Gauge", label: "Пробег", value: profile.current_km ? `${profile.current_km.toLocaleString()} км` : "—" },
          { icon: "Zap", label: "Объём", value: profile.engine_cc ? `${profile.engine_cc} куб.см` : "—" },
          { icon: "Palette", label: "Цвет", value: profile.color || "—" },
          { icon: "Hash", label: "VIN", value: profile.vin || "—" },
          { icon: "Calendar", label: "Куплен", value: profile.purchase_date || "—" },
          { icon: "MapPin", label: "Км при покупке", value: profile.purchase_km ? `${profile.purchase_km.toLocaleString()} км` : "—" },
        ].map(item => (
          <div key={item.label} className="bg-muted/30 rounded-lg px-3 py-2">
            <div className="flex items-center gap-1 text-muted-foreground mb-0.5">
              <Icon name={item.icon} size={11} fallback="Info" />
              <span>{item.label}</span>
            </div>
            <p className={`font-medium truncate ${item.label === "VIN" ? "font-mono text-xs" : ""}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {profile.notes && (
        <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3">{profile.notes}</p>
      )}

      {/* VIN синхронизация */}
      {profile.vin && (
        <div>
          <button
            onClick={handleToggleVin}
            className="flex items-center gap-1.5 text-xs text-primary hover:underline transition-colors"
          >
            {vinLoading
              ? <><Icon name="Loader2" size={12} className="animate-spin" /> Загружаю данные VIN...</>
              : showVinDetails
                ? <><Icon name="ChevronUp" size={12} /> Скрыть данные VIN</>
                : <><Icon name="ScanLine" size={12} /> Синхронизировать по VIN</>
            }
          </button>

          {showVinDetails && vinData && (
            <div className="mt-3 animate-fade-in space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-primary">
                <Icon name="CheckCircle2" size={14} />
                <p className="text-xs font-semibold">Данные из базы NHTSA по VIN {profile.vin}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: "Производитель", value: vinData.manufacturer },
                  { label: "Марка", value: vinData.brand ? capitalize(vinData.brand) : undefined },
                  { label: "Модель", value: vinData.model },
                  { label: "Год выпуска", value: vinData.year?.toString() },
                  { label: "Объём (куб.см)", value: vinData.engine_cc?.toString() },
                  { label: "Мощность (л.с.)", value: vinData.engine_hp?.toString() },
                  { label: "Цилиндры", value: vinData.cylinders?.toString() },
                  { label: "Топливо", value: vinData.fuel_type },
                  { label: "Страна сборки", value: vinData.plant_country },
                  { label: "Город сборки", value: vinData.plant_city },
                  { label: "Тип кузова", value: vinData.body_class },
                ].filter(i => i.value).map(item => (
                  <div key={item.label} className="bg-muted/40 rounded-lg px-3 py-2">
                    <p className="text-muted-foreground mb-0.5">{item.label}</p>
                    <p className="font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>

              {vinData.parts_query && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Icon name="Package" size={12} />
                    Подбор запчастей на Авито для {vinData.brand ? capitalize(vinData.brand) : ""} {vinData.model}:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(vinData.parts_query).slice(2).map(([key, query]) => (
                      <a
                        key={key}
                        href={`https://www.avito.ru/rossiya?q=${encodeURIComponent(query)}&category=avtomobili_i_transport`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs border border-border bg-card/50 px-2.5 py-1 rounded-full hover:border-primary hover:text-primary transition-colors text-foreground"
                      >
                        <Icon name="Search" size={10} />
                        {partLabel(key)}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
