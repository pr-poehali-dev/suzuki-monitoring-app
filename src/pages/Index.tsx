import { useState } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────
type NavSection =
  | "dashboard"
  | "systems"
  | "manual"
  | "maintenance"
  | "parts"
  | "service"
  | "ai";

type Status = "ok" | "warn" | "alert";

interface Task {
  id: number;
  title: string;
  priority: Status;
  dueKm?: number;
  dueDate?: string;
}

interface MaintenanceItem {
  id: number;
  operation: string;
  intervalKm: number;
  intervalMonths: number;
  lastDoneKm: number;
  lastDoneDate: string;
  status: Status;
  priority: "Высокий" | "Средний" | "Низкий";
}

interface Part {
  id: number;
  name: string;
  category: string;
  system: string;
  originalNumber: string;
  stock: "есть" | "нет" | "заказать";
  linked: string[];
}

interface ServiceRecord {
  id: number;
  work: string;
  date: string;
  km: number;
  cost: number;
  duration: string;
  priority: Status;
  note: string;
}

interface ChatMessage {
  role: "user" | "ai";
  text: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const MOTO = {
  model: "Suzuki GSX-S1000",
  year: 2022,
  vin: "JS1GT79A1N2100001",
  color: "Glass Matte Mechanical Gray",
};

const SYSTEMS = [
  {
    id: "engine",
    icon: "Zap",
    name: "Двигатель",
    desc: "Рядный 4-цилиндровый, 999 куб.см, 150 л.с. при 11 000 об/мин",
    components: ["Блок цилиндров", "Головка блока (DOHC)", "Поршни и кольца", "Коленчатый вал", "Распредвалы", "Клапаны (16 шт.)"],
    normal: ["Стабильный холостой ход 1100±100 об/мин", "Нет посторонних шумов", "Нет дымления"],
    faults: ["Нестабильный ХХ → чистка дроссельного узла", "Стук → проверка фаз ГРМ", "Дымление → замена маслосъёмных колец"],
    checks: ["Каждые 1000 км: уровень масла", "Каждые 12 000 км: регулировка клапанов"],
  },
  {
    id: "oil",
    icon: "Droplets",
    name: "Система смазки",
    desc: "Мокрый картер, масляный насос с регулятором давления",
    components: ["Масляный насос", "Масляный фильтр", "Поддон картера", "Датчик давления масла"],
    normal: ["Давление масла в норме", "Нет подтёков", "Масло светло-коричневое"],
    faults: ["Горит лампа давления → немедленная остановка", "Тёмное масло → пора менять", "Подтёки → проверить сальники"],
    checks: ["Перед каждой поездкой: уровень", "Каждые 6000 км: замена масла и фильтра"],
  },
  {
    id: "cooling",
    icon: "Thermometer",
    name: "Система охлаждения",
    desc: "Жидкостная, радиатор с электровентилятором",
    components: ["Радиатор", "Термостат", "Водяной насос", "Расширительный бачок", "Вентилятор охлаждения"],
    normal: ["Температура 70-100°C в движении", "Вентилятор включается при 105°C", "Уровень ОЖ в норме"],
    faults: ["Перегрев → проверить вентилятор и термостат", "Белый дым → пробой прокладки ГБЦ"],
    checks: ["Раз в сезон: уровень ОЖ", "Каждые 2 года: замена ОЖ"],
  },
  {
    id: "fuel",
    icon: "Fuel",
    name: "Топливная система",
    desc: "Электронный впрыск (EFI), топливный насос в баке",
    components: ["Топливный бак (17 л)", "Топливный насос", "Форсунки (4 шт.)", "Топливная рампа", "Датчик уровня топлива"],
    normal: ["Стабильная работа форсунок", "Запас хода ~350 км", "Нет запаха топлива"],
    faults: ["Плохой пуск → чистка форсунок", "Падение мощности → диагностика SDTV", "Запах топлива → проверить шланги"],
    checks: ["Визуальный осмотр соединений", "Замена фильтра при ТО-2"],
  },
  {
    id: "intake",
    icon: "Wind",
    name: "Впуск и выпуск",
    desc: "Дроссельные заслонки SDTV 44 мм, катализатор",
    components: ["Воздушный фильтр", "Дроссельный узел SDTV", "Впускной коллектор", "Выпускная система (4-2-1-2)", "Катализатор"],
    normal: ["Чистый воздушный фильтр", "Равномерная тяга", "Нет посторонних шумов"],
    faults: ["Падение тяги → замена воздушного фильтра", "Вибрация → проверить хомуты выпуска"],
    checks: ["Каждые 6000 км: осмотр фильтра", "Каждые 12 000 км: замена воздушного фильтра"],
  },
  {
    id: "transmission",
    icon: "Settings2",
    name: "Сцепление и КПП",
    desc: "Мокрое многодисковое сцепление, 6-ступенчатая КПП, слиппер",
    components: ["Диски сцепления", "Корзина сцепления", "Слиппер-клатч", "Вал КПП", "Вилки переключения"],
    normal: ["Чёткое включение передач", "Нет пробуксовки", "Лёгкое управление сцеплением"],
    faults: ["Нечёткое включение → регулировка", "Пробуксовка → износ дисков", "Вой → проблемы с КПП"],
    checks: ["Каждые 12 000 км: состояние дисков", "Регулировка тяги сцепления"],
  },
  {
    id: "chain",
    icon: "Link",
    name: "Приводная цепь",
    desc: "Приводная цепь 525, ведущая и ведомая звёздочки",
    components: ["Приводная цепь 525", "Ведущая звёздочка (17T)", "Ведомая звёздочка (43T)", "Натяжитель цепи"],
    normal: ["Провис 20-30 мм", "Цепь смазана", "Нет вытяжки"],
    faults: ["Провис >30 мм → регулировка", "Вытяжка → замена цепи+звёздочек", "Хруст → нет смазки"],
    checks: ["Каждые 500-1000 км: чистка и смазка", "Каждые 500 км: провис"],
  },
  {
    id: "brakes",
    icon: "CircleDot",
    name: "Тормоза",
    desc: "ABS, двойные дисковые спереди (310 мм), одиночный сзади (240 мм)",
    components: ["Диски передние (2×310 мм)", "Диск задний (240 мм)", "Суппорты Brembo (4-поршневые)", "Тормозная жидкость DOT4", "ABS блок"],
    normal: ["Упругая ручка тормоза", "Нет писка при торможении", "Толщина колодок >3 мм"],
    faults: ["Писк → замена колодок или очистка", "Вибрация → деформация диска", "Мягкая ручка → завоздушивание"],
    checks: ["Каждые 3000 км: толщина колодок", "Каждые 2 года: замена жидкости"],
  },
  {
    id: "suspension",
    icon: "ArrowUpDown",
    name: "Подвеска",
    desc: "Вилка KYB 43 мм спереди, моноамортизатор KYB сзади",
    components: ["Телескопическая вилка KYB 43 мм", "Задний моноамортизатор KYB", "Рычаги маятника", "Подшипники рулевой колонки"],
    normal: ["Нет подтёков масла из вилки", "Полный ход подвески", "Нет стуков"],
    faults: ["Подтёки вилки → замена сальников", "Осадка → потеря жёсткости газового заряда", "Стук → люфт подшипников"],
    checks: ["Каждые 12 000 км: осмотр вилки", "Каждые 24 000 км: замена масла вилки"],
  },
  {
    id: "electrical",
    icon: "Cpu",
    name: "Электрооборудование",
    desc: "Генератор 470 Вт, АКБ 12В 10 Ач, светодиодная оптика",
    components: ["АКБ 12В 10 Ач (YTZ12S)", "Генератор 470 Вт", "Регулятор-выпрямитель", "Свечи зажигания (NGK CR9EIA-9)", "Блок предохранителей"],
    normal: ["Напряжение АКБ 12.6В (покой)", "Напряжение при работе 13.5-14.5В", "Нет ошибок DTC"],
    faults: ["Не запускается → АКБ или стартер", "Перезаряд → регулятор", "Ошибки → диагностика OBD"],
    checks: ["Каждые 6000 км: заряд АКБ", "Каждые 12 000 км: замена свечей"],
  },
  {
    id: "instruments",
    icon: "Monitor",
    name: "Приборная панель",
    desc: "ЖК-дисплей с многофункциональным меню",
    components: ["ЖК-дисплей", "Спидометр/тахометр", "Индикаторы режима езды (A/B/C/Rain)", "Индикатор передачи", "Датчик топлива"],
    normal: ["Все индикаторы работают", "Нет ошибок при запуске", "Яркость регулируется"],
    faults: ["Горит FI → диагностика впрыска", "Мигает масло → низкое давление", "Нет подсветки → предохранитель"],
    checks: ["При каждом запуске: самодиагностика 5 сек"],
  },
  {
    id: "wheels",
    icon: "Circle",
    name: "Колёса и шины",
    desc: "Переднее 120/70 ZR17, заднее 190/55 ZR17",
    components: ["Переднее колесо 120/70 ZR17", "Заднее колесо 190/55 ZR17", "Литые диски", "Подшипники ступиц"],
    normal: ["Давление: перед 2.5 бар, зад 2.9 бар", "Протектор >1.6 мм", "Нет боковых повреждений"],
    faults: ["Вибрация → балансировка или деформация", "Износ по центру → завышенное давление", "Шимми → люфт подшипников"],
    checks: ["Перед каждой поездкой: давление", "Каждые 3000 км: осмотр протектора"],
  },
  {
    id: "frame",
    icon: "Box",
    name: "Рама и шасси",
    desc: "Стальная рама-диагональ, подрамник алюминиевый",
    components: ["Основная рама", "Алюминиевый подрамник", "Рулевая колонка", "Маятник", "Подножки водителя"],
    normal: ["Нет трещин и деформаций", "Все болты затянуты", "Нет коррозии"],
    faults: ["Вибрация руля → проверить рулевую", "Скрипы → ослабленные болты крепления"],
    checks: ["Раз в сезон: осмотр рамы и крепежа"],
  },
];

const INITIAL_KM = 8450;

const MAINTENANCE_DATA: MaintenanceItem[] = [
  { id: 1, operation: "Замена моторного масла", intervalKm: 6000, intervalMonths: 12, lastDoneKm: 6000, lastDoneDate: "2025-04-12", status: "warn", priority: "Высокий" },
  { id: 2, operation: "Замена масляного фильтра", intervalKm: 6000, intervalMonths: 12, lastDoneKm: 6000, lastDoneDate: "2025-04-12", status: "warn", priority: "Высокий" },
  { id: 3, operation: "Замена воздушного фильтра", intervalKm: 12000, intervalMonths: 24, lastDoneKm: 0, lastDoneDate: "2022-12-01", status: "ok", priority: "Средний" },
  { id: 4, operation: "Регулировка клапанов", intervalKm: 12000, intervalMonths: 24, lastDoneKm: 0, lastDoneDate: "2022-12-01", status: "ok", priority: "Высокий" },
  { id: 5, operation: "Замена свечей зажигания", intervalKm: 12000, intervalMonths: 24, lastDoneKm: 0, lastDoneDate: "2022-12-01", status: "ok", priority: "Средний" },
  { id: 6, operation: "Замена тормозной жидкости", intervalKm: 0, intervalMonths: 24, lastDoneKm: 0, lastDoneDate: "2023-05-01", status: "alert", priority: "Высокий" },
  { id: 7, operation: "Замена охлаждающей жидкости", intervalKm: 0, intervalMonths: 36, lastDoneKm: 0, lastDoneDate: "2022-12-01", status: "ok", priority: "Средний" },
  { id: 8, operation: "Чистка/смазка цепи", intervalKm: 1000, intervalMonths: 0, lastDoneKm: 7800, lastDoneDate: "2025-10-15", status: "warn", priority: "Высокий" },
  { id: 9, operation: "Регулировка цепи", intervalKm: 3000, intervalMonths: 0, lastDoneKm: 6000, lastDoneDate: "2025-04-12", status: "ok", priority: "Средний" },
  { id: 10, operation: "Замена тормозных колодок передних", intervalKm: 15000, intervalMonths: 0, lastDoneKm: 0, lastDoneDate: "2022-12-01", status: "ok", priority: "Высокий" },
];

const PARTS_DATA: Part[] = [
  { id: 1, name: "Моторное масло Suzuki ECSTAR R9000 1L", category: "Расходники", system: "Система смазки", originalNumber: "99000-21E80-10G", stock: "есть", linked: ["Замена моторного масла"] },
  { id: 2, name: "Масляный фильтр", category: "Расходники", system: "Система смазки", originalNumber: "16510-07J00", stock: "есть", linked: ["Замена масляного фильтра"] },
  { id: 3, name: "Воздушный фильтр", category: "Расходники", system: "Впуск и выпуск", originalNumber: "13780-06J00", stock: "заказать", linked: ["Замена воздушного фильтра"] },
  { id: 4, name: "Свечи зажигания NGK CR9EIA-9 (4 шт.)", category: "Расходники", system: "Электрооборудование", originalNumber: "09482-00535", stock: "нет", linked: ["Замена свечей зажигания"] },
  { id: 5, name: "Тормозная жидкость DOT4 0.5L", category: "Расходники", system: "Тормоза", originalNumber: "99000-99001-DOT4", stock: "есть", linked: ["Замена тормозной жидкости"] },
  { id: 6, name: "Охлаждающая жидкость Suzuki 1L", category: "Расходники", system: "Система охлаждения", originalNumber: "99000-99032-12A", stock: "заказать", linked: [] },
  { id: 7, name: "Смазка цепи Chain Lube", category: "Расходники", system: "Приводная цепь", originalNumber: "—", stock: "есть", linked: ["Чистка/смазка цепи"] },
  { id: 8, name: "Тормозные колодки передние", category: "Оригинальные детали", system: "Тормоза", originalNumber: "69100-01840", stock: "нет", linked: ["Замена тормозных колодок передних"] },
  { id: 9, name: "Приводная цепь RK 525GXW", category: "Аналоги", system: "Приводная цепь", originalNumber: "—", stock: "заказать", linked: [] },
];

const SERVICE_DATA: ServiceRecord[] = [
  { id: 1, work: "ТО-1 (1000 км)", date: "2023-01-20", km: 1000, cost: 8500, duration: "3 ч", priority: "ok", note: "Замена масла, регулировка тяг" },
  { id: 2, work: "ТО-2 (6000 км)", date: "2025-04-12", km: 6000, cost: 14200, duration: "5 ч", priority: "ok", note: "Масло, фильтр, цепь, тормоза" },
  { id: 3, work: "Замена тормозных колодок задних", date: "2024-08-05", km: 4200, cost: 3800, duration: "1.5 ч", priority: "ok", note: "" },
  { id: 4, work: "Замена тормозной жидкости DOT4", date: "2023-05-10", km: 2100, cost: 2500, duration: "2 ч", priority: "warn", note: "Требуется повторная замена — просрочено" },
];

const TASKS: Task[] = [
  { id: 1, title: "Замена тормозной жидкости — просрочено", priority: "alert", dueDate: "Срочно" },
  { id: 2, title: "Замена масла и фильтра (подходит срок)", priority: "warn", dueKm: 9000 },
  { id: 3, title: "Смазка цепи (последняя: 7800 км)", priority: "warn", dueKm: 8800 },
  { id: 4, title: "Следующее ТО-3 (12 000 км)", priority: "ok", dueKm: 12000 },
];

const AI_SUGGESTIONS = [
  "Что проверить перед поездкой?",
  "Как отрегулировать цепь?",
  "Признаки износа тормозных колодок",
  "Как прогреть двигатель правильно?",
];

const AI_RESPONSES: Record<string, string> = {
  "Что проверить перед поездкой?": "Перед каждой поездкой на GSX-S1000 проверьте:\n\n1. Уровень масла — смотровое окно на правой стороне двигателя\n2. Давление в шинах — перед: 2.5 бар, зад: 2.9 бар\n3. Тормозные жидкости — уровень в бачках\n4. Световые приборы — ближний, дальний, поворотники, стоп-сигнал\n5. Цепь — провис 20-30 мм, наличие смазки\n6. Зеркала и руль — свободный ход\n\nВаш пробег: 8450 км. Обратите внимание: смазка цепи просрочена (последняя в 7800 км).",
  "Как отрегулировать цепь?": "Регулировка цепи GSX-S1000:\n\n1. Поставьте мотоцикл на центральную подножку (или боковую с нагрузкой)\n2. Измерьте провис в нижней точке — норма 20-30 мм\n3. Ослабьте осевую гайку заднего колеса (24 мм)\n4. Вращайте регулировочные болты на маятнике ОДИНАКОВО с обеих сторон\n5. Следите за совмещением меток на шкале маятника\n6. Затяните осевую гайку: 100 Н·м\n7. Смажьте цепь после регулировки\n\nЦепь нужно менять вместе со звёздочками при растяжении >2% от номинала.",
  "Признаки износа тормозных колодок": "Признаки износа тормозных колодок GSX-S1000:\n\n⚠️ Визуальные: толщина накладки <3 мм — пора менять, <1.5 мм — немедленно\n🔊 Звуковые: металлический визг при торможении — износ до индикатора\n📉 Ощутимые: увеличился ход ручки тормоза, снизилась эффективность\n\nВаш статус: передние колодки OK, задние менялись в 4200 км (текущий пробег 8450 км — возможно, близко к замене).\n\nРекомендую визуальный осмотр при следующем ТО.",
  "Как прогреть двигатель правильно?": "Правильный прогрев GSX-S1000 2022:\n\n1. Запустите двигатель — заведётся с первого раза благодаря EFI\n2. Холостой ход 1-2 минуты (дольше не нужно — инжекторные прогреваются в движении)\n3. Первые 3-5 км езды в щадящем режиме — обороты не выше 4000\n4. Полный прогрев до 70°C на дисплее — тогда можно давать полные обороты\n\n⚡ Не держите мотоцикл на холостом ходу дольше 3 минут — это вредит катализатору.",
};

// ─── Status helpers ───────────────────────────────────────────────────────────
const statusClass: Record<Status, string> = {
  ok: "bg-status-ok",
  warn: "bg-status-warn",
  alert: "bg-status-alert",
};
const statusLabel: Record<Status, string> = {
  ok: "Норма",
  warn: "Внимание",
  alert: "Срочно",
};
const statusIcon: Record<Status, string> = {
  ok: "CheckCircle2",
  warn: "AlertTriangle",
  alert: "AlertCircle",
};

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS: { id: NavSection; icon: string; label: string }[] = [
  { id: "dashboard", icon: "LayoutDashboard", label: "Панель управления" },
  { id: "systems", icon: "Layers", label: "Системы мотоцикла" },
  { id: "manual", icon: "BookOpen", label: "Инструкция" },
  { id: "maintenance", icon: "Wrench", label: "Техобслуживание" },
  { id: "parts", icon: "Package", label: "Запчасти" },
  { id: "service", icon: "ClipboardList", label: "Сервис и ремонт" },
  { id: "ai", icon: "MessageCircle", label: "AI-помощник" },
];

// ─── StatusBadge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${statusClass[status]}`}>
      <Icon name={statusIcon[status]} size={12} fallback="Circle" />
      {statusLabel[status]}
    </span>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ km, setKm }: { km: number; setKm: (v: number) => void }) {
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
function Systems() {
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
function Manual() {
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

// ─── Maintenance ──────────────────────────────────────────────────────────────
function Maintenance({ km }: { km: number }) {
  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-2xl font-bold mb-5">Техническое обслуживание</h2>
      <div className="section-card overflow-x-auto">
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
      </div>
      <p className="text-xs text-muted-foreground mt-3 px-1">Текущий пробег: {km.toLocaleString()} км</p>
    </div>
  );
}

// ─── Parts ────────────────────────────────────────────────────────────────────
function Parts() {
  const [filter, setFilter] = useState("Все");
  const categories = ["Все", "Расходники", "Оригинальные детали", "Аналоги"];
  const stockColor: Record<string, string> = { есть: "text-emerald-600", нет: "text-red-500", заказать: "text-amber-600" };
  const stockIcon: Record<string, string> = { есть: "CheckCircle2", нет: "XCircle", заказать: "Clock" };
  const filtered = filter === "Все" ? PARTS_DATA : PARTS_DATA.filter(p => p.category === filter);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <h2 className="font-display text-2xl font-bold">Каталог запчастей</h2>
        <div className="flex flex-wrap gap-2 ml-auto">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-all ${filter === c ? "bg-primary text-primary-foreground border-primary" : "bg-white border-border hover:border-primary text-foreground"}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(p => (
          <div key={p.id} className="section-card p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-medium text-sm leading-snug">{p.name}</p>
              <div className={`flex items-center gap-1 text-xs font-semibold flex-shrink-0 ${stockColor[p.stock]}`}>
                <Icon name={stockIcon[p.stock]} size={13} fallback="Circle" />
                {p.stock}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Система: <span className="text-foreground">{p.system}</span></p>
              <p className="text-xs text-muted-foreground">Артикул: <span className="font-mono text-foreground">{p.originalNumber}</span></p>
              <p className="text-xs text-muted-foreground">Категория: {p.category}</p>
              {p.linked.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.linked.map(l => (
                    <span key={l} className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">{l}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Service ──────────────────────────────────────────────────────────────────
function Service() {
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

// ─── AI Chat ──────────────────────────────────────────────────────────────────
function AIChat({ km }: { km: number }) {
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

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [section, setSection] = useState<NavSection>("dashboard");
  const [km, setKm] = useState(INITIAL_KM);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-[hsl(var(--sidebar-background))] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-2.5">
            <div className="bg-[hsl(var(--sidebar-primary))] rounded-lg p-1.5">
              <Icon name="Bike" size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display font-bold text-white leading-tight text-sm tracking-wide">GSX-S1000</p>
              <p className="text-xs opacity-60" style={{ color: "hsl(var(--sidebar-foreground))" }}>{MOTO.year} · {km.toLocaleString()} км</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              className={`sidebar-item w-full ${section === item.id ? "active" : ""}`}
            >
              <Icon name={item.icon} size={18} fallback="Circle" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-[hsl(var(--sidebar-border))]">
          <p className="text-xs opacity-40 font-mono" style={{ color: "hsl(var(--sidebar-foreground))" }}>v1.0 · 2026</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-border px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
              <Icon name="Menu" size={20} />
            </button>
            <h1 className="font-display font-semibold text-base tracking-wide">
              {NAV_ITEMS.find(n => n.id === section)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon name="Gauge" size={14} />
            <span className="font-mono font-medium">{km.toLocaleString()} км</span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {section === "dashboard" && <Dashboard km={km} setKm={setKm} />}
          {section === "systems" && <Systems />}
          {section === "manual" && <Manual />}
          {section === "maintenance" && <Maintenance km={km} />}
          {section === "parts" && <Parts />}
          {section === "service" && <Service />}
          {section === "ai" && <AIChat km={km} />}
        </main>
      </div>
    </div>
  );
}
