import { liveDataFetcher } from './LiveDataFetcher.js';

export class RobotsParser {
  private cache: Map<string, { rules: { userAgent: string, disallow: string[], allow: string[] }[], fetchedAt: number }> = new Map();

  private getDomain(url: string): string {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  }

  public async fetchAndParse(baseUrl: string): Promise<void> {
    const domain = this.getDomain(baseUrl);
    if (this.cache.has(domain)) {
      const entry = this.cache.get(domain);
      if (entry && Date.now() - entry.fetchedAt < 1000 * 60 * 60 * 24) { // 24 hours cache
        return;
      }
    }

    const robotsUrl = `${domain}/robots.txt`;
    const res = await liveDataFetcher.fetch(robotsUrl);
    
    if (res.httpStatus !== 200) {
      this.cache.set(domain, { rules: [], fetchedAt: Date.now() });
      return;
    }

    const lines = res.body.split('\n');
    const rules: { userAgent: string, disallow: string[], allow: string[] }[] = [];
    let currentAgent = '*';
    let currentDisallow: string[] = [];
    let currentAllow: string[] = [];

    for (let line of lines) {
      line = line.split('#')[0].trim();
      if (!line) continue;

      const [key, ...rest] = line.split(':');
      const value = rest.join(':').trim();

      if (key.toLowerCase() === 'user-agent') {
        if (currentDisallow.length > 0 || currentAllow.length > 0) {
          rules.push({ userAgent: currentAgent, disallow: currentDisallow, allow: currentAllow });
          currentDisallow = [];
          currentAllow = [];
        }
        currentAgent = value;
      } else if (key.toLowerCase() === 'disallow') {
        if (value) currentDisallow.push(value);
      } else if (key.toLowerCase() === 'allow') {
        if (value) currentAllow.push(value);
      }
    }
    
    if (currentDisallow.length > 0 || currentAllow.length > 0) {
      rules.push({ userAgent: currentAgent, disallow: currentDisallow, allow: currentAllow });
    }

    this.cache.set(domain, { rules, fetchedAt: Date.now() });
  }

  public isAllowed(url: string, userAgent: string = 'AbarrotesIA-NativeBot/1.0'): boolean {
    const parsed = new URL(url);
    const domain = `${parsed.protocol}//${parsed.host}`;
    const path = parsed.pathname + parsed.search;

    const entry = this.cache.get(domain);
    if (!entry) return true; // Default allow if no robots.txt or not fetched yet

    // Find specific rules or fallback to '*'
    let applicableRules = entry.rules.find(r => r.userAgent.toLowerCase() === userAgent.toLowerCase());
    if (!applicableRules) {
      applicableRules = entry.rules.find(r => r.userAgent === '*');
    }

    if (!applicableRules) return true;

    // Check allow first (allow overrides disallow in many implementations)
    for (const allow of applicableRules.allow) {
      if (path.startsWith(allow)) return true;
    }

    for (const disallow of applicableRules.disallow) {
      if (path.startsWith(disallow)) return false;
    }

    return true;
  }
}

export const robotsParser = new RobotsParser();
