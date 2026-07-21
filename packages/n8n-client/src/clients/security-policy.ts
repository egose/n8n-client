import type { SecurityPolicy, SecurityPolicyUpdate } from '../types.js';
import BaseClient from './base.js';

export default class SecurityPolicyClient extends BaseClient {
  async get(): Promise<SecurityPolicy> {
    return this.http.get<SecurityPolicy>('/settings/security-policy');
  }

  async update(data: SecurityPolicyUpdate): Promise<SecurityPolicy> {
    return this.http.put<SecurityPolicy>('/settings/security-policy', data);
  }
}
