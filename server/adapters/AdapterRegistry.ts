import { BaseSourceAdapter } from './types.js';
import { ScorpionAdapter } from './ScorpionAdapter.js';
import { MayoreoTotalAdapter } from './MayoreoTotalAdapter.js';
import { SurtitiendaAdapter } from './SurtitiendaAdapter.js';
import { ZorroAdapter } from './ZorroAdapter.js';
import { AbarroteroAdapter } from './AbarroteroAdapter.js';
import { ClickAbastoAdapter } from './ClickAbastoAdapter.js';
import { CostcoAdapter } from './CostcoAdapter.js';
import { BodegaAurreraAdapter } from './BodegaAurreraAdapter.js';
import { MercadoLibreAdapter } from './MercadoLibreAdapter.js';

export class AdapterRegistry {
  private adapters: Map<string, BaseSourceAdapter> = new Map();

  constructor() {
    this.register(new ScorpionAdapter());
    this.register(new MayoreoTotalAdapter());
    this.register(new SurtitiendaAdapter());
    this.register(new ZorroAdapter());
    this.register(new AbarroteroAdapter());
    this.register(new ClickAbastoAdapter());
    this.register(new CostcoAdapter());
    this.register(new BodegaAurreraAdapter());
    this.register(new MercadoLibreAdapter());
  }

  public register(adapter: BaseSourceAdapter) {
    this.adapters.set(adapter.sourceId, adapter);
  }

  public getAdapter(sourceId: string): BaseSourceAdapter | undefined {
    return this.adapters.get(sourceId);
  }

  public getAllAdapters(): BaseSourceAdapter[] {
    return Array.from(this.adapters.values());
  }
}

export const adapterRegistry = new AdapterRegistry();
