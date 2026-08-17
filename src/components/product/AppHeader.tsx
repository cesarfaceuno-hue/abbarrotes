import React, { useState, useEffect } from 'react';
import { Store, Bell, Search, Sparkles, ArrowLeftRight, ChevronDown, MapPin, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'motion/react';
import { StoreProfile } from '../../types';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

interface AppHeaderProps {
  storeProfile: StoreProfile;
  activeTab: string;
  onOpenOnboarding: () => void;
  onToggleViewMode: () => void;
  onOpenAiAdvisor?: () => void;
  isLandingView: boolean;
  savingsThisMonth: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  storeProfile,
  activeTab,
  onOpenOnboarding,
  onToggleViewMode,
  onOpenAiAdvisor,
  isLandingView,
  savingsThisMonth,
}) => {
  const isOnline = useNetworkStatus();

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20 shadow-[0_4px_30px_rgb(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Store Identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={onOpenOnboarding}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white flex items-center justify-center font-black shadow-[0_4px_15px_rgb(16,185,129,0.3)] text-lg">
                M
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                    Mi Abarrotero
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] tracking-wider uppercase">
                    App
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <span className="text-slate-700 font-bold">{storeProfile.storeName}</span>
                  <span className="opacity-40">•</span>
                  <span className="hidden sm:inline">{storeProfile.ownerName}</span>
                </div>
              </div>
            </motion.div>

            {/* Store Switcher / Edit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenOnboarding}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50/80 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
              title="Configurar datos de la tienda"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span className="max-w-[140px] truncate">{storeProfile.zone.split(',')[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </motion.button>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Network Indicator */}
            <div 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isOnline 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200/50'
              }`}
              title={isOnline ? 'Conexión estable' : 'Modo offline - Guardando localmente'}
            >
              {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              <span className="hidden md:inline">{isOnline ? 'En línea' : 'Modo local'}</span>
            </div>

            {/* Asesor IA (OpenAI) Quick Button */}
            {onOpenAiAdvisor && (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenAiAdvisor}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-900 hover:from-emerald-800 hover:to-emerald-950 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/10 cursor-pointer transition-all border border-emerald-500/20"
                title="Consultar al Asesor Inteligente OpenAI"
              >
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span className="hidden sm:inline">Asesor IA</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md font-extrabold hidden md:inline">
                  GPT-4o
                </span>
              </motion.button>
            )}

            {/* Monthly Value Capsule */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50/50 border border-emerald-100/50 text-xs text-emerald-800"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Ahorro detectado: <strong className="font-black tabular-nums tracking-tight ml-1 text-sm">${savingsThisMonth.toFixed(2)}</strong></span>
            </motion.div>

            {/* Toggle View: Landing Comercial ↔ App de Tienda */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onToggleViewMode}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 text-slate-800 border border-slate-100 transition-all cursor-pointer shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
            >
              <ArrowLeftRight className="w-4 h-4 text-slate-400" />
              <span className="hidden sm:inline">
                {isLandingView ? 'Ir a mi Tienda (App)' : 'Ver Landing'}
              </span>
              <span className="sm:hidden">
                {isLandingView ? 'App' : 'Landing'}
              </span>
            </motion.button>

            {/* Quick Profile / Help Avatar */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenOnboarding}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-[0_4px_15px_rgb(0,0,0,0.1)] hover:bg-slate-800 transition-colors cursor-pointer"
              title="Perfil de tienda"
            >
              {storeProfile.ownerName.charAt(0) || 'P'}
            </motion.button>
          </div>

        </div>
      </div>
    </header>
  );
};
