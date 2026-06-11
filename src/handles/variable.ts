import type { HttpClient } from '../http-client.js';
import type { Variable, VariableCreate, VariableListResponse, PaginationParams } from '../types.js';

export default class VariableHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(
    params?: PaginationParams & {
      projectId?: string;
      state?: 'empty';
    },
  ): Promise<VariableListResponse> {
    return this.http.get<VariableListResponse>('/variables', params);
  }

  async create(data: VariableCreate): Promise<void> {
    await this.http.post<void>('/variables', data);
  }

  async update(id: string, data: VariableCreate): Promise<void> {
    await this.http.put<void>(`/variables/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.http.delete<void>(`/variables/${id}`);
  }
}
