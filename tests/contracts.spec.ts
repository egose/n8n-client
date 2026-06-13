import { describe, expectTypeOf, test } from 'vitest';
import N8nClient from '../src/index';
import AuditClient from '../src/clients/audit';
import CommunityPackageClient from '../src/clients/community-package';
import CredentialClient from '../src/clients/credential';
import ProjectClient from '../src/clients/project';
import DataTableClient from '../src/clients/data-table';
import DiscoverClient from '../src/clients/discover';
import ExecutionClient from '../src/clients/execution';
import FolderClient from '../src/clients/folder';
import InsightsClient from '../src/clients/insights';
import N8nPackageClient from '../src/clients/n8n-package';
import SourceControlClient from '../src/clients/source-control';
import TagClient from '../src/clients/tag';
import UserClient from '../src/clients/user';
import VariableClient from '../src/clients/variable';
import WorkflowClient from '../src/clients/workflow';
import type {
  Audit,
  AuditCommunityLocation,
  AuditCredentialLocation,
  AuditNodeLocation,
  AuditRisk,
  AuditRequest,
  CommunityPackage,
  CommunityPackageNode,
  CreateDataTableRequest,
  Credential,
  CredentialCreate,
  CredentialListResponse,
  CredentialResponse,
  CredentialTestResponse,
  CredentialUpdate,
  DataTable,
  DataTableColumn,
  DataTableListParams,
  DataTableListResponse,
  DataTableRow,
  DataTableRowListParams,
  DataTableRowListResponse,
  DeleteRowsBooleanParams,
  DeleteRowsDataParams,
  DiscoverFilter,
  DiscoverParams,
  DiscoverResource,
  DiscoverResponse,
  Execution,
  ExecutionGetParams,
  ExecutionListParams,
  ExecutionListResponse,
  ExecutionRetryRequest,
  ExportWorkflowsRequest,
  Folder,
  FolderCreate,
  FolderDetail,
  FolderListParams,
  FolderListResponse,
  FolderUpdate,
  ImportPackageOptions,
  ImportPackageResponse,
  InsightsSummary,
  InsightsSummaryParams,
  InstallCommunityPackageRequest,
  JsonObject,
  PaginationParams,
  ProjectListResponse,
  ProjectMemberListResponse,
  ProjectMutation,
  PullRequest,
  SourceControlledFile,
  StopManyExecutionsRequest,
  StopManyExecutionsResponse,
  Tag,
  TagListResponse,
  TagMutation,
  User,
  UserCreate,
  UserCreateResponse,
  UserGetParams,
  UserListParams,
  UserListResponse,
  UpdateColumnRequest,
  UpdateCommunityPackageRequest,
  UpdateDataTableRequest,
  UpdateRowsBooleanRequest,
  UpdateRowsDataRequest,
  UpsertRowBooleanRequest,
  UpsertRowDataRequest,
  Variable,
  VariableCreate,
  VariableListParams,
  VariableListResponse,
  Workflow,
  WorkflowActivateRequest,
  WorkflowConnections,
  WorkflowCreate,
  WorkflowGetParams,
  WorkflowListParams,
  WorkflowListResponse,
  WorkflowNodeTelemetryTags,
  WorkflowPinData,
  WorkflowTelemetryTag,
  WorkflowUpdate,
  WorkflowVersion,
} from '../src/types';
import { createMockHttpClient } from './test-utils';

