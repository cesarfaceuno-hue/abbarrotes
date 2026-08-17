import React, { useState } from 'react';
import { Menu, X, ShieldCheck, ArrowRight, Store, Sparkles } from 'lucide-react';

interface NavbarProps {
  onOpenTrialModal: () => void;
  onOpenAppView?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenTrialModal, onOpenAppView }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#07090E]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-4 group">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                ABARROTES <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black tracking-[0.2em] uppercase">IA</span>
              </span>
              <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest">
                CORE OPERATING SYSTEM
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-10 text-[13px] font-black uppercase tracking-widest text-slate-400">
            <a href="#product-showcase-3d" className="hover:text-emerald-400 transition-colors">
              Módulos
            </a>
            <a href="#ai-advisor" className="hover:text-emerald-400 transition-colors">
              Inteligencia
            </a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">
              Planes
            </a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">
              Soporte
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-5">
            {onOpenAppView && (
              <button
                onClick={onOpenAppView}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 transition-all cursor-pointer backdrop-blur-md"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>ACCEDER A TERMINAL</span>
              </button>
            )}

            <button
              onClick={onOpenTrialModal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>INICIAR DESPLIEGUE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-[#1A1D20] hover:bg-[#F1F3F5] transition-colors cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/5 bg-[#07090E] px-4 pt-3 pb-8 space-y-6">
          <div className="flex flex-col space-y-2 text-xs font-black uppercase tracking-widest text-slate-400">
            <a
              href="#product-showcase-3d"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-emerald-400 transition-all"
            >
              Módulos
            </a>
            <a
              href="#ai-advisor"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-emerald-400 transition-all"
            >
              Inteligencia
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-emerald-400 transition-all"
            >
              Planes
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-4 py-3 rounded-xl hover:bg-white/5 hover:text-emerald-400 transition-all"
            >
              Soporte
            </a>
          </div>
          <div className="pt-6 border-t border-white/5 space-y-3">
            {onOpenAppView && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAppView();
                }}
                className="w-full py-4 px-4 rounded-xl bg-white/5 text-white font-black text-xs text-center flex items-center justify-center gap-2 border border-white/10 shadow-xl"
              >
                <Store className="w-4 h-4 text-emerald-400" />
                <span>ACCEDER A TERMINAL</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTrialModal();
              }}
              className="w-full py-4 px-4 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs text-center flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
            >
              <ShieldCheck className="w-5 h-5 text-slate-900/40" />
              <span>INICIAR DESPLIEGUE</span>
            </button>
            <p className="text-center text-[10px] text-slate-500 mt-4 font-black uppercase tracking-widest">
              SLA 99.9% • ENCRIPTACIÓN AES-256
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
