import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { apiGet, apiPost, NavSection, MaintenanceLogEntry, INITIAL_KM, MOTO, NAV_ITEMS } from "@/components/moto/moto.types";
import { Dashboard, Systems, Manual } from "@/components/moto/MotoSections";
import { Maintenance, Parts, Service, AIChat } from "@/components/moto/MotoMaintenance";
import { ProfileSection, MotoProfile } from "@/components/moto/ProfileSection";

export default function Index() {
  const [section, setSection] = useState<NavSection>("dashboard");
  const [km, setKm] = useState(INITIAL_KM);
  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceLogEntry[]>([]);
  const [profiles, setProfiles] = useState<MotoProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Загружаем данные из БД при старте
  useEffect(() => {
    apiGet().then(data => {
      if (data.km) setKm(data.km);
      if (data.maintenance_log) setMaintenanceLog(data.maintenance_log);
      if (data.profiles) setProfiles(data.profiles);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Сохранение пробега
  const handleSetKm = useCallback(async (newKm: number) => {
    setKm(newKm);
    await apiPost({ action: "update_km", km: newKm });
  }, []);

  // Добавление записи ТО
  const handleAddLog = useCallback(async (entry: { operation: string; done_km: number; done_date: string; note: string }) => {
    const res = await apiPost({ action: "add_maintenance", ...entry });
    if (res.id) {
      setMaintenanceLog(prev => [{ id: res.id, ...entry, created_at: new Date().toISOString() }, ...prev]);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-display tracking-wide">Загружаю данные...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 bg-[hsl(var(--sidebar-background))] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
          {(() => {
            const active = profiles.find(p => p.is_active);
            return (
              <div className="flex items-center gap-2.5">
                <div className="bg-[hsl(var(--sidebar-primary))] rounded-lg p-1.5 flex-shrink-0">
                  <Icon name="Bike" size={20} className="text-white" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-white leading-tight text-sm tracking-wide truncate">
                    {active ? `${active.brand} ${active.model}` : MOTO.model}
                  </p>
                  <p className="text-xs opacity-60 truncate" style={{ color: "hsl(var(--sidebar-foreground))" }}>
                    {active ? active.year : MOTO.year} · {km.toLocaleString()} км
                  </p>
                </div>
              </div>
            );
          })()}
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
        <header className="sticky top-0 z-10 backdrop-blur border-b px-4 lg:px-6 py-3 flex items-center justify-between" style={{ backgroundColor: "hsl(var(--card) / 0.8)", borderColor: "hsl(var(--border) / 0.5)" }}>
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
          {section === "dashboard" && <Dashboard km={km} setKm={handleSetKm} />}
          {section === "profile" && <ProfileSection profiles={profiles} onProfilesChange={setProfiles} />}
          {section === "systems" && <Systems />}
          {section === "manual" && <Manual />}
          {section === "maintenance" && <Maintenance km={km} maintenanceLog={maintenanceLog} onAddLog={handleAddLog} />}
          {section === "parts" && <Parts />}
          {section === "service" && <Service />}
          {section === "ai" && <AIChat km={km} />}
        </main>
      </div>
    </div>
  );
}