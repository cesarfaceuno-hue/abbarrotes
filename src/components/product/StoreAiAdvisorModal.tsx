import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  RefreshCw, 
  CheckCircle2, 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { StoreProfile, InventoryItem } from '../../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
}

interface StoreAiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeProfile: StoreProfile;
  inventory: InventoryItem[];
}

export const StoreAiAdvisorModal: React.FC<StoreAiAdvisorModalProps> = ({
  isOpen,
  onClose,
  storeProfile,
  inventory,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `¡Hola, ${storeProfile.ownerName || 'Don Pedro'}! Soy tu **Asesor Inteligente Abarrotes IA**, potenciado por OpenAI. 

Puedo ayudarte a:
- Analizar si te conviene comprar en **Scorpion**, **Zorro Abarrotero** o **Central de Abastos**.
- Calcular márgenes y sugerirte precios de venta en mostrador.
- Identificar productos en riesgo de desabasto para que no pierdas ventas.
- Calcular tus ahorros del día.

¿Qué te gustaría consultar hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'OpenAI (gpt-4o-mini)',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string }>({
    configured: true,
    model: 'gpt-4o-mini',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check AI status
    fetch('/api/store-brain/ai-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.openai?.configured) {
          setAiStatus({ configured: true, model: data.openai.model });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isLoading) return;

    const userMsg: Message = {
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Prepare payload with store context
      const criticalStockouts = inventory.filter((i) => i.daysOfStock < 2.5).length;
      const response = await fetch('/api/store-brain/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          context: {
            storeName: storeProfile.storeName,
            totalProducts: inventory.length,
            criticalStockouts,
            potentialSavings: 184.5,
            recentAlerts: [
              'Aceite Nutrioli 1L en Scorpion a $32.50 vs costo actual $38.90',
              'Jabón Zote Blanco requiere ajuste de precio en POS',
            ],
          },
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            provider: data.provider || 'OpenAI',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Hubo un inconveniente al consultar la IA: ${data.error || 'Intenta de nuevo.'}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Error de conexión: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    '🛒 ¿Dónde me conviene comprar Aceite Nutrioli hoy?',
    '📊 ¿Cómo calculo el margen ideal para Jabón Zote?',
    '⚠️ ¿Qué productos debo resurtir con urgencia?',
    '💡 Sugerencia para ganar más en refrescos de 600ml',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-emerald-900/10 w-full max-w-2xl h-[640px] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#0F5132] px-6 py-4 text-white flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/20 border border-emerald-300/30 flex items-center justify-center text-emerald-200">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">Asesor Inteligente de Tienda</h3>
                <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300/20">
                  <Zap className="w-2.5 h-2.5 text-amber-300" />
                  OpenAI GPT-4o-mini
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                Estrategias de compra, cálculo de márgenes y optimización de caja
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-stone-50/50">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0F5132] text-white rounded-tr-xs shadow-xs'
                    : 'bg-white text-stone-800 border border-stone-200/80 shadow-xs rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] mt-1.5 flex items-center justify-between gap-2 ${
                    msg.role === 'user' ? 'text-emerald-200' : 'text-stone-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.provider && (
                    <span className="font-semibold text-emerald-700">{msg.provider}</span>
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-stone-700 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl px-4 py-2.5 text-xs text-stone-600 flex items-center gap-2 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                <span>Analizando precios mayoristas y márgenes con OpenAI...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-stone-100/80 border-t border-stone-200/80 overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-xs bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 px-3 py-1.5 rounded-full border border-stone-200 whitespace-nowrap transition-colors shadow-2xs font-medium"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pregunta a la IA sobre precios, proveedores o márgenes..."
            disabled={isLoading}
            className="flex-1 bg-stone-100 hover:bg-stone-50 focus:bg-white text-stone-900 border border-stone-300 focus:border-emerald-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700/20 transition-all"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-[#0F5132] hover:bg-[#157347] disabled:opacity-40 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Preguntar</span>
          </button>
        </div>

      </div>
    </div>
  );
};
