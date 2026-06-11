import type { HttpClient } from '../http-client.js';
import type { CommunityPackage, InstallCommunityPackageRequest } from '../types.js';

export default class CommunityPackageHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(): Promise<CommunityPackage[]> {
    return this.http.get<CommunityPackage[]>('/community-packages');
  }

  async install(data: InstallCommunityPackageRequest): Promise<CommunityPackage> {
    return this.http.post<CommunityPackage>('/community-packages', data);
  }

  async update(name: string, data?: { version?: string; verify?: boolean }): Promise<CommunityPackage> {
    return this.http.patch<CommunityPackage>(`/community-packages/${name}`, data);
  }

  async uninstall(name: string): Promise<void> {
    await this.http.delete<void>(`/community-packages/${name}`);
  }
}
