export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;
  private ipCache: Map<string, { count: number; resetTime: number }>;

  constructor(windowMs = 60000, maxRequests = 5) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.ipCache = new Map();
  }

  /**
   * Returns true if the request should be blocked (rate limit exceeded)
   * Returns false if the request is allowed.
   */
  public isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = this.ipCache.get(ip);

    if (!record) {
      this.ipCache.set(ip, { count: 1, resetTime: now + this.windowMs });
      return false;
    }

    if (now > record.resetTime) {
      // Reset window
      this.ipCache.set(ip, { count: 1, resetTime: now + this.windowMs });
      return false;
    }

    if (record.count >= this.maxRequests) {
      return true; // Blocked
    }

    record.count += 1;
    return false;
  }
}

// Global instance to persist across API route invocations in the same Vercel worker
export const aiRateLimiter = new RateLimiter(60000, 5); // 5 requests per 60 seconds
