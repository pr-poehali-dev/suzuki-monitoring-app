import { useState } from "react";
import Icon from "@/components/ui/icon";
import { EMPTY_FORM } from "./profile.types";
import { VinDecoder } from "./VinDecoder";

export function ProfileForm({
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
