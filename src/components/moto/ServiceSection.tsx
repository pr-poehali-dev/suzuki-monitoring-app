import { useState } from "react";
import Icon from "@/components/ui/icon";
import { SERVICE_DATA, AI_SUGGESTIONS, AI_RESPONSES, ChatMessage } from "./moto.types";
import { MotoProfile } from "./ProfileSection";

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
export function AIChat({ km, activeProfile }: { km: number; activeProfile?: MotoProfile }) {
  const motoName = activeProfile
    ? `${activeProfile.brand} ${activeProfile.model} ${activeProfile.year}`
    : "Suzuki GSX-S1000 2022";

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: `Привет! Я AI-помощник для вашего ${motoName}.\n\nТекущий пробег: ${km.toLocaleString()} км. Знаю историю обслуживания и состояние всех систем. Задайте вопрос — отвечу по вашей ситуации.`,
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
        `Хороший вопрос о ${motoName}! По вашему пробегу ${km.toLocaleString()} км: мотоцикл в целом в норме, но рекомендую проверить статус регламентных работ. Уточните вопрос — дам более конкретный ответ.`;
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
          <p className="text-muted-foreground text-xs">{motoName} · {km.toLocaleString()} км</p>
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