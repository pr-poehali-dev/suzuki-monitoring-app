import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Status,
  MOTO,
  SYSTEMS,
  TASKS,
  statusClass,
  statusLabel,
  statusIcon,
} from "./moto.types";

// ─── StatusBadge ──────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${statusClass[status]}`}>
      <Icon name={statusIcon[status]} size={12} fallback="Circle" />
      {statusLabel[status]}
    </span>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard({ km, setKm }: { km: number; setKm: (v: number) => void }) {
  const [editKm, setEditKm] = useState(false);
  const [inputKm, setInputKm] = useState(String(km));
  const nextTo = 12000;
  const overallStatus: Status = "warn";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero */}
      <div className="section-card overflow-hidden">
        <div className="relative bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,.05) 20px, rgba(255,255,255,.05) 40px)" }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-slate-400 text-xs font-display tracking-widest uppercase mb-1">Цифровое руководство</p>
              <h1 className="text-3xl font-display font-bold tracking-wide">{MOTO.model}</h1>
              <p className="text-slate-300 text-sm mt-1">{MOTO.year} · {MOTO.color}</p>
              <p className="text-slate-500 text-xs mt-0.5 font-mono">VIN: {MOTO.vin}</p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <StatusBadge status={overallStatus} />
              <span className="text-slate-400 text-xs">Общий статус</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Icon name="Gauge" size={16} />
              <span>Пробег</span>
            </div>
            <button onClick={() => { setEditKm(true); setInputKm(String(km)); }} className="text-xs text-primary hover:underline">
              Изменить
            </button>
          </div>
          {editKm ? (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={inputKm}
                onChange={e => setInputKm(e.target.value)}
                className="border rounded-md px-2 py-1 text-lg font-display w-28 outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => { setKm(Number(inputKm)); setEditKm(false); }}
                className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm font-medium hover:opacity-90 transition"
              >
                OK
              </button>
            </div>
          ) : (
            <p className="text-3xl font-display font-bold">
              {km.toLocaleString()} <span className="text-base font-body font-normal text-muted-foreground">км</span>
            </p>
          )}
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <Icon name="Calendar" size={16} />
            <span>Последнее ТО</span>
          </div>
          <p className="text-xl font-display font-bold">2025-04-12</p>
          <p className="text-muted-foreground text-xs mt-1">6 000 км</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <Icon name="CalendarClock" size={16} />
            <span>Следующее ТО</span>
          </div>
          <p className="text-xl font-display font-bold">2026-04-12</p>
          <p className="text-muted-foreground text-xs mt-1">12 000 км</p>
        </div>

        <div className="metric-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <Icon name="Route" size={16} />
            <span>До ТО-3</span>
          </div>
          <p className="text-xl font-display font-bold text-amber-600">
            {(nextTo - km).toLocaleString()} <span className="text-sm font-body font-normal text-muted-foreground">км</span>
          </p>
          <div className="mt-2 bg-muted rounded-full h-1.5">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.min((km / nextTo) * 100, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="section-card">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <Icon name="ListTodo" size={18} className="text-primary" />
          <h2 className="font-display font-semibold text-lg tracking-wide">Ближайшие задачи</h2>
        </div>
        <div className="divide-y divide-border">
          {TASKS.map(t => (
            <div key={t.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/40 transition-colors">
              <div className="flex items-center gap-3">
                <Icon
                  name={statusIcon[t.priority]}
                  size={16}
                  className={t.priority === "ok" ? "text-emerald-600" : t.priority === "warn" ? "text-amber-500" : "text-red-500"}
                  fallback="Circle"
                />
                <span className="text-sm font-medium">{t.title}</span>
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {t.dueDate ?? (t.dueKm ? `${t.dueKm.toLocaleString()} км` : "")}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Systems ──────────────────────────────────────────────────────────────────
export function Systems() {
  const [active, setActive] = useState<string | null>(null);
  const sys = SYSTEMS.find(s => s.id === active);

  if (active && sys) {
    return (
      <div className="animate-fade-in">
        <button onClick={() => setActive(null)} className="flex items-center gap-1 text-sm text-primary hover:underline mb-5">
          <Icon name="ChevronLeft" size={16} /> Все системы
        </button>
        <div className="section-card">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border bg-slate-900 text-white rounded-t-xl">
            <div className="bg-white/10 rounded-lg p-2">
              <Icon name={sys.icon} size={22} fallback="Settings" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold tracking-wide">{sys.name}</h2>
              <p className="text-slate-300 text-sm mt-0.5">{sys.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
            {[
              { title: "Состав компонентов", icon: "Layers", items: sys.components },
              { title: "Признаки нормальной работы", icon: "CheckCircle2", items: sys.normal },
              { title: "Типовые неисправности", icon: "AlertTriangle", items: sys.faults },
              { title: "Что проверять", icon: "Search", items: sys.checks },
            ].map(block => (
              <div key={block.title} className="p-5">
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <Icon name={block.icon} size={15} fallback="Info" />
                  <p className="font-display font-semibold tracking-wide text-xs uppercase">{block.title}</p>
                </div>
                <ul className="space-y-1.5">
                  {block.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold mb-5">Системы мотоцикла</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SYSTEMS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className="section-card p-4 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary rounded-lg p-2 group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                <Icon name={s.icon} size={20} fallback="Settings" />
              </div>
              <div>
                <p className="font-display font-semibold tracking-wide">{s.name}</p>
                <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{s.desc}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Manual ───────────────────────────────────────────────────────────────────
export function Manual() {
  const [open, setOpen] = useState<string | null>("start");
  const sections = [
    {
      id: "start", icon: "Power", title: "Запуск и остановка",
      content: [
        "1. Переведите боковую подножку в поднятое положение — мотоцикл не заведётся со стоящей подножкой.",
        "2. Включите зажигание ключом → подождите 5 секунд (самодиагностика ECU).",
        "3. Убедитесь, что включена нейтральная передача (горит зелёный индикатор N).",
        "4. Нажмите кнопку запуска стартера (правая кнопка на руле).",
        "5. Остановка: снизьте скорость → включите нейтраль → выключите зажигание.",
      ],
    },
    {
      id: "warmup", icon: "Thermometer", title: "Прогрев двигателя",
      content: [
        "Мотоцикл 2022 года с инжектором не требует длительного прогрева на месте.",
        "1. Дайте поработать на ХХ 60-90 секунд — до стабилизации оборотов.",
        "2. Первые 3-5 км движения: обороты не выше 4000 об/мин.",
        "3. Полный прогрев двигателя — когда температура ОЖ достигнет 70°C.",
        "⚠️ Не держите мотоцикл на ХХ дольше 3 минут — это вредит катализатору.",
      ],
    },
    {
      id: "riding", icon: "Navigation", title: "Движение",
      content: [
        "Режимы езды: A (полная мощность 150 л.с.), B (сниженная), C (ещё мягче), Rain (дождь).",
        "Трекшн-контроль (STCS) настраивается в меню: уровни 1-3 и Off.",
        "Переключение вверх — нажим вперёд педалью, вниз — назад.",
        "Не отпускайте сцепление резко — плавно добавляйте газ при трогании.",
        "Торможение: основное — передним тормозом (~70% усилия), задний — для стабилизации.",
      ],
    },
    {
      id: "parking", icon: "ParkingSquare", title: "Стоянка и хранение",
      content: [
        "Всегда ставьте на боковую подножку на ровной твёрдой поверхности.",
        "При длительном хранении (>1 месяца): полный бак топлива + стабилизатор.",
        "Снять АКБ или подключить к зарядному устройству (Battery Tender).",
        "Накрыть чехлом, не прислонять горячий мотоцикл к горючим материалам.",
        "Перед возобновлением — обязательная проверка по чек-листу.",
      ],
    },
    {
      id: "checklist", icon: "CheckSquare", title: "Чек-лист перед поездкой",
      content: [
        "✅ Уровень моторного масла (смотровое окно с правой стороны)",
        "✅ Давление шин: перед — 2.5 бар, зад — 2.9 бар",
        "✅ Провис цепи: 20-30 мм, наличие смазки",
        "✅ Уровень тормозной жидкости в бачках",
        "✅ Световые приборы: ближний, дальний, поворотники, стоп-сигнал",
        "✅ Зеркала — чистые и отрегулированные",
        "✅ Нет ошибок на дисплее после самодиагностики",
      ],
    },
    {
      id: "warnings", icon: "AlertOctagon", title: "Важные предупреждения",
      content: [
        "🚫 Никогда не заводите мотоцикл в закрытом помещении — угарный газ смертельно опасен.",
        "🚫 Не используйте бензин с октановым числом ниже АИ-95.",
        "⚠️ При загорании лампы давления масла — немедленно заглушить двигатель.",
        "⚠️ Запрещено использование шин с истёкшим сроком службы (>5 лет) даже при хорошем протекторе.",
        "⚠️ После падения — обязательная проверка у специалиста перед следующей поездкой.",
      ],
    },
  ];

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold mb-5">Инструкция по эксплуатации</h2>
      <div className="section-card divide-y divide-border">
        {sections.map(s => (
          <div key={s.id}>
            <button
              onClick={() => setOpen(open === s.id ? null : s.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 transition-colors ${open === s.id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <Icon name={s.icon} size={18} fallback="FileText" />
                </div>
                <span className="font-display font-semibold tracking-wide">{s.title}</span>
              </div>
              <Icon name={open === s.id ? "ChevronUp" : "ChevronDown"} size={18} className="text-muted-foreground" />
            </button>
            {open === s.id && (
              <div className="px-5 pb-5 animate-fade-in">
                <ul className="space-y-2 pl-2">
                  {s.content.map((line, i) => (
                    <li key={i} className="text-sm text-foreground/80 leading-relaxed">{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
