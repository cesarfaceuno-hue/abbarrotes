import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Store, Phone, MapPin, User, ArrowRight } from 'lucide-react';
import { TrialRegistrationData } from '../types';

interface TrialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TrialModal: React.FC<TrialModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<TrialRegistrationData>({
    ownerName: '',
    storeName: '',
    phone: '',
    postalCode: '',
    hasPos: 'si',
    currentPosName: '',
  });

  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ownerName.trim() || !formData.phone.trim()) {
      return;
    }
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      ownerName: '',
      storeName: '',
      phone: '',
      postalCode: '',
      hasPos: 'si',
      currentPosName: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative bg-white rounded-3xl border border-[#E2E5E8] shadow-2xl max-w-lg w-full p-6 sm:p-8 z-10 overflow-hidden my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#5A626A] hover:bg-[#F1F3F5] transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            {/* Header */}
            <div className="space-y-2 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F5E9] text-[#0D6832] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#198754]" />
                <span>Prueba gratuita de 30 días</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#1A1D20]">
                Empieza a comprar mejor
              </h2>
              <p className="text-xs sm:text-sm text-[#5A626A]">
                Déjanos tus datos básicos. Nos pondremos en contacto contigo para configurar tus primeros productos y activar tu mes de prueba sin costo.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Owner Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1D20] mb-1.5">
                  Tu nombre completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5A626A] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="Ej. Pedro Gómez"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] text-sm text-[#1A1D20] focus:outline-none focus:border-[#0F5132] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Store Name & Postal Code Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1D20] mb-1.5">
                    Nombre de tu tienda
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#5A626A] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="Ej. Abarrotes La Lupita"
                      value={formData.storeName}
                      onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] text-sm text-[#1A1D20] focus:outline-none focus:border-[#0F5132] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1D20] mb-1.5">
                    Código Postal (Zona)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#5A626A] absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="Ej. 06700"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] text-sm text-[#1A1D20] focus:outline-none focus:border-[#0F5132] focus:bg-white transition-colors tabular-nums"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp / Phone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1D20] mb-1.5">
                  Teléfono / WhatsApp de contacto *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#5A626A] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 55 1234 5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] text-sm text-[#1A1D20] focus:outline-none focus:border-[#0F5132] focus:bg-white transition-colors tabular-nums"
                  />
                </div>
              </div>

              {/* POS Status radio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1D20] mb-1.5">
                  ¿Utilizas actualmente algún sistema de cobro / POS?
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.hasPos === 'si'
                        ? 'bg-emerald-50 border-[#0F5132] text-[#0F5132]'
                        : 'bg-[#F8F9FA] border-[#E2E5E8] text-[#5A626A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasPos"
                      value="si"
                      checked={formData.hasPos === 'si'}
                      onChange={() => setFormData({ ...formData, hasPos: 'si' })}
                      className="sr-only"
                    />
                    <span>Sí tengo POS</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.hasPos === 'no'
                        ? 'bg-emerald-50 border-[#0F5132] text-[#0F5132]'
                        : 'bg-[#F8F9FA] border-[#E2E5E8] text-[#5A626A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasPos"
                      value="no"
                      checked={formData.hasPos === 'no'}
                      onChange={() => setFormData({ ...formData, hasPos: 'no' })}
                      className="sr-only"
                    />
                    <span>No tengo</span>
                  </label>

                  <label
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                      formData.hasPos === 'libreta'
                        ? 'bg-emerald-50 border-[#0F5132] text-[#0F5132]'
                        : 'bg-[#F8F9FA] border-[#E2E5E8] text-[#5A626A]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasPos"
                      value="libreta"
                      checked={formData.hasPos === 'libreta'}
                      onChange={() => setFormData({ ...formData, hasPos: 'libreta' })}
                      className="sr-only"
                    />
                    <span>Uso libreta</span>
                  </label>
                </div>
              </div>

              {formData.hasPos === 'si' && (
                <div>
                  <input
                    type="text"
                    placeholder="¿Qué sistema usas? (Opcional)"
                    value={formData.currentPosName}
                    onChange={(e) => setFormData({ ...formData, currentPosName: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-[#F8F9FA] border border-[#E2E5E8] text-xs text-[#1A1D20] focus:outline-none focus:border-[#0F5132]"
                  />
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#0F5132] hover:bg-[#198754] text-white font-bold text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Solicitar acceso a prueba de 30 días</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#5A626A] pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#198754]" />
                <span>100% gratuito • Sin tarjeta requerida • Respetamos tu privacidad</span>
              </div>

            </form>
          </div>
        ) : (
          /* Confirmation State */
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#E8F5E9] text-[#0D6832] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-extrabold text-[#1A1D20]">
              ¡Solicitud recibida con éxito!
            </h3>

            <p className="text-sm text-[#5A626A] leading-relaxed max-w-sm mx-auto">
              Gracias, <strong>{formData.ownerName}</strong>. Nos comunicaremos contigo por WhatsApp al número{' '}
              <strong className="text-[#1A1D20]">{formData.phone}</strong> para coordinar la activación de tus 30 días de prueba en{' '}
              <strong>{formData.storeName || 'tu tienda'}</strong>.
            </p>

            <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E2E5E8] text-xs text-[#0F5132] font-semibold">
              Te ayudaremos paso a paso para que empieces a comparar precios desde el primer día.
            </div>

            <div className="pt-4">
              <button
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-[#0F5132] text-white font-bold text-sm hover:bg-[#198754] transition-colors cursor-pointer"
              >
                Entendido, gracias
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
