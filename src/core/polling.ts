/**
 * Polling manager to handle interval-based requests
 */
export class PollingManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  /**
   * Start polling with a callback function
   */
  start(callback: () => void | Promise<void>, interval: number): void {
    if (this.isRunning) {
      this.stop();
    }

    this.isRunning = true;
    
    // Execute at intervals (don't execute immediately)
    this.intervalId = setInterval(() => {
      Promise.resolve(callback()).catch(console.error);
    }, interval);
  }

  /**
   * Stop polling
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * Check if polling is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }
}

/**
 * Create a new polling manager instance
 */
export function createPollingManager(): PollingManager {
  return new PollingManager();
}

