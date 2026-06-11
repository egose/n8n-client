import type { HttpClient } from '../http-client.js';
import type { User, UserCreate, UserCreateResponse, UserListResponse, PaginationParams } from '../types.js';

export default class UserHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(
    params?: PaginationParams & {
      offset?: number;
      includeRole?: boolean;
      projectId?: string;
    },
  ): Promise<UserListResponse> {
    return this.http.get<UserListResponse>('/users', params);
  }

  async get(id: string, params?: { includeRole?: boolean }): Promise<User> {
    return this.http.get<User>(`/users/${id}`, params);
  }

  async create(data: UserCreate[]): Promise<UserCreateResponse> {
    return this.http.post<UserCreateResponse>('/users', data);
  }

  async delete(id: string): Promise<void> {
    await this.http.delete<void>(`/users/${id}`);
  }

  async changeRole(id: string, newRoleName: string): Promise<void> {
    await this.http.patch<void>(`/users/${id}/role`, { newRoleName });
  }
}
