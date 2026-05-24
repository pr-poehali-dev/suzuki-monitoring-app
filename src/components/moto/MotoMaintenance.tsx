import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  MaintenanceLogEntry,
  MAINTENANCE_DATA,
  PARTS_DATA,
  SERVICE_DATA,
  AI_SUGGESTIONS,
  AI_RESPONSES,
  ChatMessage,
} from "./moto.types";
import { StatusBadge } from "./MotoSections";

// ─── Maintenance ──────────────────────────────────────────────────────────────
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

// ─── Parts ────────────────────────────────────────────────────────────────────
function avitoUrl(query: string) {
  return `https://www.avito.ru/rossiya?q=${encodeURIComponent(query)}&category=avtomobili_i_transport`;
}

export function Parts() {
  const [filter, setFilter] = useState("Все");
  const [search, setSearch] = useState("");
  const [compare, setCompare] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const categories = ["Все", "Расходники", "Оригинальные детали", "Аналоги"];
  const stockColor: Record<string, string> = { есть: "text-emerald-600", нет: "text-red-500", заказать: "text-amber-600" };
  const stockIcon: Record<string, string> = { есть: "CheckCircle2", нет: "XCircle", заказать: "Clock" };
  const stockBg: Record<string, string> = { есть: "bg-emerald-50 border-emerald-200", нет: "bg-red-50 border-red-200", заказать: "bg-amber-50 border-amber-200" };

  const filtered = PARTS_DATA
    .filter(p => filter === "Все" || p.category === filter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.originalNumber.toLowerCase().includes(search.toLowerCase()));

  const toggleCompare = (id: number) => {
    setCompare(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const compareItems = PARTS_DATA.filter(p => compare.includes(p.id));

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-bold">Каталог запчастей</h2>
        {compare.length > 0 && (
          <button
            onClick={() => setShowCompare(true)}
            className="flex items-center gap-1.5 ml-auto bg-accent text-accent-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition animate-fade-in"
          >
            <Icon name="GitCompare" size={15} />
            Сравнить ({compare.length})
          </button>
        )}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию или артикулу..."
            className="w-full border border-border rounded-lg pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${filter === c ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border hover:border-primary text-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="section-card px-5 py-10 text-center text-muted-foreground text-sm">
          <Icon name="SearchX" size={32} className="mx-auto mb-2 opacity-30" />
          <p>Ничего не найдено — попробуйте другой запрос</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(p => {
            const inCompare = compare.includes(p.id);
            return (
              <div
                key={p.id}
                className={`section-card p-4 flex flex-col gap-3 transition-all ${inCompare ? "ring-2 ring-accent" : ""}`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm leading-snug flex-1">{p.name}</p>
                  <span className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0 px-2 py-0.5 rounded-full border ${stockBg[p.stock]} ${stockColor[p.stock]}`}>
                    <Icon name={stockIcon[p.stock]} size={11} fallback="Circle" />
                    {p.stock}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Система</span>
                    <span className="font-medium text-right">{p.system}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Артикул</span>
                    <span className="font-mono">{p.originalNumber}</span>
                  </div>
                  {p.price && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Цена</span>
                      <span className="font-semibold text-primary">{p.price}</span>
                    </div>
                  )}
                </div>

                {/* Linked operations */}
                {p.linked.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {p.linked.map(l => (
                      <span key={l} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{l}</span>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1">
                  {/* Авито */}
                  {p.avitoQuery && (
                    <a
                      href={avitoUrl(p.avitoQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-medium border border-border bg-white hover:bg-[#00AAFF]/10 hover:border-[#00AAFF] hover:text-[#0070AA] transition-all"
                    >
                      <Icon name="Search" size={13} />
                      Авито
                    </a>
                  )}
                  {/* Купить в магазине */}
                  {p.shopUrl && (
                    <a
                      href={p.shopUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all"
                    >
                      <Icon name="ShoppingCart" size={13} />
                      Купить
                    </a>
                  )}
                  {/* Сравнить */}
                  <button
                    onClick={() => toggleCompare(p.id)}
                    title={inCompare ? "Убрать из сравнения" : compare.length >= 3 ? "Максимум 3 позиции" : "Добавить к сравнению"}
                    disabled={!inCompare && compare.length >= 3}
                    className={`px-2.5 py-2 rounded-lg border text-xs transition-all ${inCompare ? "bg-accent text-accent-foreground border-accent" : "border-border bg-white hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"}`}
                  >
                    <Icon name="GitCompare" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Compare modal */}
      {showCompare && compareItems.length > 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCompare(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h3 className="font-display text-xl font-bold tracking-wide">Сравнение запчастей</h3>
              <button onClick={() => setShowCompare(false)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <td className="text-muted-foreground text-xs font-semibold uppercase pr-4 py-2 w-32">Параметр</td>
                    {compareItems.map(p => (
                      <th key={p.id} className="px-3 py-2 text-left font-semibold">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { label: "Категория", key: "category" },
                    { label: "Система", key: "system" },
                    { label: "Артикул", key: "originalNumber" },
                    { label: "Цена", key: "price" },
                    { label: "Наличие", key: "stock" },
                  ].map(row => (
                    <tr key={row.label} className="hover:bg-muted/30">
                      <td className="text-xs text-muted-foreground pr-4 py-2.5 font-medium">{row.label}</td>
                      {compareItems.map(p => (
                        <td key={p.id} className="px-3 py-2.5">
                          {row.key === "stock" ? (
                            <span className={`text-xs font-semibold ${stockColor[p.stock]}`}>{p.stock}</span>
                          ) : (
                            <span className={row.key === "price" ? "font-semibold text-primary" : ""}>{(p as never)[row.key] || "—"}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 pb-6 grid gap-3" style={{ gridTemplateColumns: `repeat(${compareItems.length}, 1fr)` }}>
              {compareItems.map(p => (
                <div key={p.id} className="flex flex-col gap-2">
                  {p.avitoQuery && (
                    <a href={avitoUrl(p.avitoQuery)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-white hover:bg-[#00AAFF]/10 hover:border-[#00AAFF] hover:text-[#0070AA] transition-all">
                      <Icon name="Search" size={13} /> Авито
                    </a>
                  )}
                  {p.shopUrl && (
                    <a href={p.shopUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all">
                      <Icon name="ShoppingCart" size={13} /> Купить
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────
export function Service() {
  const total = SERVICE_DATA.reduce((s, r) => s + r.cost, 0);
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl font-bold">Сервис и ремонт</h2>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Итого затрат</p>
          <p className="font-display text-xl font-bold">{total.toLocaleString()} ₽</p>
        </div>
      </div>
      <div className="space-y-3">
        {SERVICE_DATA.map(r => (
          <div key={r.id} className="section-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`mt-1 w-2.5 h-2.5 rounded-full flex-shrink-0 ${r.priority === "ok" ? "bg-emerald-500" : r.priority === "warn" ? "bg-amber-500" : "bg-red-500"}`} />
                <div>
                  <p className="font-display font-semibold tracking-wide">{r.work}</p>
                  <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Icon name="Calendar" size={12} />{r.date}</span>
                    <span className="flex items-center gap-1"><Icon name="Gauge" size={12} />{r.km.toLocaleString()} км</span>
                    <span className="flex items-center gap-1"><Icon name="Clock" size={12} />{r.duration}</span>
                  </div>
                  {r.note && <p className="text-xs text-amber-600 mt-2 italic">{r.note}</p>}
                </div>
              </div>
              <p className="font-display text-lg font-bold">{r.cost.toLocaleString()} ₽</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── AIChat ───────────────────────────────────────────────────────────────────
export function AIChat({ km }: { km: number }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: `Привет! Я AI-помощник для вашего Suzuki GSX-S1000 2022.\n\nТекущий пробег: ${km.toLocaleString()} км. Знаю историю обслуживания и состояние всех систем. Задайте вопрос — отвечу по вашей ситуации.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages(m => [...m, { role: "user", text }]);
    setLoading(true);
    setInput("");
    setTimeout(() => {
      const reply =
        AI_RESPONSES[text] ||
        `Хороший вопрос о GSX-S1000! По вашему пробегу ${km.toLocaleString()} км могу сказать: мотоцикл в целом в норме, но требует внимания по тормозной жидкости и смазке цепи. Уточните вопрос — дам более конкретный ответ.`;
      setMessages(m => [...m, { role: "ai", text: reply }]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="animate-fade-in flex flex-col" style={{ minHeight: 500 }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary rounded-xl p-2.5">
          <Icon name="Bot" size={22} className="text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">AI-помощник</h2>
          <p className="text-muted-foreground text-xs">GSX-S1000 · {km.toLocaleString()} км</p>
        </div>
      </div>

      <div className="section-card flex flex-col">
        <div className="overflow-y-auto p-4 space-y-4 min-h-64 max-h-96">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}>
              {m.role === "ai" && (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                  <Icon name="Bot" size={14} className="text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-line leading-relaxed ${m.role === "user" ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted text-foreground rounded-bl-none"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <Icon name="Bot" size={14} className="text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-xl px-4 py-3 text-sm text-muted-foreground flex items-center gap-1">
                {[0, 1, 2].map(d => (
                  <span key={d} className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: `${d * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-border flex flex-wrap gap-2">
          {AI_SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send(input)}
            placeholder="Задайте вопрос по мотоциклу..."
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => send(input)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition flex items-center gap-1.5"
          >
            <Icon name="Send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}