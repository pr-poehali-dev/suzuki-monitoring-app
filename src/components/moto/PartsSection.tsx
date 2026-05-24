import { useState } from "react";
import Icon from "@/components/ui/icon";
import { PARTS_DATA } from "./moto.types";

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
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${filter === c ? "bg-primary text-primary-foreground border-primary" : "bg-card/60 border-border hover:border-primary text-foreground"}`}
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
                  {p.avitoQuery && (
                    <a
                      href={avitoUrl(p.avitoQuery)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2 rounded-lg text-xs font-medium border border-border bg-card/60 text-foreground hover:bg-[#00AAFF]/15 hover:border-[#00AAFF] hover:text-[#60C8FF] transition-all"
                    >
                      <Icon name="Search" size={13} />
                      Авито
                    </a>
                  )}
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
                  <button
                    onClick={() => toggleCompare(p.id)}
                    title={inCompare ? "Убрать из сравнения" : compare.length >= 3 ? "Максимум 3 позиции" : "Добавить к сравнению"}
                    disabled={!inCompare && compare.length >= 3}
                    className={`px-2.5 py-2 rounded-lg border text-xs transition-all ${inCompare ? "bg-accent text-accent-foreground border-accent" : "border-border bg-card/60 text-muted-foreground hover:border-accent hover:text-accent disabled:opacity-30 disabled:cursor-not-allowed"}`}
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
          <div className="rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-fade-in" style={{ backgroundColor: "hsl(var(--card))", backdropFilter: "blur(16px)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 z-10" style={{ backgroundColor: "hsl(var(--card))" }}>
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
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-border bg-muted/50 text-foreground hover:bg-[#00AAFF]/15 hover:border-[#00AAFF] hover:text-[#60C8FF] transition-all">
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