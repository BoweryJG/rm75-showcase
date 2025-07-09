// Real-time Synchronization System for Richard Mille Watches

import { TimeSync, NTPSyncConfig } from '../types/timing.types';

export class TimeSyncManager {
  private syncConfig: NTPSyncConfig;
  private syncState: TimeSync;
  private syncInterval: number | null = null;
  private supabaseClient: any;
  private lastServerTime = 0;
  private timeOffsetHistory: number[] = [];
  private syncAttempts = 0;

  constructor(
    supabaseUrl: string,
    supabaseKey: string,
    config: Partial<NTPSyncConfig> = {}
  ) {
    this.syncConfig = {
      servers: ['time.google.com', 'pool.ntp.org', 'time.cloudflare.com'],
      syncInterval: 30000, // 30 seconds
      timeout: 5000, // 5 seconds
      maxDrift: 100, // 100ms
      retryAttempts: 3,
      fallbackToLocal: true,
      ...config
    };

    this.syncState = {
      serverTime: 0,
      localTime: 0,
      latency: 0,
      offset: 0,
      accuracy: 0,
      lastSync: 0,
      status: 'offline'
    };

    this.initializeSupabase(supabaseUrl, supabaseKey);
  }

  private async initializeSupabase(url: string, key: string): Promise<void> {
    try {
      // Initialize Supabase client for real-time sync
      const { createClient } = await import('@supabase/supabase-js');
      this.supabaseClient = createClient(url, key);
      
      // Setup real-time time sync channel
      await this.setupRealtimeSync();
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      this.syncState.status = 'error';
    }
  }

  private async setupRealtimeSync(): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      // Subscribe to time sync channel
      const channel = this.supabaseClient
        .channel('time_sync')
        .on('broadcast', { event: 'time_update' }, (payload: any) => {
          this.handleRealtimeTimeUpdate(payload);
        })
        .subscribe();

