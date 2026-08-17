import React, { useState } from 'react';
import {
  Building2,
  Phone,
  Mail,
  Truck,
  Star,
  Plus,
  DollarSign,
  Tag,
  ShieldCheck,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { CrmSupplierPartner } from '../../../types';

interface CrmSuppliersPartnersViewProps {
  suppliers: CrmSupplierPartner[];
  onCreateSupplier: (supp: Partial<CrmSupplierPartner>) => Promise<void>;
}

export const CrmSuppliersPartnersView: React.FC<CrmSuppliersPartnersViewProps> = ({
  suppliers,
  onCreateSupplier
}) => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [commercialTerms, setCommercialTerms] = useState('Contado comercial / Transferencia');
  const [leadTimeDays, setLeadTimeDays] = useState(1);
  const [minOrderAmount, setMinOrderAmount] = useState(1500);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreateSupplier({
      name,
      contactPerson,
      phone,
      email,
      commercialTerms,
      leadTimeDays: Number(leadTimeDays),
      minOrderAmount: Number(minOrderAmount),
      categories: ['Abarrotes', 'Bebidas'],
      coverage: 'CDMX y Área Metropolitana',
      reliabilityScore: 92,
      score: 9.2,
      activePromosCount: 3
    });
    setName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" /> Directorio de Proveedores Mayoristas & Socios
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Condiciones comerciales, plazos de entrega, umbrales mínimos y promociones activas
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-lg shadow-amber-900/30"
        >
          <Plus className="w-4 h-4" /> Registrar Proveedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supp) => (
          <div
            key={supp.id}
            className="p-5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-white text-base">{supp.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-amber-400">{supp.score}</span> / 10 • Confiabilidad: {supp.reliabilityScore}%
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono font-semibold">
                {supp.activePromosCount} Promos
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <strong className="text-slate-400">Contacto:</strong> {supp.contactPerson}
              </div>
              {supp.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-400" /> {supp.phone}
                </div>
              )}
              {supp.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" /> {supp.email}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-900 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Tiempo Entrega</span>
                <p className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" /> {supp.leadTimeDays} {supp.leadTimeDays === 1 ? 'día' : 'días'}
                </p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[11px]">Pedido Mínimo</span>
                <p className="font-bold text-emerald-400 mt-0.5">
                  ${supp.minOrderAmount.toLocaleString()} MXN
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
              <span className="font-medium text-slate-300">Condición:</span> {supp.commercialTerms}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" /> Registrar Nuevo Proveedor Mayorista
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nombre Comercial del Proveedor</label>
                <input
                  type="text"
                  placeholder="Ej: Distribuidora Mayorista del Valle"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Persona de Contacto / Vendedor</label>
                <input
                  type="text"
                  placeholder="Ej: Lic. Carlos Ramírez"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="55-1234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="ventas@proveedor.mx"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Plazo Entrega (Días)</label>
                  <input
                    type="number"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Pedido Mínimo (MXN)</label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Condiciones Comerciales</label>
                <input
                  type="text"
                  value={commercialTerms}
                  onChange={(e) => setCommercialTerms(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 text-white font-semibold"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
