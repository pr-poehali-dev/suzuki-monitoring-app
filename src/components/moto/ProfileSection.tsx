import { useState } from "react";
import Icon from "@/components/ui/icon";
import { apiPost } from "./moto.types";

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

const EMPTY_FORM = {
  name: "", brand: "", model: "", year: new Date().getFullYear(),
  engine_cc: "", color: "", vin: "", purchase_date: "", purchase_km: "", current_km: "", notes: "",
};

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

  const f = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.brand.trim() || !form.model.trim() || !form.year) return;
    setSaving(true);
    await onSave(form as typeof EMPTY_FORM & { id?: number });
    setSaving(false);
  };

  const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-muted/40 text-foreground placeholder:text-muted-foreground";
  const labelCls = "text-xs font-medium text-muted-foreground mb-1 block";

  return (
    <div className="animate-fade-in space-y-4">
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
          <input value={form.vin} onChange={f("vin")} placeholder="JS1GT79A1N2100001" className={`${inputCls} font-mono`} />
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

  return (
    <div className={`section-card p-5 space-y-3 transition-all duration-300 ${profile.is_active ? "ring-2 ring-primary/50" : ""}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${profile.is_active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
            <Icon name="Bike" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
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
        <p className="text-xs text-muted-foreground italic px-1 border-l-2 border-primary/30 pl-3">{profile.notes}</p>
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
        year: Number(data.year), engine_cc: data.engine_cc ? Number(data.engine_cc) : null,
        color: data.color, vin: data.vin,
        purchase_date: data.purchase_date || null,
        purchase_km: Number(data.purchase_km) || 0,
        current_km: Number(data.current_km) || 0,
        notes: data.notes, is_active: profiles.length === 0,
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
        year: Number(data.year), engine_cc: data.engine_cc ? Number(data.engine_cc) : null,
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
          <ProfileForm
            onSave={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
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
