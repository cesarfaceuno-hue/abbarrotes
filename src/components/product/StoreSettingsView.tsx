import React, { useState } from 'react';
import { 
  Store, 
  User, 
  MapPin, 
  Smartphone, 
  Clock, 
  Database, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Layers,
  Building2,
  Lock,
  Download
} from 'lucide-react';
import { StoreProfile, TenantStore } from '../../types';
import { MULTI_TENANT_STORES } from '../../data/productData';

interface StoreSettingsViewProps {
  storeProfile: StoreProfile;
  onUpdateProfile: (profile: StoreProfile) => void;
  onSelectTenantStore: (tenant: TenantStore) => void;
  onResetSampleData: () => void;
}

export const StoreSettingsView: React.FC<StoreSettingsViewProps> = ({
  storeProfile,
  onUpdateProfile,
  onSelectTenantStore,
  onResetSampleData,
}) => {
  const [storeName, setStoreName] = useState(storeProfile.storeName);
  const [ownerName, setOwnerName] = useState(storeProfile.ownerName);
  const [phone, setPhone] = useState(storeProfile.phone);
  const [zone, setZone] = useState(storeProfile.zone);
  const [reportTime, setReportTime] = useState<string>('06:30 AM');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('store-1');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = () => {
    onUpdateProfile({
      ...storeProfile,
      storeName,
      ownerName,
      phone,
      zone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSwitchTenant = (tenantId: string) => {
    setSelectedTenantId(tenantId);
    const found = MULTI_TENANT_STORES.find((t) => t.id === tenantId);
    if (found) {
      setStoreName(found.name);
      setOwnerName(found.owner);
      setZone(found.zone);
      onSelectTenantStore(found);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
          Configuración de Tienda & Multi-Tenancy
        </h1>
        <p className="text-xs sm:text-sm text-[#5A626A]">
          Administra la identidad de tu negocio, aislamiento de datos, canal de WhatsApp y fuentes mayoristas.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#0D6832] font-bold text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
          <span>¡Configuración de tienda guardada exitosamente!</span>
        </div>
      )}

      {/* Multi-Tenant Store Selector Card */}
      <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E5E8]">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#0F5132]" />
            <h2 className="text-base font-extrabold text-[#1A1D20]">
              Entorno Multi-Tenant Activo (Simulador de Negocio)
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#0D6832] font-mono text-[10px] font-black">
            TENANT ISOLATED
          </span>
        </div>

        <p className="text-xs text-[#5A626A]">
          Selecciona una tienda para verificar cómo el sistema aísla rigurosamente los inventarios, costos privados y rotaciones de cada comercio:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {MULTI_TENANT_STORES.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSwitchTenant(t.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                selectedTenantId === t.id
                  ? 'bg-emerald-50/80 border-[#0F5132] ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-[#F8F9FA] border-[#E2E5E8] hover:bg-white'
              }`}
            >
              <div className="font-extrabold text-sm text-[#1A1D20]">{t.name}</div>
              <div className="text-xs text-[#5A626A]">{t.owner}</div>
              <div className="text-[11px] text-[#0D6832] font-bold">{t.zone}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-lg font-extrabold text-[#1A1D20]">
          Información del Comercio
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Nombre de la Tienda
            </label>
            <div className="relative">
              <Store className="w-4 h-4 text-[#5A626A] absolute left-3 top-3.5" />
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E5E8] text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Nombre del Comerciante
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#5A626A] absolute left-3 top-3.5" />
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E5E8] text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              Zona comercial / Ciudad
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#5A626A] absolute left-3 top-3.5" />
              <input
                type="text"
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E5E8] text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1A1D20] mb-1">
              WhatsApp para Reporte Matutino
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-[#5A626A] absolute left-3 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E5E8] text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Delivery Time Selection */}
        <div className="pt-2 border-t border-[#E2E5E8] space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0F5132]" />
            <h3 className="text-sm font-bold text-[#1A1D20]">
              Hora de envío del reporte diario matutino
            </h3>
          </div>
          <div className="flex gap-2">
            {['06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM'].map((t) => (
              <button
                key={t}
                onClick={() => setReportTime(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  reportTime === t
                    ? 'bg-[#0F5132] text-white shadow-2xs'
                    : 'bg-[#F8F9FA] border border-[#E2E5E8] text-[#5A626A] hover:bg-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Security & Tenant Guarantee Pill */}
        <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0F5132]" />
              <span className="text-xs font-bold text-[#1A1D20]">
                Aislamiento y Privacidad de Datos:
              </span>
            </div>
            <span className="text-xs font-bold text-[#0D6832] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Confidencial
            </span>
          </div>
          <p className="text-xs text-[#5A626A]">
            Tus costos y rotación nunca se comparten con otros tenderos ni con marcas sin tu consentimiento explícito.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white font-bold text-sm transition-all cursor-pointer shadow-sm"
        >
          Guardar Cambios de Tienda
        </button>
      </div>

      {/* Demo Controls & Data Reset */}
      <div className="bg-white rounded-3xl border border-[#E2E5E8] p-6 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-[#1A1D20]">Restablecer datos de muestra</h3>
            <p className="text-xs text-[#5A626A]">
              Recarga el catálogo inicial con productos, precios, scrapers y oportunidades de prueba.
            </p>
          </div>

          <button
            onClick={onResetSampleData}
            className="px-3.5 py-2 rounded-xl bg-[#F8F9FA] hover:bg-[#F1F3F5] text-xs font-bold text-[#1A1D20] border border-[#E2E5E8] flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

    </div>
  );
};
