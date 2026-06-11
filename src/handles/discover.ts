import type { HttpClient } from '../http-client.js';
import type { DiscoverResponse } from '../types.js';

export default class DiscoverHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async get(params?: { include?: 'schemas'; resource?: string; operation?: string }): Promise<DiscoverResponse> {
    return this.http.get<DiscoverResponse>('/discover', params);
  }
}
