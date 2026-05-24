import { useState } from "react";
import Icon from "@/components/ui/icon";
import { MaintenanceLogEntry, MaintenanceItem, MAINTENANCE_DATA, Status } from "./moto.types";
import { StatusBadge } from "./MotoSections";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcNextKm(item: MaintenanceItem, doneKm: number): number | null {
  return item.intervalKm > 0 ? doneKm + item.intervalKm : null;
}

function calcNextDate(item: MaintenanceItem, doneDate: string): string | null {
  if (item.intervalMonths <= 0) return null;
  const d = new Date(doneDate);
  d.setMonth(d.getMonth() + item.intervalMonths);
  return d.toISOString().slice(0, 10);
}

function calcStatus(item: MaintenanceItem, currentKm: number, doneKm: number, doneDate: string): Status {
  const nextKm = calcNextKm(item, doneKm);
  const nextDate = calcNextDate(item, doneDate);
  const today = new Date();

  const kmOverdue = nextKm !== null && currentKm >= nextKm;
  const kmWarn = nextKm !== null && currentKm >= nextKm - item.intervalKm * 0.15;

  const dateOverdue = nextDate !== null && new Date(nextDate) < today;
  const dateWarn = nextDate !== null && new Date(nextDate) <= new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (kmOverdue || dateOverdue) return "alert";
  if (kmWarn || dateWarn) return "warn";
  return "ok";
}

// ─── DoneModal — быстрое выполнение пункта ────────────────────────────────────
function DoneModal({
  item, km, onConfirm, onClose,
}: {
  item: MaintenanceItem;
  km: number;
  onConfirm: (doneKm: number, doneDate: string, note: string) => Promise<void>;
  onClose: () => void;
}) {
  const [doneKm, setDoneKm] = useState(String(km));
  const [doneDate, setDoneDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const nextKm = calcNextKm(item, Number(doneKm));
  const nextDate = calcNextDate(item, doneDate);

  const inputCls = "w-full border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary bg-muted/40 text-foreground";

  const handleConfirm = async () => {
    setSaving(true);
    await onConfirm(Number(doneKm), doneDate, note);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="rounded-2xl w-full max-w-md animate-fade-in overflow-hidden"
        style={{ backgroundColor: "hsl(var(--card))", backdropFilter: "blur(16px)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2 text-primary">
            <Icon name="CheckCircle2" size={18} />
            <h3 className="font-display font-semibold tracking-wide">Отметить выполненным</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Операция */}
          <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
            <p className="font-semibold text-sm">{item.operation}</p>
            <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
              {item.intervalKm > 0 && <span>каждые {item.intervalKm.toLocaleString()} км</span>}
              {item.intervalMonths > 0 && <span>каждые {item.intervalMonths} мес.</span>}
            </div>
          </div>

          {/* Поля ввода */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Пробег выполнения (км)</label>
              <input type="number" value={doneKm} onChange={e => setDoneKm(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Дата выполнения</label>
              <input type="date" value={doneDate} onChange={e => setDoneDate(e.target.value)} className={inputCls} />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Заметка (необязательно)</label>
              <input
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Замена масла 5W-40, фильтр BOSCH..."
                className={inputCls}
              />
            </div>
          </div>

          {/* Следующий срок */}
          {(nextKm || nextDate) && (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Следующее ТО:</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {nextKm && (
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <Icon name="Gauge" size={14} />
                    {nextKm.toLocaleString()} км
                  </div>
                )}
                {nextDate && (
                  <div className="flex items-center gap-1.5 text-primary font-semibold">
                    <Icon name="CalendarClock" size={14} />
                    {nextDate}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {saving
              ? <><Icon name="Loader2" size={15} className="animate-spin" /> Сохраняю...</>
              : <><Icon name="CheckCircle2" size={15} /> Выполнено</>
            }
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-sm border border-border hover:bg-muted transition text-foreground">
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Maintenance ──────────────────────────────────────────────────────────────
export function Maintenance({ km, maintenanceLog, onAddLog }: {
  km: number;
  maintenanceLog: MaintenanceLogEntry[];
  onAddLog: (entry: { operation: string; done_km: number; done_date: string; note: string }) => Promise<void>;
}) {
  // Локальный стейт регламента — обновляем при отметке выполненным
  const [schedule, setSchedule] = useState(MAINTENANCE_DATA);
  const [doneModal, setDoneModal] = useState<MaintenanceItem | null>(null);
  const [justDone, setJustDone] = useState<number[]>([]); // id только что выполненных
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    operation: "", done_km: String(km),
    done_date: new Date().toISOString().slice(0, 10), note: "",
  });
  const [saving, setSaving] = useState(false);

  const handleMarkDone = async (doneKm: number, doneDate: string, note: string) => {
    if (!doneModal) return;

    // Сохраняем в историю
    await onAddLog({ operation: doneModal.operation, done_km: doneKm, done_date: doneDate, note });

    // Пересчитываем строку регламента
    setSchedule(prev => prev.map(item => {
      if (item.id !== doneModal.id) return item;
      const newStatus = calcStatus(item, km, doneKm, doneDate);
      return { ...item, lastDoneKm: doneKm, lastDoneDate: doneDate, status: newStatus };
    }));

    // Анимируем «только что выполнено»
    setJustDone(prev => [...prev, doneModal.id]);
    setTimeout(() => setJustDone(prev => prev.filter(id => id !== doneModal.id)), 3000);

    setDoneModal(null);
  };

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
            <tr style={{ backgroundColor: "hsl(var(--sidebar-background))", color: "hsl(var(--foreground))" }}>
              {["Операция", "Каждые (км)", "Каждые (мес.)", "Последнее (км)", "Дата", "Статус", "Приоритет", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 font-display font-semibold tracking-wide text-xs uppercase whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schedule.map((item, i) => {
              const done = justDone.includes(item.id);
              const nextKm = calcNextKm(item, item.lastDoneKm);
              const nextDate = calcNextDate(item, item.lastDoneDate);

              return (
                <tr
                  key={item.id}
                  className={`transition-all duration-500 ${
                    done
                      ? "bg-emerald-500/10 border-l-4 border-emerald-500"
                      : i % 2 !== 0 ? "bg-muted/20 hover:bg-primary/5" : "hover:bg-primary/5"
                  }`}
                >
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {done && <Icon name="CheckCircle2" size={14} className="text-emerald-500 flex-shrink-0" />}
                      {item.operation}
                    </div>
                    {/* Следующий срок — подпись под названием */}
                    {(nextKm || nextDate) && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {nextKm && (
                          <span className="text-xs text-primary/70 font-mono">
                            след.: {nextKm.toLocaleString()} км
                          </span>
                        )}
                        {nextDate && (
                          <span className="text-xs text-primary/70">
                            {nextKm ? "·" : "след.:"} {nextDate}
                          </span>
                        )}
                      </div>
                    )}
                  </td>
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
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDoneModal(item)}
                      title="Отметить выполненным"
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                        done
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500 cursor-default"
                          : "border-border bg-card/60 text-muted-foreground hover:border-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500"
                      }`}
                    >
                      <Icon name={done ? "Check" : "CheckSquare"} size={13} />
                      {done ? "Готово" : "Выполнено"}
                    </button>
                  </td>
                </tr>
              );
            })}
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
          <div className="px-5 py-4 border-b border-border bg-muted/40 animate-fade-in">
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

      {/* Модал подтверждения выполнения */}
      {doneModal && (
        <DoneModal
          item={doneModal}
          km={km}
          onConfirm={handleMarkDone}
          onClose={() => setDoneModal(null)}
        />
      )}
    </div>
  );
}
