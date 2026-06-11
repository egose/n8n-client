import type { HttpClient } from '../http-client.js';
import type { PullRequest, SourceControlledFile } from '../types.js';

export default class SourceControlHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async pull(data: PullRequest): Promise<SourceControlledFile[]> {
    return this.http.post<SourceControlledFile[]>('/source-control/pull', data);
  }
}
