import type { HttpClient } from '../http-client.js';
import type { Audit, AuditRequest } from '../types.js';

export default class AuditHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async generate(data?: AuditRequest): Promise<Audit> {
    return this.http.post<Audit>('/audit', data);
  }
}
