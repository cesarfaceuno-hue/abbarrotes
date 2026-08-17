import React, { useState } from 'react';
import { 
  Sliders, 
  Store, 
  MapPin, 
  Percent, 
  Clock, 
  Save, 
  CheckCircle, 
  ShieldAlert, 
  DollarSign,
  Layers,
  Database
} from 'lucide-react';

export const SystemConfigView: React.FC = () => {
  const [storeName, setStoreName] = useState('Abarrotes Don Pedro');
  const [alcaldia, setAlcaldia] = useState('Cuauhtémoc (CDMX Centro)');
  const [minMarginPercent, setMinMarginPercent] = useState(18);
  const [stockoutWarningDays, setStockoutWarningDays] = useState(3);
  const [priceShockThreshold, setPriceShockThreshold] = useState(12);
  const [autoReorderApproval, setAutoReorderApproval] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-800 font-bold text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-slate-700" /> Configuración Global del Sistema
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">
              Tenant: tenant-cdmx-01
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1D20] mt-2">
            Parámetros Operativos & Umbrales de Negocio
          </h1>
          <p className="text-sm text-[#5A626A] mt-1">
            Configura márgenes mínimos, reglas de detección de arbitraje, umbrales de agotamiento y comportamiento del Store Brain.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0F5132] hover:bg-[#198754] text-white rounded-xl font-bold text-sm shadow-sm transition cursor-pointer self-start md:self-auto"
        >
          <Save className="w-4 h-4" /> Guardar Configuración
        </button>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#0F5132] text-sm rounded-xl font-medium flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>Configuración guardada y sincronizada con Store Brain y la base de datos central.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Store & Geography Config */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#1A1D20] flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-700" />
            <span>Perfil de la Tienda & Ubicación Geográfica</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Comercial de la Tienda</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-sm font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Alcaldía / Zona de CDMX (Para Logística & Rutas)</label>
              <select
                value={alcaldia}
                onChange={(e) => setAlcaldia(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl text-sm font-medium text-slate-800"
              >
                <option value="Cuauhtémoc (CDMX Centro)">Cuauhtémoc (CDMX Centro)</option>
                <option value="Iztapalapa (Central de Abasto)">Iztapalapa (Central de Abasto)</option>
                <option value="Gustavo A. Madero">Gustavo A. Madero</option>
                <option value="Benito Juárez">Benito Juárez</option>
                <option value="Miguel Hidalgo">Miguel Hidalgo</option>
                <option value="Coyoacán">Coyoacán</option>
                <option value="Venustiano Carranza">Venustiano Carranza</option>
                <option value="Álvaro Obregón">Álvaro Obregón</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Moneda Principal de Operación</label>
              <input
                type="text"
                disabled
                value="MXN (Peso Mexicano - Redondeo a 2 decimales)"
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-600"
              />
            </div>
          </div>
        </div>

        {/* Business Logic & Thresholds */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#1A1D20] flex items-center gap-2">
            <Percent className="w-4 h-4 text-emerald-700" />
            <span>Márgenes & Reglas de Inteligencia Financiera</span>
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Margen Mínimo Aceptable por Producto</label>
                <span className="text-xs font-black text-emerald-700">{minMarginPercent}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                value={minMarginPercent}
                onChange={(e) => setMinMarginPercent(Number(e.target.value))}
                className="w-full accent-[#0F5132]"
              />
              <p className="text-[11px] text-slate-400">Si el margen cae por debajo de este %, el sistema emitirá una alerta crítica.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Umbral de Alerta de Agotamiento (Días de Cobertura)</label>
                <span className="text-xs font-black text-amber-700">{stockoutWarningDays} días</span>
              </div>
              <input
                type="range"
                min={1}
                max={14}
                value={stockoutWarningDays}
                onChange={(e) => setStockoutWarningDays(Number(e.target.value))}
                className="w-full accent-[#0F5132]"
              />
              <p className="text-[11px] text-slate-400">Alerta de resurtido cuando el stock restante alcance este número de días según la velocidad de venta.</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Alerta de Shock de Precio Mayorista (%)</label>
                <span className="text-xs font-black text-rose-700">±{priceShockThreshold}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={30}
                value={priceShockThreshold}
                onChange={(e) => setPriceShockThreshold(Number(e.target.value))}
                className="w-full accent-[#0F5132]"
              />
              <p className="text-[11px] text-slate-400">Detecta subidas o caídas abruptas en Scorpion, Zorro o Mayoreo Total.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Human-in-the-loop Automation Policies */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-[#1A1D20] flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-700" />
          <span>Políticas de Aprobación & Nivel de Autonomía de Agentes</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] space-y-2">
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-black rounded">NIVEL 1</span>
            <h4 className="font-bold text-sm text-slate-800">Recomendaciones & Alertas</h4>
            <p className="text-xs text-slate-500">Los 11 agentes analizan datos y sugieren oportunidades de compra en tiempo real.</p>
            <span className="text-xs font-bold text-emerald-700 block">✓ Siempre Activo</span>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] space-y-2">
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded">NIVEL 2 & 3</span>
            <h4 className="font-bold text-sm text-slate-800">Preparar & Aprobación Humana</h4>
            <p className="text-xs text-slate-500">Generación de órdenes de compra con 1-clic que requieren confirmación explícita del tendero.</p>
            <span className="text-xs font-bold text-emerald-700 block">✓ Recomendado (Human-in-the-loop)</span>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] space-y-2">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded">NIVEL 4</span>
            <h4 className="font-bold text-sm text-slate-800">Auto-Actualización de Precios</h4>
            <p className="text-xs text-slate-500">Actualizar precios sugeridos automáticamente al registrarse ofertas mayoristas menores.</p>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoReorderApproval}
                onChange={(e) => setAutoReorderApproval(e.target.checked)}
                className="w-4 h-4 accent-[#0F5132] rounded"
              />
              <span className="text-xs font-bold text-slate-700">Habilitar Auto-Aplicación</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
