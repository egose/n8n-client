import type { HttpClient } from '../http-client.js';
import type { ExportWorkflowsRequest, ImportPackageResponse } from '../types.js';

export default class N8nPackageHandle {
  protected http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async exportWorkflows(data: ExportWorkflowsRequest): Promise<ArrayBuffer> {
    return this.http.post<ArrayBuffer>('/n8n-packages/export', data, undefined, { Accept: 'application/gzip' });
  }

  async importPackage(
    pkg: File | Blob,
    options: {
      projectId?: string;
      folderId?: string;
      credentialMatchingMode?: 'id-only';
      credentialMissingMode?: 'must-preexist';
      workflowConflictPolicy: 'new-version' | 'fail' | 'skip';
    },
  ): Promise<ImportPackageResponse> {
    const formData = new FormData();
    formData.append('package', pkg);

    if (options?.projectId) formData.append('projectId', options.projectId);
    if (options?.folderId) formData.append('folderId', options.folderId);
    if (options?.credentialMatchingMode) formData.append('credentialMatchingMode', options.credentialMatchingMode);
    if (options?.credentialMissingMode) formData.append('credentialMissingMode', options.credentialMissingMode);
    formData.append('workflowConflictPolicy', options.workflowConflictPolicy);

    return this.http.request<ImportPackageResponse>({
      method: 'POST',
      path: '/n8n-packages/import',
      body: formData,
    });
  }
}
