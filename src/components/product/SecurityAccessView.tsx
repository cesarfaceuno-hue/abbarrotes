import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Eye, 
  Cpu, 
  Layers,
  Terminal
} from 'lucide-react';

export const SecurityAccessView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rbac' | 'tenants' | 'audit' | 'policies'>('rbac');

  const roles = [
    { name: 'SuperAdmin (God Mode)', scope: 'Global CDMX', users: 1, permissions: ['ALL_OPERATIONS', 'TRIGGER_SCRAPERS', 'EXECUTE_CERTIFICATION', 'OVERRIDE_PRICES'] },
    { name: 'Store Owner (Tendero)', scope: 'Organización Don Pedro', users: 1, permissions: ['VIEW_DASHBOARD', 'POS_REGISTER', 'APPROVE_PURCHASES', 'CONFIG_STORE'] },
    { name: 'Cajero / Operador', scope: 'Sucursal Centro', users: 2, permissions: ['POS_REGISTER', 'BARCODE_SCAN', 'PRINT_RECEIPTS'] },
    { name: 'AI Autonomous Agent', scope: 'DataHub / Scraper Fabric', users: 11, permissions: ['READ_PRICES', 'INGEST_OBSERVATIONS', 'EVALUATE_DEMAND'] }
  ];

  const tenantTests = [
    { test: 'Cross-Tenant Inventory Isolation (Alpha vs Beta)', status: 'PASS', code: '200 Isolated', result: 'Sin fuga de datos entre organizaciones' },
    { test: 'Kardex Ledger Mutability Prevention', status: 'PASS', code: '403 Forbidden', result: 'Inmutabilidad criptográfica verificada' },
    { test: 'Unauthenticated API Request Rejection', status: 'PASS', code: '401 Unauthorized', result: 'JWT & Bearer Tokens exigidos' },
    { test: 'Least Privilege AI Execution Boundary', status: 'PASS', code: 'Bounded Sandbox', result: 'Agentes sin acceso a credenciales de pasarela' }
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-100 text-[#0F5132] font-bold text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> Gobernanza & Seguridad Multi-Tenant
            </span>
            <span className="text-xs bg-slate-900 text-white px-2 py-0.5 rounded font-mono font-bold">
              RBAC v2.4 (Least Privilege)
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1D20] mt-2">
            Control de Acceso, Roles & Aislamiento de Organizaciones
          </h1>
          <p className="text-sm text-[#5A626A] mt-1">
            Matriz de autorización estricta: Authenticated User → Role → Tenant Organization → Permission → Action.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E5E8] pb-2 overflow-x-auto">
        {[
          { id: 'rbac', label: 'Matriz de Roles (RBAC)', icon: Users },
          { id: 'tenants', label: 'Aislamiento Multi-Tenant', icon: Layers },
          { id: 'policies', label: 'Políticas Least Privilege AI', icon: Cpu },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                isActive ? 'bg-[#0F5132] text-white shadow-sm' : 'bg-white text-slate-600 hover:bg-[#F8F9FA] border border-[#E2E5E8]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((r, i) => (
              <div key={i} className="bg-white border border-[#E2E5E8] rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#1A1D20] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>{r.name}</span>
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {r.users} {r.users === 1 ? 'Usuario' : 'Usuarios'}
                  </span>
                </div>

                <div className="text-xs text-slate-600">
                  <span className="font-bold">Alcance Organizacional:</span> {r.scope}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase block mb-1.5">Permisos Asignados</span>
                  <div className="flex flex-wrap gap-1.5">
                    {r.permissions.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold rounded border border-emerald-100">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tenants' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#1A1D20] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Auditoría de Aislamiento de Datos por Organización</span>
          </h3>
          <p className="text-xs text-slate-500">
            Pruebas automatizadas de penetración interna que verifican que ningún tendero pueda consultar costos, ventas o inventarios de otra tienda.
          </p>

          <div className="space-y-3 pt-2">
            {tenantTests.map((t, idx) => (
              <div key={idx} className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-sm text-slate-800">{t.test}</span>
                  <p className="text-xs text-slate-500">{t.result}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-slate-900 text-emerald-400 font-mono text-xs font-bold rounded-lg">
                    {t.code}
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-100 text-[#0F5132] font-black text-xs rounded-lg flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-[#1A1D20] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-700" />
            <span>Contratos de Agentes bajo el Principio de Menor Privilegio</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] space-y-2">
              <h4 className="font-bold text-sm text-slate-800">1. Sandboxing de Agentes</h4>
              <p className="text-xs text-slate-500">Ningún agente de IA puede ejecutar mutaciones directas sobre saldos de caja o kardex sin pasar por la máquina de validación determinista.</p>
            </div>
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] space-y-2">
              <h4 className="font-bold text-sm text-slate-800">2. Cero Exposición de Secretos</h4>
              <p className="text-xs text-slate-500">Las llamadas del frontend nunca contienen API keys de Google Gemini ni credenciales maestras de Firestore.</p>
            </div>
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] space-y-2">
              <h4 className="font-bold text-sm text-slate-800">3. Aprobación Explícita Financiera</h4>
              <p className="text-xs text-slate-500">Las compras superiores a $500 MXN o cambios de proveedor mayorista requieren interacción humana con 1-clic.</p>
            </div>
            <div className="p-4 bg-[#F8F9FA] rounded-2xl border border-[#E2E5E8] space-y-2">
              <h4 className="font-bold text-sm text-slate-800">4. Auditoría Inmutable</h4>
              <p className="text-xs text-slate-500">Toda sugerencia o ejecución asistida por IA genera un log criptográfico con el prompt, la respuesta y el hash de decisión.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
