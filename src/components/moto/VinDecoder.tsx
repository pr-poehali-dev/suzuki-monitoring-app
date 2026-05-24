import { useState } from "react";
import Icon from "@/components/ui/icon";
import { VIN_DECODE_URL, VinResult, EMPTY_FORM, capitalize, partLabel } from "./profile.types";

export function VinDecoder({ onFill }: { onFill: (data: Partial<typeof EMPTY_FORM>) => void }) {
  const [vin, setVin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VinResult | null>(null);
  const [error, setError] = useState("");

  const decode = async () => {
    const clean = vin.trim().toUpperCase();
    if (clean.length < 11) { setError("Введите минимум 11 символов VIN"); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${VIN_DECODE_URL}?vin=${clean}`);
      const data: VinResult = await res.json();
      if (!data.brand) { setError("Не удалось декодировать VIN. Проверьте номер."); }
      else { setResult(data); }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    }
    setLoading(false);
  };

  const handleFill = () => {
    if (!result) return;
    onFill({
      brand: result.brand ? capitalize(result.brand) : "",
      model: result.model || "",
      year: result.year ?? new Date().getFullYear(),
      engine_cc: result.engine_cc?.toString() || "",
      vin: vin.trim().toUpperCase(),
    });
    setResult(null); setVin("");
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2 text-primary">
        <Icon name="ScanLine" size={18} />
        <p className="font-display font-semibold tracking-wide text-sm">Заполнить по VIN</p>
      </div>
      <p className="text-xs text-muted-foreground">
        Введите VIN-номер мотоцикла — марка, модель и год подставятся автоматически через базу данных NHTSA (США).
      </p>
      <div className="flex gap-2">
        <input
          value={vin}
          onChange={e => setVin(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && decode()}
          placeholder="JS1GT79A1N2100001"
          maxLength={17}
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-muted/40 text-foreground placeholder:text-muted-foreground font-mono tracking-wider"
        />
        <button
          onClick={decode}
          disabled={loading || vin.trim().length < 11}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
        >
          {loading
            ? <><Icon name="Loader2" size={14} className="animate-spin" /> Декодирую...</>
            : <><Icon name="Search" size={14} /> Декодировать</>
          }
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs bg-destructive/10 rounded-lg px-3 py-2">
          <Icon name="AlertCircle" size={14} />
          {error}
        </div>
      )}

      {result && result.brand && (
        <div className="animate-fade-in space-y-3">
          {!result.is_motorcycle && (
            <div className="flex items-center gap-2 text-amber-500 text-xs bg-amber-500/10 rounded-lg px-3 py-2">
              <Icon name="AlertTriangle" size={14} />
              По VIN определён не мотоцикл — проверьте данные перед сохранением
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { label: "Марка", value: capitalize(result.brand || "") },
              { label: "Модель", value: result.model || "—" },
              { label: "Год", value: result.year?.toString() || "—" },
              { label: "Объём", value: result.engine_cc ? `${result.engine_cc} куб.см` : "—" },
              { label: "Мощность", value: result.engine_hp ? `${result.engine_hp} л.с.` : "—" },
              { label: "Цилиндры", value: result.cylinders?.toString() || "—" },
              { label: "Тип кузова", value: result.body_class || "—" },
              { label: "Топливо", value: result.fuel_type || "—" },
              { label: "Страна сборки", value: result.plant_country || "—" },
            ].filter(i => i.value && i.value !== "—").map(item => (
              <div key={item.label} className="bg-muted/40 rounded-lg px-3 py-2">
                <p className="text-muted-foreground mb-0.5">{item.label}</p>
                <p className="font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          {result.parts_query && (
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                <Icon name="Package" size={12} /> Подобранные поисковые запросы для этого мотоцикла:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(result.parts_query).slice(2).map(([key, query]) => (
                  <a
                    key={key}
                    href={`https://www.avito.ru/rossiya?q=${encodeURIComponent(query)}&category=avtomobili_i_transport`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs border border-border bg-muted/30 px-2.5 py-1 rounded-full hover:border-primary hover:text-primary transition-colors text-foreground"
                  >
                    <Icon name="Search" size={11} />
                    {partLabel(key)}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={handleFill}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              <Icon name="ClipboardPaste" size={14} />
              Подставить данные в форму
            </button>
            <button onClick={() => setResult(null)} className="px-3 py-2 rounded-lg text-xs border border-border hover:bg-muted transition text-foreground">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
