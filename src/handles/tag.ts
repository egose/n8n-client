import type { HttpClient } from '../http-client.js';
import type { Tag, TagListResponse, PaginationParams } from '../types.js';

export default class TagHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async list(params?: PaginationParams): Promise<TagListResponse> {
    return this.http.get<TagListResponse>('/tags', params);
  }

  async get(id: string): Promise<Tag> {
    return this.http.get<Tag>(`/tags/${id}`);
  }

  async create(data: { name: string }): Promise<Tag> {
    return this.http.post<Tag>('/tags', data);
  }

  async update(id: string, data: { name: string }): Promise<Tag> {
    return this.http.put<Tag>(`/tags/${id}`, data);
  }

  async delete(id: string): Promise<Tag> {
    return this.http.delete<Tag>(`/tags/${id}`);
  }
}
