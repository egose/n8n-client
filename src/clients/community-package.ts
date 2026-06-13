import type { CommunityPackage, InstallCommunityPackageRequest, UpdateCommunityPackageRequest } from '../types.js';
import BaseClient from './base.js';

export default class CommunityPackageClient extends BaseClient {
  async list(): Promise<CommunityPackage[]> {
    return this.http.get<CommunityPackage[]>('/community-packages');
  }

  async install(data: InstallCommunityPackageRequest): Promise<CommunityPackage> {
    return this.http.post<CommunityPackage>('/community-packages', data);
  }

  async update(name: string, data?: UpdateCommunityPackageRequest): Promise<CommunityPackage> {
    return this.http.patch<CommunityPackage>(`/community-packages/${name}`, data);
  }

  async uninstall(name: string): Promise<void> {
    await this.http.delete<void>(`/community-packages/${name}`);
  }
}
