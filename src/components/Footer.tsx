import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#030407] text-[#E2E5E8] pt-16 pb-12 border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/60">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 text-slate-950"
                >
                  <path d="M3 20L12 4L21 20" />
                  <path d="M7 13H17" />
                  <path d="M12 9V17" strokeWidth="2" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                ABARROTES <span className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-slate-950 ml-1">IA</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Plataforma autónoma de inteligencia de compras y gestión de inventario dimensional para el retail moderno.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Infraestructura Segura • Encriptación End-to-End</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Arquitectura
            </span>
            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <a href="#product-showcase-3d" className="hover:text-emerald-400 transition-colors">
                  Visualización Dimensional
                </a>
              </li>
              <li>
                <a href="#ai-advisor" className="hover:text-emerald-400 transition-colors">
                  Motor de Inventario
                </a>
              </li>
              <li>
                <a href="#features-system" className="hover:text-emerald-400 transition-colors">
                  Red Neuronal Mayorista
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-emerald-400 transition-colors">
                  Documentación Técnica
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Legal */}
          <div className="md:col-span-4 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Compromiso de Operación
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Los modelos de telemetría y sugerencias volumétricas se basan en extrapolaciones estadísticas. Recomendamos validar la primera iteración de compras con las métricas físicas del establecimiento.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Desarrollado para escalar operaciones físicas.
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            © {new Date().getFullYear()} Abarrotes IA. Todos los derechos reservados.
          </span>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacidad de Datos</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Acuerdos de Nivel de Servicio (SLA)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
