import { useState } from "react";
import Icon from "@/components/ui/icon";
import { apiPost } from "./moto.types";

const VIN_DECODE_URL = "https://functions.poehali.dev/969ef91d-bb0f-4111-aed2-6ba8a3a2296c";

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface VinResult {
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

const EMPTY_FORM = {
  name: "", brand: "", model: "", year: new Date().getFullYear(),
  engine_cc: "", color: "", vin: "", purchase_date: "",
  purchase_km: "", current_km: "", notes: "",
};

// ─── VinDecoder ───────────────────────────────────────────────────────────────
function VinDecoder({ onFill }: { onFill: (data: Partial<typeof EMPTY_FORM>) => void }) {
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
      brand: result.brand ? _capitalize(result.brand) : "",
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

          {/* Основные данные */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {[
              { label: "Марка", value: _capitalize(result.brand || "") },
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

          {/* Запчасти из VIN */}
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
                    {_partLabel(key)}
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

function _capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function _partLabel(key: string): string {
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

// ─── ProfileForm ──────────────────────────────────────────────────────────────
function ProfileForm({
  initial, onSave, onCancel,
}: {
  initial?: Partial<typeof EMPTY_FORM & { id: number }>;
  onSave: (data: typeof EMPTY_FORM & { id?: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...EMPTY_FORM, ...initial });
  const [saving, setSaving] = useState(false);
  const [showVin, setShowVin] = useState(!initial?.brand);

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.brand.trim() || !form.model.trim() || !form.year) return;
    setSaving(true);
    await onSave(form as typeof EMPTY_FORM & { id?: number });
    setSaving(false);
  };

  const handleVinFill = (data: Partial<typeof EMPTY_FORM>) => {
    setForm(p => ({ ...p, ...data }));
    setShowVin(false);
  };

  const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-muted/40 text-foreground placeholder:text-muted-foreground";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <div className="animate-fade-in space-y-4">
      {/* VIN decoder toggle */}
      {!showVin ? (
        <button
          onClick={() => setShowVin(true)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <Icon name="ScanLine" size={13} /> Заполнить по VIN автоматически
        </button>
      ) : (
        <VinDecoder onFill={handleVinFill} />
      )}

      {/* Название профиля */}
      <div>
        <label className={labelCls}>Название профиля *</label>
        <input value={form.name} onChange={f("name")} placeholder="Мой GSX-S1000" className={inputCls} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Марка *</label>
          <input value={form.brand} onChange={f("brand")} placeholder="Suzuki" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Модель *</label>
          <input value={form.model} onChange={f("model")} placeholder="GSX-S1000" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Год выпуска *</label>
          <input type="number" value={form.year} onChange={f("year")} min={1980} max={2030} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Объём двигателя (куб.см)</label>
          <input type="number" value={form.engine_cc} onChange={f("engine_cc")} placeholder="999" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Цвет</label>
          <input value={form.color} onChange={f("color")} placeholder="Glass Matte Mechanical Gray" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>VIN</label>
          <input value={form.vin} onChange={f("vin")} placeholder="JS1GT79A1N2100001" className={`${inputCls} font-mono tracking-wider`} />
        </div>
        <div>
          <label className={labelCls}>Дата покупки</label>
          <input type="date" value={form.purchase_date} onChange={f("purchase_date")} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Пробег на момент покупки (км)</label>
          <input type="number" value={form.purchase_km} onChange={f("purchase_km")} placeholder="0" className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Текущий пробег (км)</label>
          <input type="number" value={form.current_km} onChange={f("current_km")} placeholder="8450" className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Заметки</label>
        <textarea
          value={form.notes} onChange={f("notes")}
          placeholder="Дополнительная информация о мотоцикле..."
          rows={3}
          className={`${inputCls} resize-none`}
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={saving || !form.brand.trim() || !form.model.trim()}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          <Icon name={saving ? "Loader2" : "Save"} size={15} className={saving ? "animate-spin" : ""} />
          {saving ? "Сохраняю..." : "Сохранить"}
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition text-foreground">
          Отмена
        </button>
      </div>
    </div>
  );
}

// ─── ProfileCard ──────────────────────────────────────────────────────────────
function ProfileCard({
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
                  { label: "Марка", value: vinData.brand ? _capitalize(vinData.brand) : undefined },
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

              {/* Ссылки на подбор запчастей */}
              {vinData.parts_query && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Icon name="Package" size={12} />
                    Подбор запчастей на Авито для {vinData.brand ? _capitalize(vinData.brand) : ""} {vinData.model}:
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
                        {_partLabel(key)}
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

// ─── ProfileSection ───────────────────────────────────────────────────────────
export function ProfileSection({
  profiles,
  onProfilesChange,
}: {
  profiles: MotoProfile[];
  onProfilesChange: (updated: MotoProfile[]) => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const handleCreate = async (data: typeof EMPTY_FORM) => {
    const res = await apiPost({ action: "create_profile", ...data });
    if (res.id) {
      const newProfile: MotoProfile = {
        id: res.id,
        name: data.name || `${data.brand} ${data.model}`,
        brand: data.brand, model: data.model,
        year: Number(data.year),
        engine_cc: data.engine_cc ? Number(data.engine_cc) : null,
        color: data.color, vin: data.vin,
        purchase_date: data.purchase_date || null,
        purchase_km: Number(data.purchase_km) || 0,
        current_km: Number(data.current_km) || 0,
        notes: data.notes,
        is_active: profiles.length === 0,
        created_at: new Date().toISOString(),
      };
      onProfilesChange([...profiles, newProfile]);
      setShowCreate(false);
    }
  };

  const handleUpdate = async (data: typeof EMPTY_FORM & { id?: number }) => {
    if (!data.id) return;
    await apiPost({ action: "update_profile", ...data });
    onProfilesChange(profiles.map(p =>
      p.id === data.id ? {
        ...p,
        name: data.name || `${data.brand} ${data.model}`,
        brand: data.brand, model: data.model,
        year: Number(data.year),
        engine_cc: data.engine_cc ? Number(data.engine_cc) : null,
        color: data.color, vin: data.vin,
        purchase_date: data.purchase_date || null,
        purchase_km: Number(data.purchase_km) || 0,
        current_km: Number(data.current_km) || 0,
        notes: data.notes,
      } : p
    ));
    setEditId(null);
  };

  const handleDelete = async (id: number) => {
    await apiPost({ action: "delete_profile", id });
    onProfilesChange(profiles.filter(p => p.id !== id));
  };

  const handleSetActive = async (id: number) => {
    await apiPost({ action: "set_active_profile", id });
    onProfilesChange(profiles.map(p => ({ ...p, is_active: p.id === id })));
  };

  const editingProfile = editId ? profiles.find(p => p.id === editId) : null;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Мои мотоциклы</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Профили для отслеживания регламента и подбора запчастей</p>
        </div>
        {!showCreate && !editId && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            <Icon name="Plus" size={16} />
            Добавить мотоцикл
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="section-card p-5">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Icon name="PlusCircle" size={18} />
            <h3 className="font-display font-semibold tracking-wide">Новый мотоцикл</h3>
          </div>
          <ProfileForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      {/* Edit form */}
      {editId && editingProfile && (
        <div className="section-card p-5">
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Icon name="Pencil" size={18} />
            <h3 className="font-display font-semibold tracking-wide">Редактирование: {editingProfile.name}</h3>
          </div>
          <ProfileForm
            initial={{
              id: editingProfile.id,
              name: editingProfile.name, brand: editingProfile.brand, model: editingProfile.model,
              year: editingProfile.year, engine_cc: editingProfile.engine_cc?.toString() || "",
              color: editingProfile.color, vin: editingProfile.vin,
              purchase_date: editingProfile.purchase_date || "",
              purchase_km: editingProfile.purchase_km?.toString() || "",
              current_km: editingProfile.current_km?.toString() || "",
              notes: editingProfile.notes,
            }}
            onSave={handleUpdate}
            onCancel={() => setEditId(null)}
          />
        </div>
      )}

      {/* Profile list */}
      {profiles.length === 0 && !showCreate ? (
        <div className="section-card px-5 py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Icon name="Bike" size={32} className="text-primary opacity-60" />
          </div>
          <p className="font-display text-lg font-semibold mb-1">Нет сохранённых мотоциклов</p>
          <p className="text-muted-foreground text-sm mb-4">Добавьте свой первый мотоцикл для отслеживания ТО и подбора запчастей</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition mx-auto"
          >
            <Icon name="Plus" size={16} />
            Добавить мотоцикл
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map(p => (
            <ProfileCard
              key={p.id}
              profile={p}
              onEdit={() => { setEditId(p.id); setShowCreate(false); }}
              onDelete={() => handleDelete(p.id)}
              onSetActive={() => handleSetActive(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