describe('Public API contracts', () => {
  test('N8nClient does not expose the transport field', () => {
    type ClientHasHttp = 'http' extends keyof N8nClient ? true : false;
    expectTypeOf<ClientHasHttp>().toEqualTypeOf<false>();
  });

  test('ProjectClient does not expose unsupported get()', () => {
    type ProjectClientHasGet = 'get' extends keyof ProjectClient ? true : false;
    expectTypeOf<ProjectClientHasGet>().toEqualTypeOf<false>();
  });

  test('DiscoverResponse nests filters and specUrl under data', () => {
    expectTypeOf<DiscoverResponse>().toEqualTypeOf<{
      data: {
        scopes: string[];
        resources: Record<string, DiscoverResource>;
        filters: Record<string, DiscoverFilter>;
        specUrl: string;
      };
    }>();
  });

  test('DataTableClient row methods narrow return types from request flags', () => {
    const handle = new DataTableClient(createMockHttpClient());

    expectTypeOf(handle.insertRows('dt-1', { data: [], returnType: 'id' })).toEqualTypeOf<Promise<number[]>>();
    expectTypeOf(handle.insertRows('dt-1', { data: [], returnType: 'all' })).toEqualTypeOf<Promise<DataTableRow[]>>();
    expectTypeOf(handle.updateRows('dt-1', { filter: { filters: [] }, data: {}, returnData: true })).toEqualTypeOf<
      Promise<DataTableRow[]>
    >();
    expectTypeOf(handle.upsertRow('dt-1', { filter: { filters: [] }, data: {}, returnData: true })).toEqualTypeOf<
      Promise<DataTableRow>
    >();
    expectTypeOf(handle.deleteRows('dt-1', { filter: '{}', returnData: true })).toEqualTypeOf<
      Promise<DataTableRow[]>
    >();
  });

  test('N8nClient exposes low-level request helpers', () => {
    const client = new N8nClient({ baseUrl: 'http://localhost:5678', apiKey: 'test-key' }); // pragma: allowlist secret

    expectTypeOf(client.get).toBeFunction();
    expectTypeOf(client.post).toBeFunction();
    expectTypeOf(client.put).toBeFunction();
    expectTypeOf(client.patch).toBeFunction();
    expectTypeOf(client.delete).toBeFunction();
    expectTypeOf(client.request).toBeFunction();
  });

  test('N8nClient client factories return the expected client types', () => {
    const client = new N8nClient({ baseUrl: 'http://localhost:5678', apiKey: 'test-key' }); // pragma: allowlist secret

    expectTypeOf(client.workflows()).toEqualTypeOf<WorkflowClient>();
    expectTypeOf(client.executions()).toEqualTypeOf<ExecutionClient>();
    expectTypeOf(client.credentials()).toEqualTypeOf<CredentialClient>();
    expectTypeOf(client.tags()).toEqualTypeOf<TagClient>();
    expectTypeOf(client.users()).toEqualTypeOf<UserClient>();
    expectTypeOf(client.variables()).toEqualTypeOf<VariableClient>();
    expectTypeOf(client.projects()).toEqualTypeOf<ProjectClient>();
    expectTypeOf(client.dataTables()).toEqualTypeOf<DataTableClient>();
    expectTypeOf(client.folders('proj-1')).toEqualTypeOf<FolderClient>();
    expectTypeOf(client.communityPackages()).toEqualTypeOf<CommunityPackageClient>();
    expectTypeOf(client.audit()).toEqualTypeOf<AuditClient>();
    expectTypeOf(client.insights()).toEqualTypeOf<InsightsClient>();
    expectTypeOf(client.sourceControl()).toEqualTypeOf<SourceControlClient>();
    expectTypeOf(client.discover()).toEqualTypeOf<DiscoverClient>();
    expectTypeOf(client.n8nPackage()).toEqualTypeOf<N8nPackageClient>();
  });

  test('WorkflowClient method signatures stay stable', () => {
    const handle = new WorkflowClient(createMockHttpClient());

    expectTypeOf(handle.list({} satisfies WorkflowListParams)).toEqualTypeOf<Promise<WorkflowListResponse>>();
    expectTypeOf(handle.get('wf-1', {} satisfies WorkflowGetParams)).toEqualTypeOf<Promise<Workflow>>();
    expectTypeOf(handle.create({} as WorkflowCreate)).toEqualTypeOf<Promise<Workflow>>();
    expectTypeOf(handle.update('wf-1', {} as WorkflowUpdate)).toEqualTypeOf<Promise<Workflow>>();
    expectTypeOf(handle.activate('wf-1', {} satisfies WorkflowActivateRequest)).toEqualTypeOf<Promise<Workflow>>();
    expectTypeOf(handle.transfer('wf-1', 'proj-1')).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.getTags('wf-1')).toEqualTypeOf<Promise<Tag[]>>();
    expectTypeOf(handle.updateTags('wf-1', [{ id: 'tag-1' }])).toEqualTypeOf<Promise<Tag[]>>();
    expectTypeOf(handle.getVersion('wf-1', 'ver-1')).toEqualTypeOf<Promise<WorkflowVersion>>();
  });

  test('Workflow nested graph types stay structured', () => {
    expectTypeOf<Workflow['connections']>().toEqualTypeOf<WorkflowConnections>();
    expectTypeOf<WorkflowVersion['connections']>().toEqualTypeOf<WorkflowConnections>();
    expectTypeOf<WorkflowCreate['connections']>().toEqualTypeOf<WorkflowConnections>();
    expectTypeOf<WorkflowUpdate['connections']>().toEqualTypeOf<WorkflowConnections>();
    expectTypeOf<Workflow['pinData']>().toEqualTypeOf<WorkflowPinData | null | undefined>();
    expectTypeOf<Workflow['settings']>().toMatchTypeOf<{ customTelemetryTags?: WorkflowTelemetryTag[] } | undefined>();
    expectTypeOf<Workflow['nodes'][number]>().toMatchTypeOf<{ customTelemetryTags?: WorkflowNodeTelemetryTags }>();
  });

  test('ExecutionClient method signatures stay stable', () => {
    const handle = new ExecutionClient(createMockHttpClient());

    expectTypeOf(handle.list({} satisfies ExecutionListParams)).toEqualTypeOf<Promise<ExecutionListResponse>>();
    expectTypeOf(handle.get(1, {} satisfies ExecutionGetParams)).toEqualTypeOf<Promise<Execution>>();
    expectTypeOf(handle.retry(1, {} satisfies ExecutionRetryRequest)).toEqualTypeOf<Promise<Execution>>();
    expectTypeOf(handle.stopMany({ status: ['running'] } satisfies StopManyExecutionsRequest)).toEqualTypeOf<
      Promise<StopManyExecutionsResponse>
    >();
    expectTypeOf(handle.getTags(1)).toEqualTypeOf<Promise<Tag[]>>();
    expectTypeOf(handle.updateTags(1, [{ id: 'tag-1' }])).toEqualTypeOf<Promise<Tag[]>>();
  });

  test('CredentialClient method signatures stay stable', () => {
    const handle = new CredentialClient(createMockHttpClient());

    expectTypeOf(handle.list({} satisfies PaginationParams)).toEqualTypeOf<Promise<CredentialListResponse>>();
    expectTypeOf(handle.get('cred-1')).toEqualTypeOf<Promise<CredentialResponse>>();
    expectTypeOf(handle.create({} as CredentialCreate)).toEqualTypeOf<Promise<CredentialResponse>>();
    expectTypeOf(handle.update('cred-1', {} as CredentialUpdate)).toEqualTypeOf<Promise<CredentialResponse>>();
    expectTypeOf(handle.delete('cred-1')).toEqualTypeOf<Promise<Credential>>();
    expectTypeOf(handle.test('cred-1')).toEqualTypeOf<Promise<CredentialTestResponse>>();
    expectTypeOf(handle.transfer('cred-1', 'proj-1')).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.getSchema('slackApi')).toEqualTypeOf<Promise<JsonObject>>();
  });

  test('ProjectClient method signatures stay stable', () => {
    const handle = new ProjectClient(createMockHttpClient());

    expectTypeOf(handle.list({} satisfies PaginationParams)).toEqualTypeOf<Promise<ProjectListResponse>>();
    expectTypeOf(handle.create({ name: 'Project' } satisfies ProjectMutation)).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.update('proj-1', { name: 'Renamed' } satisfies ProjectMutation)).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.delete('proj-1')).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.listMembers('proj-1', {} satisfies PaginationParams)).toEqualTypeOf<
      Promise<ProjectMemberListResponse>
    >();
    expectTypeOf(handle.addMembers('proj-1', [{ userId: 'user-1', role: 'project:editor' }])).toEqualTypeOf<
      Promise<void>
    >();
    expectTypeOf(handle.removeMember('proj-1', 'user-1')).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.changeMemberRole('proj-1', 'user-1', 'project:admin')).toEqualTypeOf<Promise<void>>();
  });

  test('DataTableClient method signatures stay stable', () => {
    const handle = new DataTableClient(createMockHttpClient());

    expectTypeOf(handle.list({} satisfies DataTableListParams)).toEqualTypeOf<Promise<DataTableListResponse>>();
    expectTypeOf(handle.get('dt-1')).toEqualTypeOf<Promise<DataTable>>();
    expectTypeOf(handle.create({ name: 'Table', columns: [] } satisfies CreateDataTableRequest)).toEqualTypeOf<
      Promise<DataTable>
    >();
    expectTypeOf(handle.update('dt-1', { name: 'Renamed' } satisfies UpdateDataTableRequest)).toEqualTypeOf<
      Promise<DataTable>
    >();
    expectTypeOf(handle.delete('dt-1')).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.listRows('dt-1', {} satisfies DataTableRowListParams)).toEqualTypeOf<
      Promise<DataTableRowListResponse>
    >();
    expectTypeOf(
      handle.updateRows('dt-1', { filter: { filters: [] }, data: {} } satisfies UpdateRowsBooleanRequest),
    ).toEqualTypeOf<Promise<boolean>>();
    expectTypeOf(
      handle.updateRows('dt-1', {
        filter: { filters: [] },
        data: {},
        returnData: true,
      } satisfies UpdateRowsDataRequest),
    ).toEqualTypeOf<Promise<DataTableRow[]>>();
    expectTypeOf(
      handle.upsertRow('dt-1', { filter: { filters: [] }, data: {} } satisfies UpsertRowBooleanRequest),
    ).toEqualTypeOf<Promise<boolean>>();
    expectTypeOf(
      handle.upsertRow('dt-1', { filter: { filters: [] }, data: {}, returnData: true } satisfies UpsertRowDataRequest),
    ).toEqualTypeOf<Promise<DataTableRow>>();
    expectTypeOf(handle.deleteRows('dt-1', { filter: '{}' } satisfies DeleteRowsBooleanParams)).toEqualTypeOf<
      Promise<boolean>
    >();
    expectTypeOf(
      handle.deleteRows('dt-1', { filter: '{}', returnData: true } satisfies DeleteRowsDataParams),
    ).toEqualTypeOf<Promise<DataTableRow[]>>();
    expectTypeOf(handle.listColumns('dt-1')).toEqualTypeOf<Promise<DataTableColumn[]>>();
    expectTypeOf(handle.createColumn('dt-1', { name: 'col', type: 'string' })).toEqualTypeOf<
      Promise<DataTableColumn>
    >();
    expectTypeOf(handle.deleteColumn('dt-1', 'col-1')).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.updateColumn('dt-1', 'col-1', {} satisfies UpdateColumnRequest)).toEqualTypeOf<
      Promise<DataTableColumn>
    >();
  });

  test('FolderClient method signatures stay stable', () => {
    const handle = new FolderClient(createMockHttpClient(), 'proj-1');

    expectTypeOf(handle.list({} satisfies FolderListParams)).toEqualTypeOf<Promise<FolderListResponse>>();
    expectTypeOf(handle.get('folder-1')).toEqualTypeOf<Promise<FolderDetail>>();
    expectTypeOf(handle.create({ name: 'Folder' } satisfies FolderCreate)).toEqualTypeOf<Promise<Folder>>();
    expectTypeOf(handle.update('folder-1', {} satisfies FolderUpdate)).toEqualTypeOf<Promise<Folder>>();
    expectTypeOf(handle.delete('folder-1')).toEqualTypeOf<Promise<void>>();
  });

  test('TagClient method signatures stay stable', () => {
    const handle = new TagClient(createMockHttpClient());

    expectTypeOf(handle.list({} satisfies PaginationParams)).toEqualTypeOf<Promise<TagListResponse>>();
    expectTypeOf(handle.get('tag-1')).toEqualTypeOf<Promise<Tag>>();
    expectTypeOf(handle.create({ name: 'Tag' } satisfies TagMutation)).toEqualTypeOf<Promise<Tag>>();
    expectTypeOf(handle.update('tag-1', { name: 'Renamed' } satisfies TagMutation)).toEqualTypeOf<Promise<Tag>>();
    expectTypeOf(handle.delete('tag-1')).toEqualTypeOf<Promise<Tag>>();
  });

  test('UserClient method signatures stay stable', () => {
    const handle = new UserClient(createMockHttpClient());

    expectTypeOf(handle.list({} satisfies UserListParams)).toEqualTypeOf<Promise<UserListResponse>>();
    expectTypeOf(handle.get('user-1', {} satisfies UserGetParams)).toEqualTypeOf<Promise<User>>();
    expectTypeOf(handle.create([{ email: 'user@example.com' }] satisfies UserCreate[])).toEqualTypeOf<
      Promise<UserCreateResponse>
    >();
    expectTypeOf(handle.delete('user-1')).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.changeRole('user-1', 'global:admin')).toEqualTypeOf<Promise<void>>();
  });

  test('VariableClient method signatures stay stable', () => {
    const handle = new VariableClient(createMockHttpClient());

    expectTypeOf(handle.list({} satisfies VariableListParams)).toEqualTypeOf<Promise<VariableListResponse>>();
    expectTypeOf(handle.create({ key: 'x', value: 'y' } satisfies VariableCreate)).toEqualTypeOf<Promise<void>>();
    expectTypeOf(handle.update('var-1', { key: 'x', value: 'y' } satisfies VariableCreate)).toEqualTypeOf<
      Promise<void>
    >();
    expectTypeOf(handle.delete('var-1')).toEqualTypeOf<Promise<void>>();
  });

  test('CommunityPackageClient method signatures stay stable', () => {
    const handle = new CommunityPackageClient(createMockHttpClient());

    expectTypeOf(handle.list()).toEqualTypeOf<Promise<CommunityPackage[]>>();
    expectTypeOf(handle.install({ name: 'n8n-nodes-test' } satisfies InstallCommunityPackageRequest)).toEqualTypeOf<
      Promise<CommunityPackage>
    >();
    expectTypeOf(handle.update('n8n-nodes-test', {} satisfies UpdateCommunityPackageRequest)).toEqualTypeOf<
      Promise<CommunityPackage>
    >();
    expectTypeOf(handle.uninstall('n8n-nodes-test')).toEqualTypeOf<Promise<void>>();
  });

  test('AuditClient, InsightsClient, SourceControlClient, DiscoverClient, and N8nPackageClient stay stable', () => {
    const audit = new AuditClient(createMockHttpClient());
    const insights = new InsightsClient(createMockHttpClient());
    const sourceControl = new SourceControlClient(createMockHttpClient());
    const discover = new DiscoverClient(createMockHttpClient());
    const n8nPackage = new N8nPackageClient(createMockHttpClient());

    expectTypeOf(audit.generate({} satisfies AuditRequest)).toEqualTypeOf<Promise<Audit>>();
    expectTypeOf(insights.getSummary({} satisfies InsightsSummaryParams)).toEqualTypeOf<Promise<InsightsSummary>>();
    expectTypeOf(sourceControl.pull({} satisfies PullRequest)).toEqualTypeOf<Promise<SourceControlledFile[]>>();
    expectTypeOf(discover.get({} satisfies DiscoverParams)).toEqualTypeOf<Promise<DiscoverResponse>>();
    expectTypeOf(n8nPackage.exportWorkflows({ workflowIds: [] } satisfies ExportWorkflowsRequest)).toEqualTypeOf<
      Promise<ArrayBuffer>
    >();
    expectTypeOf(
      n8nPackage.importPackage(new Blob(['pkg']), { workflowConflictPolicy: 'fail' } satisfies ImportPackageOptions),
    ).toEqualTypeOf<Promise<ImportPackageResponse>>();
  });

  test('Audit and community package nested response types stay structured', () => {
    expectTypeOf<CommunityPackage['installedNodes'][number]>().toEqualTypeOf<CommunityPackageNode>();
    expectTypeOf<Audit['Credentials Risk Report']>().toMatchTypeOf<
      | {
          risk: AuditRisk;
          sections: Array<{ location?: Array<AuditCredentialLocation | AuditNodeLocation | AuditCommunityLocation> }>;
        }
      | undefined
    >();
    expectTypeOf<AuditCredentialLocation>().toEqualTypeOf<{ kind: 'credential'; id: string; name: string }>();
    expectTypeOf<AuditNodeLocation>().toEqualTypeOf<{
      kind: 'node';
      workflowId: string;
      workflowName: string;
      nodeId: string;
      nodeName: string;
      nodeType: string;
    }>();
    expectTypeOf<AuditCommunityLocation>().toEqualTypeOf<{
      kind: 'community';
      nodeType: string;
      packageUrl: string;
    }>();
  });
});