      // Start periodic sync
      this.startPeriodicSync();
    } catch (error) {
      console.error('Failed to setup realtime sync:', error);
    }
  }

  private handleRealtimeTimeUpdate(payload: any): void {
    const { serverTime, deviceId } = payload;
    
    if (deviceId !== this.getDeviceId()) {
      // Update from another device
      this.syncWithServerTime(serverTime);
    }
  }

  private getDeviceId(): string {
    // Generate or retrieve device ID
    let deviceId = localStorage.getItem('rm_device_id');
    if (!deviceId) {
      deviceId = this.generateDeviceId();
      localStorage.setItem('rm_device_id', deviceId);
    }
    return deviceId;
  }

  private generateDeviceId(): string {
    return 'rm_' + Math.random().toString(36).substring(2, 15);
  }

  public startPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.syncConfig.syncInterval);

    // Perform initial sync
    this.performSync();
  }

  public stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async performSync(): Promise<void> {
    this.syncState.status = 'syncing';
    this.syncAttempts = 0;

    try {
      // Try multiple sync methods
      const syncResult = await this.performMultiSourceSync();
      
      if (syncResult.success) {
        this.updateSyncState(syncResult);
        this.broadcastTimeUpdate(syncResult.serverTime);
      } else {
        throw new Error('All sync methods failed');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      this.handleSyncFailure();
    }
  }

  private async performMultiSourceSync(): Promise<any> {
    const syncMethods = [
      () => this.syncWithSupabase(),
      () => this.syncWithNTP(),
      () => this.syncWithWebAPI()
    ];

    for (const method of syncMethods) {
      try {
        const result = await method();
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.warn('Sync method failed:', error);
      }
    }

    return { success: false };
  }

  private async syncWithSupabase(): Promise<any> {
    if (!this.supabaseClient) {
      throw new Error('Supabase client not initialized');
    }

    const startTime = performance.now();
    
    try {
      // Get server time from Supabase
      const { data, error } = await this.supabaseClient
        .from('time_sync')
        .select('server_time')
        .limit(1);

      if (error) throw error;

      const endTime = performance.now();
      const latency = endTime - startTime;
      const serverTime = data[0]?.server_time || Date.now();
      
      return {
        success: true,
        serverTime,
        latency,
        source: 'supabase'
      };
    } catch (error) {
      throw new Error(`Supabase sync failed: ${error}`);
    }
  }

  private async syncWithNTP(): Promise<any> {
    // Simplified NTP-style sync using multiple servers
    const promises = this.syncConfig.servers.map(server => 
      this.syncWithServer(server)
    );

    try {
      const results = await Promise.allSettled(promises);
      const successfulResults = results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<any>).value);

      if (successfulResults.length === 0) {
        throw new Error('No NTP servers responded');
      }

      // Calculate median offset for better accuracy
      const offsets = successfulResults.map(r => r.offset);
      const medianOffset = this.calculateMedian(offsets);
      
      return {
        success: true,
        serverTime: Date.now() + medianOffset,
        latency: this.calculateMedian(successfulResults.map(r => r.latency)),
        source: 'ntp'
      };
    } catch (error) {
      throw new Error(`NTP sync failed: ${error}`);
    }
  }

  private async syncWithServer(server: string): Promise<any> {
    const startTime = performance.now();
    
    try {
      // Use HTTP HEAD request to get server time
      const response = await fetch(`https://${server}`, {
        method: 'HEAD',
        mode: 'no-cors'
      });

      const endTime = performance.now();
      const latency = endTime - startTime;
      const serverTime = new Date(response.headers.get('date') || Date.now()).getTime();
      const offset = serverTime - Date.now();

      return {
        serverTime,
        latency,
        offset,
        source: server
      };
    } catch (error) {
      throw new Error(`Server ${server} sync failed: ${error}`);
    }
  }

  private async syncWithWebAPI(): Promise<any> {
    try {
      // Fallback to world time API
      const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
      const data = await response.json();
      
      const serverTime = new Date(data.datetime).getTime();
      const latency = 50; // Estimated latency
      
      return {
        success: true,
        serverTime,
        latency,
        source: 'worldtime'
      };
    } catch (error) {
      throw new Error(`World Time API sync failed: ${error}`);
    }
  }

  private calculateMedian(values: number[]): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    } else {
      return sorted[middle];
    }
  }

  private updateSyncState(syncResult: any): void {
    const currentTime = Date.now();
    const offset = syncResult.serverTime - currentTime;
    
    // Update offset history for accuracy calculation
    this.timeOffsetHistory.push(offset);
    if (this.timeOffsetHistory.length > 10) {
      this.timeOffsetHistory.shift();
    }

    // Calculate accuracy based on offset stability
    const accuracy = this.calculateSyncAccuracy();

    this.syncState = {
      serverTime: syncResult.serverTime,
      localTime: currentTime,
      latency: syncResult.latency,
      offset,
      accuracy,
      lastSync: currentTime,
      status: 'synced'
    };

    this.lastServerTime = syncResult.serverTime;
  }

  private calculateSyncAccuracy(): number {
    if (this.timeOffsetHistory.length < 2) return 1000; // Default 1 second

    const offsets = this.timeOffsetHistory;
    const mean = offsets.reduce((sum, offset) => sum + offset, 0) / offsets.length;
    const variance = offsets.reduce((sum, offset) => sum + Math.pow(offset - mean, 2), 0) / offsets.length;
    
    return Math.sqrt(variance); // Standard deviation as accuracy measure
  }

  private async broadcastTimeUpdate(serverTime: number): Promise<void> {
    if (!this.supabaseClient) return;

    try {
      // Broadcast time update to other devices
      await this.supabaseClient.channel('time_sync').send({
        type: 'broadcast',
        event: 'time_update',
        payload: {
          serverTime,
          deviceId: this.getDeviceId(),
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.warn('Failed to broadcast time update:', error);
    }
  }

  private handleSyncFailure(): void {
    this.syncAttempts++;
    
    if (this.syncAttempts < this.syncConfig.retryAttempts) {
      // Retry after exponential backoff
      const delay = Math.pow(2, this.syncAttempts) * 1000;
      setTimeout(() => this.performSync(), delay);
    } else {
      // All retries failed
      this.syncState.status = 'error';
      
      if (this.syncConfig.fallbackToLocal) {
        this.syncState.status = 'offline';
        this.syncState.offset = 0;
        this.syncState.accuracy = 5000; // 5 second accuracy fallback
      }
    }
  }

  public getCurrentTime(): number {
    return Date.now() + this.syncState.offset;
  }

  public getTimeWithPrecision(): { time: number; precision: number } {
    const currentTime = this.getCurrentTime();
    const precision = this.syncState.accuracy;
    
    return { time: currentTime, precision };
  }

  public getSyncState(): TimeSync {
    return { ...this.syncState };
  }

  public getTimezoneOffset(): number {
    return new Date().getTimezoneOffset() * 60000; // Convert to milliseconds
  }

  public convertToTimezone(time: number, timezone: string): number {
    try {
      const date = new Date(time);
      const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
      const targetTime = new Date(utcTime + (this.getTimezoneOffsetForZone(timezone)));
      
      return targetTime.getTime();
    } catch (error) {
      console.error('Timezone conversion failed:', error);
      return time;
    }
  }

  private getTimezoneOffsetForZone(timezone: string): number {
    // Simplified timezone offset calculation
    const timezoneOffsets: { [key: string]: number } = {
      'UTC': 0,
      'EST': -5 * 3600000,
      'PST': -8 * 3600000,
      'GMT': 0,
      'CET': 1 * 3600000,
      'JST': 9 * 3600000
    };
    
    return timezoneOffsets[timezone] || 0;
  }

  public isOnline(): boolean {
    return this.syncState.status === 'synced';
  }

  public getLatency(): number {
    return this.syncState.latency;
  }

  public destroy(): void {
    this.stopPeriodicSync();
    
    if (this.supabaseClient) {
      this.supabaseClient.removeAllChannels();
    }
  }
}