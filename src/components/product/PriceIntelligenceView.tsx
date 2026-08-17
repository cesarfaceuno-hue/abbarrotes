import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  ShieldCheck, 
  Clock, 
  Layers, 
  ArrowUpRight, 
  ArrowDownRight,
  Play,
  Check,
  Server,
  FileSpreadsheet
} from 'lucide-react';
import { PriceRecord, ScraperJob } from '../../types';

interface PriceIntelligenceViewProps {
  priceRecords: PriceRecord[];
  scraperJobs: ScraperJob[];
  onTriggerScraper: (scraperId: string) => void;
  onTriggerAllScrapers: () => void;
}

export const PriceIntelligenceView: React.FC<PriceIntelligenceViewProps> = ({
  priceRecords,
  scraperJobs,
  onTriggerScraper,
  onTriggerAllScrapers,
}) => {
  const [activeTab, setActiveTab] = useState<'prices' | 'scrapers'>('prices');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('Todos');
  const [isScrapingGlobal, setIsScrapingGlobal] = useState(false);
  const [scrapeSuccessMsg, setScrapeSuccessMsg] = useState<string | null>(null);

  const [sheetsStats, setSheetsStats] = useState<{
    lastSyncAt: string;
    sourcesCount: number;
    productsCount: number;
    opportunitiesCount: number;
    freshnessStatus: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/sheets/read')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.dataStore) {
          setSheetsStats({
            lastSyncAt: data.lastSyncAt
              ? new Date(data.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Hace un momento',
            sourcesCount: data.dataStore.suppliers?.length || 9,
            productsCount: data.dataStore.products?.length || priceRecords.length,
            opportunitiesCount: data.dataStore.opportunities?.length || 3,
            freshnessStatus: 'FRESH',
          });
        }
      })
      .catch(() => {});
  }, [priceRecords]);

  const sources = ['Todos', 'Central de Abastos', 'Zorro', 'Scorpion', 'Preventa'];

  const filteredPrices = priceRecords.filter((p) => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = selectedSource === 'Todos' || p.source.toLowerCase().includes(selectedSource.toLowerCase());
    return matchesSearch && matchesSource;
  });

  const handleRunAll = () => {
    setIsScrapingGlobal(true);
    setScrapeSuccessMsg('Ejecutando scrapers y extractores mayoristas en segundo plano...');

    setTimeout(() => {
      onTriggerAllScrapers();
      setIsScrapingGlobal(false);
      setScrapeSuccessMsg('¡Red de precios actualizada exitosamente con 2,050 cotizaciones!');
      setTimeout(() => setScrapeSuccessMsg(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1D20] tracking-tight">
            Inteligencia de Precios & Red de Mayoristas
          </h1>
          <p className="text-xs sm:text-sm text-[#5A626A]">
            Monitoreo automatizado de precios en Central de Abastos, Zorro Abarrotero, Scorpion y preventistas de ruta.
          </p>
        </div>

        {/* Global Trigger Scraper Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunAll}
            disabled={isScrapingGlobal}
            className="px-3.5 py-2 rounded-xl bg-[#0F5132] hover:bg-[#198754] disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isScrapingGlobal ? 'animate-spin' : ''}`} />
            <span>{isScrapingGlobal ? 'Extrayendo datos...' : 'Actualizar Precios Hoy'}</span>
          </button>
        </div>
      </div>

      {scrapeSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-100 border border-emerald-300 text-[#0D6832] font-bold text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#198754] shrink-0" />
          <span>{scrapeSuccessMsg}</span>
        </div>
      )}

      {/* Google Sheets Intelligence Agent Indicator Card */}
      {sheetsStats && (
        <div className="bg-white rounded-2xl border border-[#E2E5E8] p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0F5132]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-[#1A1D20]">
                  Google Sheets Intelligence Agent
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-[#0D6832]">
                  {sheetsStats.freshnessStatus}
                </span>
              </div>
              <p className="text-[11px] text-[#5A626A]">
                Base de Datos interna sincronizada automáticamente como distribución para agentes externos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#5A626A] flex-wrap border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E2E5E8] w-full sm:w-auto justify-between sm:justify-end">
            <div>
              <span className="font-semibold text-[#1A1D20]">Última Sincronización:</span>{' '}
              <span className="font-mono text-[#0F5132] font-bold">{sheetsStats.lastSyncAt}</span>
            </div>
            <div>
              <span className="font-semibold text-[#1A1D20]">Fuentes Activas:</span>{' '}
              <span className="font-mono font-bold text-[#1A1D20]">{sheetsStats.sourcesCount}</span>
            </div>
            <div>
              <span className="font-semibold text-[#1A1D20]">Productos:</span>{' '}
              <span className="font-mono font-bold text-[#1A1D20]">{sheetsStats.productsCount}</span>
            </div>
            <div>
              <span className="font-semibold text-[#1A1D20]">Oportunidades:</span>{' '}
              <span className="font-mono font-bold text-[#0D6832]">{sheetsStats.opportunitiesCount}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Navigation Switcher */}
      <div className="flex border-b border-[#E2E5E8] gap-6">
        <button
          onClick={() => setActiveTab('prices')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'prices'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-[#5A626A] hover:text-[#1A1D20]'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Matriz de Precios Mayoristas ({priceRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scrapers')}
          className={`pb-3 text-sm font-extrabold flex items-center gap-2 transition-colors cursor-pointer border-b-2 ${
            activeTab === 'scrapers'
              ? 'border-[#0F5132] text-[#0F5132]'
              : 'border-transparent text-[#5A626A] hover:text-[#1A1D20]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Monitor de Scrapers & Jobs ({scraperJobs.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: PRICES MATRIX */}
      {activeTab === 'prices' && (
        <div className="space-y-4">
          
          {/* Search & Source Filter */}
          <div className="bg-white rounded-2xl border border-[#E2E5E8] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5A626A] absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por producto o proveedor mayorista..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#E2E5E8] bg-white outline-none focus:border-[#0F5132]"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {sources.map((src) => (
                <button
                  key={src}
                  onClick={() => setSelectedSource(src)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedSource === src
                      ? 'bg-[#0F5132] text-white shadow-2xs'
                      : 'bg-[#F8F9FA] border border-[#E2E5E8] text-[#5A626A] hover:bg-white'
                  }`}
                >
                  {src}
                </button>
              ))}
            </div>
          </div>

          {/* Prices Grid */}
          <div className="bg-white rounded-3xl border border-[#E2E5E8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#E2E5E8] text-[10px] font-black uppercase text-[#5A626A]">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Producto & Presentación</th>
                    <th className="py-3 px-4">Fuente / Mayorista</th>
                    <th className="py-3 px-4 text-center">Disponibilidad</th>
                    <th className="py-3 px-4 text-right">Precio Mayorista</th>
                    <th className="py-3 px-4 text-center">Variación vs Ayer</th>
                    <th className="py-3 px-4 text-right">Confianza IA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E5E8]">
                  {filteredPrices.map((record) => {
                    const isIncrease = record.deltaVsPrevious > 0;
                    const isDecrease = record.deltaVsPrevious < 0;

                    return (
                      <tr key={record.id} className="hover:bg-[#F8F9FA] transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-bold text-[#1A1D20]">
                          <div>{record.productName}</div>
                          <span className="text-xs text-[#5A626A] font-normal">{record.presentation}</span>
                        </td>

                        <td className="py-3.5 px-4 text-xs">
                          <div className="font-bold text-[#1A1D20]">{record.supplier}</div>
                          <span className="text-[11px] text-[#5A626A]">{record.source}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-[#0D6832]">
                            {record.availability}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-black text-sm text-[#1A1D20] tabular-nums">
                          ${record.price.toFixed(2)}{' '}
                          <span className="text-[10px] font-normal text-[#5A626A]">/ {record.unit}</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {isIncrease ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-red-100 text-red-800 text-xs font-black">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              +${record.deltaVsPrevious.toFixed(2)}
                            </span>
                          ) : isDecrease ? (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-emerald-100 text-[#0D6832] text-xs font-black">
                              <ArrowDownRight className="w-3.5 h-3.5" />
                              -${Math.abs(record.deltaVsPrevious).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-xs text-[#5A626A] font-semibold">Sin cambio</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#0D6832] text-[11px] font-black border border-emerald-200">
                            {record.confidenceScore}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: SCRAPERS & JOBS MONITOR */}
      {activeTab === 'scrapers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scraperJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-3xl border border-[#E2E5E8] p-5 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-[#1A1D20]">{job.name}</h3>
                      <p className="text-xs text-[#5A626A]">{job.source}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#0D6832]">
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-2 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8]">
                      <div className="text-[10px] text-[#5A626A]">Encontrados</div>
                      <div className="text-sm font-black text-[#1A1D20]">{job.itemsFound}</div>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="text-[10px] text-[#0D6832]">Procesados</div>
                      <div className="text-sm font-black text-[#0D6832]">{job.itemsProcessed}</div>
                    </div>
                    <div className="p-2 bg-[#F8F9FA] rounded-xl border border-[#E2E5E8]">
                      <div className="text-[10px] text-[#5A626A]">Duración</div>
                      <div className="text-sm font-black text-[#1A1D20]">{job.durationSec}s</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E2E5E8] flex items-center justify-between">
                  <div className="text-xs text-[#5A626A]">
                    Última ejec: <strong>{job.lastRun}</strong>
                  </div>
                  <button
                    onClick={() => onTriggerScraper(job.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#F8F9FA] hover:bg-emerald-50 hover:text-[#0D6832] text-xs font-bold text-[#1A1D20] border border-[#E2E5E8] transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 text-[#0F5132]" />
                    <span>Ejecutar Ahora</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
