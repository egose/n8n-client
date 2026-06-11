import N8nClient from '@egose/n8n-client';

const client = new N8nClient({
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY,
});

// ─── Create Projects ────────────────────────────────────────────────────────

await client.project().create({ name: 'Engineering' });
await client.project().create({ name: 'Marketing' });
console.log('Created projects');

// ─── List Projects ──────────────────────────────────────────────────────────

const { data: projects } = await client.project().list();
console.log(`Projects: ${projects.map((p) => p.name).join(', ')}`);

const engineering = projects.find((p) => p.name === 'Engineering');

// ─── Manage Members ─────────────────────────────────────────────────────────

if (engineering) {
  // Add members
  await client.project().addMembers(engineering.id, [
    { userId: 'user-alice', role: 'project:admin' },
    { userId: 'user-bob', role: 'project:editor' },
  ]);
  console.log('Added members to Engineering');

  // List members
  const { data: members } = await client.project().listMembers(engineering.id);
  console.log(`Members: ${members.length}`);

  // Change a member's role
  await client.project().changeMemberRole(engineering.id, 'user-bob', 'project:admin');
  console.log('Updated Bob to admin');

  // Remove a member
  await client.project().removeMember(engineering.id, 'user-bob');
  console.log('Removed Bob from project');
}

// ─── Manage Folders ─────────────────────────────────────────────────────────

if (engineering) {
  const folderHandle = client.folder(engineering.id);

  // Create folders
  const prodFolder = await folderHandle.create({ name: 'Production Workflows' });
  const stagingFolder = await folderHandle.create({ name: 'Staging Workflows' });
  console.log(`Created folders: ${prodFolder.id}, ${stagingFolder.id}`);

  // List folders
  const { data: folders } = await folderHandle.list();
  console.log(`Folders: ${folders.map((f) => f.name).join(', ')}`);

  // Update a folder
  await folderHandle.update(prodFolder.id, { name: 'Prod Workflows' });

  // Move a workflow into the folder
  await client.workflow().transfer('workflow-id', engineering.id);

  // Delete a folder (transfer contents first)
  await folderHandle.delete(stagingFolder.id, prodFolder.id);
  console.log('Deleted staging folder, contents transferred');
}

// ─── Update Project ─────────────────────────────────────────────────────────

if (engineering) {
  await client.project().update(engineering.id, { name: 'Engineering Team' });
  console.log('Updated project name');
}

// ─── Delete Project ─────────────────────────────────────────────────────────

const marketing = projects.find((p) => p.name === 'Marketing');
if (marketing) {
  await client.project().delete(marketing.id);
  console.log('Deleted Marketing project');
}
