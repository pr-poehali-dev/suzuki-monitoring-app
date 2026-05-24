import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MaintenanceLogEntry, MAINTENANCE_DATA } from "./moto.types";
import { StatusBadge } from "./MotoSections";

export function Maintenance({ km, maintenanceLog, onAddLog }: {
  km: number;
  maintenanceLog: MaintenanceLogEntry[];
  onAddLog: (entry: { operation: string; done_km: number; done_date: string; note: string }) => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ operation: "", done_km: String(km), done_date: new Date().toISOString().slice(0, 10), note: "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.operation.trim()) return;
    setSaving(true);
    await onAddLog({ operation: form.operation, done_km: Number(form.done_km), done_date: form.done_date, note: form.note });
    setForm({ operation: "", done_km: String(km), done_date: new Date().toISOString().slice(0, 10), note: "" });
    setShowForm(false);
    setSaving(false);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-display text-2xl font-bold">Техническое обслуживание</h2>

      {/* Регламент */}
      <div className="section-card overflow-x-auto">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Icon name="ClipboardCheck" size={18} className="text-primary" />
          <h3 className="font-display font-semibold tracking-wide">Регламент ТО</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-900 text-white">
              {["Операция", "Каждые (км)", "Каждые (мес.)", "Последнее (км)", "Дата", "Статус", "Приоритет"].map(h => (
                <th key={h} className="text-left px-4 py-3 font-display font-semibold tracking-wide text-xs uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MAINTENANCE_DATA.map((item, i) => (
              <tr key={item.id} className={`hover:bg-muted/40 transition-colors ${i % 2 !== 0 ? "bg-slate-50/50" : ""}`}>
                <td className="px-4 py-3 font-medium">{item.operation}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono">{item.intervalKm > 0 ? item.intervalKm.toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground font-mono">{item.intervalMonths > 0 ? item.intervalMonths : "—"}</td>
                <td className="px-4 py-3 font-mono">{item.lastDoneKm > 0 ? item.lastDoneKm.toLocaleString() : "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{item.lastDoneDate}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold ${item.priority === "Высокий" ? "text-red-600" : item.priority === "Средний" ? "text-amber-600" : "text-emerald-600"}`}>
                    {item.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground p-4">Текущий пробег: {km.toLocaleString()} км</p>
      </div>

      {/* История ТО из БД */}
      <div className="section-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Icon name="History" size={18} className="text-primary" />
            <h3 className="font-display font-semibold tracking-wide">История выполненных работ</h3>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition"
          >
            <Icon name="Plus" size={15} />
            Добавить запись
          </button>
        </div>

        {/* Форма добавления */}
        {showForm && (
          <div className="px-5 py-4 border-b border-border bg-muted/30 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Операция *</label>
                <input
                  value={form.operation}
                  onChange={e => setForm(f => ({ ...f, operation: e.target.value }))}
                  placeholder="Замена масла..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Пробег (км)</label>
                <input
                  type="number"
                  value={form.done_km}
                  onChange={e => setForm(f => ({ ...f, done_km: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Дата</label>
                <input
                  type="date"
                  value={form.done_date}
                  onChange={e => setForm(f => ({ ...f, done_date: e.target.value }))}
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Заметка</label>
                <input
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Дополнительно..."
                  className="w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={saving || !form.operation.trim()}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {saving ? "Сохраняю..." : "Сохранить"}
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted transition">
                Отмена
              </button>
            </div>
          </div>
        )}

        {maintenanceLog.length === 0 ? (
          <div className="px-5 py-8 text-center text-muted-foreground text-sm">
            <Icon name="ClipboardList" size={32} className="mx-auto mb-2 opacity-30" />
            <p>История пуста — добавьте первую запись</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {maintenanceLog.map(r => (
              <div key={r.id} className="flex items-start justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-medium text-sm">{r.operation}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Icon name="Calendar" size={11} />{r.done_date}</span>
                    {r.done_km > 0 && <span className="flex items-center gap-1"><Icon name="Gauge" size={11} />{r.done_km.toLocaleString()} км</span>}
                    {r.note && <span className="italic">{r.note}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
