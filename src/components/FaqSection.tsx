import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQ_LIST } from '../data/landingData';

export const FaqSection: React.FC = () => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');

  const toggleFaq = (id: string) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="faq" className="scroll-mt-20 py-24 md:py-32 bg-[#0B0F17] border-b border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <span className="px-3 py-1 rounded-full bg-slate-900/80 text-emerald-400 text-xs font-bold uppercase tracking-wider border border-emerald-500/20 backdrop-blur-sm">
            Especificaciones Técnicas
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Base de Conocimiento
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Resolución de dudas sobre integración, infraestructura y privacidad de datos.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQ_LIST.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-900/40 rounded-2xl border border-slate-800/80 overflow-hidden transition-all shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm"
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-slate-800/50 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base sm:text-lg font-bold text-slate-200">
                      {faq.question}
                    </span>
                    {faq.badge && (
                      <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold shrink-0 border border-emerald-500/30">
                        {faq.badge}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-400' : 'text-slate-500'
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-sm sm:text-base text-slate-400 leading-relaxed border-t border-slate-800/80 pt-4">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
