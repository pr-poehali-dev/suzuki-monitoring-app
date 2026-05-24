import { useState } from "react";
import Icon from "@/components/ui/icon";
import { apiPost } from "./moto.types";
import { MotoProfile, EMPTY_FORM } from "./profile.types";
import { ProfileForm } from "./ProfileForm";
import { ProfileCard } from "./ProfileCard";

export type { MotoProfile };

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
        year: Number(data.year),
        engine_cc: data.engine_cc ? Number(data.engine_cc) : null,
        color: data.color, vin: data.vin,
        purchase_date: data.purchase_date || null,
        purchase_km: Number(data.purchase_km) || 0,
        current_km: Number(data.current_km) || 0,
        notes: data.notes,
        is_active: profiles.length === 0,
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
        year: Number(data.year),
        engine_cc: data.engine_cc ? Number(data.engine_cc) : null,
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
          <ProfileForm onSave={handleCreate} onCancel={() => setShowCreate(false)} />
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
