import crypto from 'crypto';

export interface FetchOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface FetchResult {
  url: string;
  httpStatus: number;
  contentType: string;
  body: string;
  latencyMs: number;
  bytesReceived: number;
  error?: string;
}

export class LiveDataFetcher {
  private userAgent = 'AbarrotesIA-NativeBot/1.0 (+https://abarrotes.ia/bot)';
  private minDelayMs = 1000;
  private lastFetchTime = 0;

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async enforceRateLimit() {
    const now = Date.now();
    const elapsed = now - this.lastFetchTime;
    if (elapsed < this.minDelayMs) {
      await this.sleep(this.minDelayMs - elapsed);
    }
    this.lastFetchTime = Date.now();
  }

  public async fetch(url: string, options: FetchOptions = {}): Promise<FetchResult> {
    const maxRetries = options.maxRetries ?? 3;
    const timeoutMs = options.timeoutMs ?? 15000;
    
    let attempt = 0;
    
    while (attempt < maxRetries) {
      attempt++;
      await this.enforceRateLimit();
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const t0 = Date.now();
      try {
        const response = await fetch(url, {
          method: options.method || 'GET',
          headers: {
            'User-Agent': this.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/json',
            ...(options.headers || {})
          },
          body: options.body,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const latencyMs = Date.now() - t0;
        const contentType = response.headers.get('content-type') || '';
        
        if (response.status >= 500) {
          if (attempt < maxRetries) {
            await this.sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
            continue;
          }
        }
        
        const bodyText = await response.text();
        const bytesReceived = Buffer.byteLength(bodyText, 'utf8');
        
        return {
          url,
          httpStatus: response.status,
          contentType,
          body: bodyText,
          latencyMs,
          bytesReceived
        };
      } catch (err: any) {
        clearTimeout(timeoutId);
        const latencyMs = Date.now() - t0;
        
        if (attempt < maxRetries && (err.name === 'AbortError' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
          await this.sleep(Math.pow(2, attempt) * 1000);
          continue;
        }
        
        return {
          url,
          httpStatus: 0,
          contentType: '',
          body: '',
          latencyMs,
          bytesReceived: 0,
          error: err.message
        };
      }
    }
    
    return {
      url,
      httpStatus: 0,
      contentType: '',
      body: '',
      latencyMs: 0,
      bytesReceived: 0,
      error: 'Max retries exceeded'
    };
  }
}

export const liveDataFetcher = new LiveDataFetcher();
