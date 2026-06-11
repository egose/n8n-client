import type { HttpClient } from '../http-client.js';
import type {
  Credential,
  CredentialCreate,
  CredentialListResponse,
  CredentialResponse,
  CredentialTestResponse,
  CredentialUpdate,
  PaginationParams,
} from '../types.js';

export default class CredentialHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(params?: PaginationParams): Promise<CredentialListResponse> {
    return this.http.get<CredentialListResponse>('/credentials', params);
  }

  async get(id: string): Promise<CredentialResponse> {
    return this.http.get<CredentialResponse>(`/credentials/${id}`);
  }

  async create(data: CredentialCreate): Promise<CredentialResponse> {
    return this.http.post<CredentialResponse>('/credentials', data);
  }

  async update(id: string, data: CredentialUpdate): Promise<CredentialResponse> {
    return this.http.patch<CredentialResponse>(`/credentials/${id}`, data);
  }

  async delete(id: string): Promise<Credential> {
    return this.http.delete<Credential>(`/credentials/${id}`);
  }

  async test(id: string): Promise<CredentialTestResponse> {
    return this.http.post<CredentialTestResponse>(`/credentials/${id}/test`);
  }

  async transfer(id: string, destinationProjectId: string): Promise<void> {
    await this.http.put<void>(`/credentials/${id}/transfer`, { destinationProjectId });
  }

  async getSchema(credentialTypeName: string): Promise<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`/credentials/schema/${credentialTypeName}`);
  }
}
