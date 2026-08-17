import React, { useState } from 'react';
import { X, CheckCircle2, Store, User, MapPin, Smartphone, ArrowRight, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { StoreProfile } from '../../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StoreProfile;
  onSaveProfile: (profile: StoreProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [step, setStep] = useState<number>(1);
  const [storeName, setStoreName] = useState(currentProfile.storeName || 'Abarrotes La Lupita');
  const [ownerName, setOwnerName] = useState(currentProfile.ownerName || 'Don Pedro Gómez');
  const [phone, setPhone] = useState(currentProfile.phone || '55 4123 8920');
  const [zone, setZone] = useState(currentProfile.zone || 'Iztapalapa, CDMX');
  const [posType, setPosType] = useState<StoreProfile['posType']>(currentProfile.posType || 'notas');
  const [selectedInitialProducts, setSelectedInitialProducts] = useState<string[]>([
    'coca-600',
    'leche-lala',
    'jabon-roma',
    'sabritas-sal',
  ]);

  if (!isOpen) return null;

  const popularStarterProducts = [
    { id: 'coca-600', name: 'Coca-Cola 600 ml', cat: 'Bebidas' },
    { id: 'leche-lala', name: 'Leche Lala Entera 1L', cat: 'Lácteos' },
    { id: 'jabon-roma', name: 'Jabón Roma 1 kg', cat: 'Limpieza' },
    { id: 'sabritas-sal', name: 'Papas Sabritas 42g', cat: 'Botanas' },
    { id: 'pan-bimbo', name: 'Pan Blanco Bimbo Grande', cat: 'Panadería' },
    { id: 'huevo-blanco', name: 'Huevo Blanco 1 kg', cat: 'Abarrotes' },
    { id: 'aceite-123', name: 'Aceite 1-2-3 1L', cat: 'Abarrotes' },
    { id: 'atun-dolores', name: 'Atún Dolores 140g', cat: 'Abarrotes' },
  ];

  const toggleProduct = (id: string) => {
    if (selectedInitialProducts.includes(id)) {
      setSelectedInitialProducts(selectedInitialProducts.filter((p) => p !== id));
    } else {
      setSelectedInitialProducts([...selectedInitialProducts, id]);
    }
  };

  const handleFinish = () => {
    onSaveProfile({
      ...currentProfile,
      storeName: storeName || 'Mi Tiendita',
      ownerName: ownerName || 'Comerciante',
      phone,
      zone,
      posType,
      onboardingCompleted: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E2E5E8] shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-[#5A626A] hover:bg-[#F1F3F5] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Indicator */}
        <div className="flex items-center gap-2">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-[#0F5132]' : 'bg-[#E2E5E8]'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-[#0F5132]' : 'bg-[#E2E5E8]'}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-[#0F5132]' : 'bg-[#E2E5E8]'}`} />
        </div>

        {/* STEP 1: Datos de la Tienda */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6832]">
                Paso 1 de 3 • Tu Negocio
              </span>
              <h2 className="text-2xl font-extrabold text-[#1A1D20]">
                Configura tu Tienda
              </h2>
              <p className="text-xs sm:text-sm text-[#5A626A]">
                Para personalizar las oportunidades y proveedores de tu zona.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Nombre de tu Tienda / Abarrotes
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-[#5A626A] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ej. Abarrotes La Lupita"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E5E8] text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Tu Nombre (Don / Doña)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5A626A] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Ej. Don Pedro Gómez"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E5E8] text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  Ubicación / Colonia y Ciudad
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#5A626A] absolute left-3 top-3.5" />
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    placeholder="Ej. Iztapalapa, CDMX / San Pedro, N.L."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E5E8] text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A1D20] mb-1">
                  WhatsApp para recibir el reporte de 30 segundos cada mañana
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 text-[#5A626A] absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ej. 55 1234 5678"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E2E5E8] text-sm focus:border-[#0F5132] focus:ring-1 focus:ring-[#0F5132] outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Continuar al Paso 2</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Sistema de Registro */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6832]">
                Paso 2 de 3 • Tu Forma de Trabajar
              </span>
              <h2 className="text-2xl font-extrabold text-[#1A1D20]">
                ¿Cómo registras tu tienda hoy?
              </h2>
              <p className="text-xs sm:text-sm text-[#5A626A]">
                Recuerda: <strong>no necesitas cambiar tu sistema</strong>. Abarrotes IA se adapta a ti.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {[
                { id: 'notas' as const, title: 'Cuaderno, notas y facturas en papel', sub: 'Usas notas de surtido de los repartidores y cuentas a mano.' },
                { id: 'pulpos' as const, title: 'Sistema POS (Pulpos / Eleventa / etc.)', sub: 'Tienes una computadora o caja de cobro en mostrador.' },
                { id: 'excel' as const, title: 'Hojas de cálculo en Excel / Google Sheets', sub: 'Anotas tus compras e inventario en una tabla.' },
                { id: 'ninguno' as const, title: 'Solo uso el teléfono o escáner en mostrador', sub: 'Capturarás con el lector de código de barras de Abarrotes IA.' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPosType(opt.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    posType === opt.id
                      ? 'bg-emerald-50/80 border-[#0F5132] ring-2 ring-emerald-500/20'
                      : 'bg-[#F8F9FA] border-[#E2E5E8] hover:bg-white'
                  }`}
                >
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1D20]">{opt.title}</h4>
                    <p className="text-xs text-[#5A626A] mt-0.5">{opt.sub}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center ${
                      posType === opt.id
                        ? 'border-[#0F5132] bg-[#0F5132] text-white'
                        : 'border-[#E2E5E8] bg-white'
                    }`}
                  >
                    {posType === opt.id && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] text-xs font-bold text-[#5A626A] hover:bg-[#F1F3F5] cursor-pointer"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3.5 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>Siguiente: Productos Clave</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Productos Iniciales */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0D6832]">
                Paso 3 de 3 • Tus Productos Estrella
              </span>
              <h2 className="text-2xl font-extrabold text-[#1A1D20]">
                Selecciona tus 3-4 productos más vendidos
              </h2>
              <p className="text-xs sm:text-sm text-[#5A626A]">
                Con estos comenzaremos a buscar las mejores opciones de compra hoy mismo.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1 max-h-56 overflow-y-auto pr-1">
              {popularStarterProducts.map((p) => {
                const isSelected = selectedInitialProducts.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggleProduct(p.id)}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-[#0F5132] font-bold text-[#0F5132]'
                        : 'bg-[#F8F9FA] border-[#E2E5E8] text-[#1A1D20] hover:bg-white'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">{p.name}</span>
                      <span className="text-[10px] text-[#5A626A]">{p.cat}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#198754] shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-100/70 text-[#0D6832] text-xs font-semibold flex items-center gap-2 border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-[#198754] shrink-0" />
              <span>Podrás escanear o agregar todo tu catálogo en cualquier momento.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] text-xs font-bold text-[#5A626A] hover:bg-[#F1F3F5] cursor-pointer"
              >
                Atrás
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3.5 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Entrar a Mi Tienda</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
