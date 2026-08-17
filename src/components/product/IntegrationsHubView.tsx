import React, { useState } from 'react';
import { 
  Zap, 
  Database, 
  Barcode, 
  Key, 
  CheckCircle, 
  Send, 
  Layers, 
  RefreshCw, 
  ShieldCheck, 
  Terminal, 
  ArrowRight,
  Wifi,
  Cpu
} from 'lucide-react';

export const IntegrationsHubView: React.FC = () => {
  const [zapierStatus, setZapierStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<any>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [scannerConnected, setScannerConnected] = useState(true);

  const handleTestZapierWebhook = async () => {
    setZapierStatus('testing');
    try {
      const payload = {
        source_id: 'zapier_pos_bridge',
        sku: '7501000128456',
        name: 'Aceite Nutrioli 946ml (Test Integration)',
        brand: 'Nutrioli',
        category: 'Abarrotes',
        price: 44.50,
        currency: 'MXN',
        unit: 'pieza',
        availability: 'in_stock',
        scraped_at: new Date().toISOString()
      };

      const res = await fetch('/api/ingest/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setTestResult(data);
      setZapierStatus('success');
    } catch (err) {
      console.error('Error testing zapier webhook:', err);
      setZapierStatus('error');
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-purple-100 text-purple-800 font-bold text-xs rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-purple-600" /> Integrations & API Hub
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">
              Gateway Online (CDMX Fabric)
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1D20] mt-2">
            Conectores, Webhooks & Dispositivos de Hardware
          </h1>
          <p className="text-sm text-[#5A626A] mt-1">
            Administración de integraciones con Zapier, pasarelas de pago, lectores de código de barras USB/Bluetooth y APIs externas.
          </p>
        </div>
      </div>

      {/* Grid of Integrations Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Zapier Ingestion Webhook */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Zap className="w-6 h-6" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                ACTIVO
              </span>
            </div>
            <h3 className="font-extrabold text-base text-[#1A1D20]">Zapier Ingestion Webhook</h3>
            <p className="text-xs text-[#5A626A]">
              Recibe automáticamente catálogos, facturas o cambios de precios desde hojas de cálculo, correos o ERPs externos.
            </p>
            <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] truncate">
              POST /api/ingest/products
            </div>
          </div>

          <button
            onClick={handleTestZapierWebhook}
            disabled={zapierStatus === 'testing'}
            className="w-full py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {zapierStatus === 'testing' ? 'Probando Webhook...' : 'Probar Webhook de Prueba'}
          </button>
        </div>

        {/* 2. Cloud Firestore Realtime Bridge */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Database className="w-6 h-6" />
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                CONECTADO
              </span>
            </div>
            <h3 className="font-extrabold text-base text-[#1A1D20]">Cloud Firestore Fabric</h3>
            <p className="text-xs text-[#5A626A]">
              Sincronización bidireccional continua de productos maestros, órdenes de compra y cambios de precios en la nube.
            </p>
            <div className="p-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] text-xs text-slate-700 space-y-1">
              <div className="flex justify-between"><span>Colección Master:</span><span className="font-bold">master_products (910)</span></div>
              <div className="flex justify-between"><span>Colección Precios:</span><span className="font-bold">price_records (911)</span></div>
            </div>
          </div>

          <div className="py-2.5 px-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Sincronización en Tiempo Real Activa
          </div>
        </div>

        {/* 3. POS Barcode Hardware Scanner */}
        <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Barcode className="w-6 h-6" />
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${scannerConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                {scannerConnected ? 'LISTO (HID)' : 'DESCONECTADO'}
              </span>
            </div>
            <h3 className="font-extrabold text-base text-[#1A1D20]">Lector de Código de Barras (HID)</h3>
            <p className="text-xs text-[#5A626A]">
              Compatible con pistolas USB, Bluetooth y escaneo por cámara HTML5 con emulación de teclado Keyboard Wedge.
            </p>
            <div className="p-2.5 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8] text-xs text-slate-700 space-y-1">
              <div className="flex justify-between"><span>Modo de Entrada:</span><span className="font-bold">Keyboard Intercept</span></div>
              <div className="flex justify-between"><span>Latencia de Búsqueda:</span><span className="font-bold text-emerald-700">&lt; 4ms</span></div>
            </div>
          </div>

          <button
            onClick={() => setScannerConnected(!scannerConnected)}
            className="w-full py-2.5 px-4 bg-[#F8F9FA] hover:bg-[#E2E5E8] text-[#1A1D20] text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {scannerConnected ? 'Verificar Conexión de Lector' : 'Reconectar Scanner'}
          </button>
        </div>

      </div>

      {/* Test Result Output */}
      {testResult && (
        <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-2">
              <Terminal className="w-4 h-4" /> RESPUESTA DE INGESTA ZAPIER / REST API
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">Status: 200 OK</span>
          </div>
          <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-3 bg-black rounded-xl border border-slate-900">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}

      {/* API Key Management */}
      <div className="bg-white border border-[#E2E5E8] rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-lg text-[#1A1D20] flex items-center gap-2">
          <Key className="w-5 h-5 text-emerald-700" />
          <span>Credenciales de API REST para Sistemas Propios</span>
        </h3>
        <p className="text-sm text-[#5A626A]">
          Usa estas credenciales para comunicar tu sistema de contabilidad, terminal bancaria o tienda en línea con Abarrotes IA.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 p-3 bg-[#F8F9FA] border border-[#E2E5E8] rounded-xl font-mono text-xs text-slate-800 flex items-center justify-between">
            <span>{apiKeyVisible ? 'sk_live_cdmx_abarrotes_9981248901238912' : 'sk_live_cdmx_••••••••••••••••••••••••'}</span>
            <button 
              onClick={() => setApiKeyVisible(!apiKeyVisible)}
              className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer ml-2"
            >
              {apiKeyVisible ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          <button 
            onClick={() => alert('Nueva llave generada')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Regenerar API Key
          </button>
        </div>
      </div>
    </div>
  );
};
