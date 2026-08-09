import { z } from 'zod';
import { gitReadFile, gitFetchIfStale, readFullRegistryFromGit, readFullRegistry } from '../lib/repo.js';

// Case-insensitive lookup by entity id (DHS) or full name. Returns [id, entity] or null.
function resolveEntity(entities, query) {
  if (!query) return null;
  const q = query.trim().toLowerCase();
  for (const [id, entity] of Object.entries(entities)) {
    if (id.toLowerCase() === q || entity.full_name?.toLowerCase() === q) {
      return [id, entity];
    }
  }
  return null;
}

export function registerGetEntity(server, repoPath) {
  server.tool(
    'get_entity',
    "Get the full picture of one business entity (e.g. DHS or BDC): its registry record, its full memory file (org/entities/*.md), every program it runs (with program memory), and every registered project it owns or serves. Call this when the user asks about a specific company/entity, its operations, people, or what work belongs to it.",
    {
      entity: z.string().describe("Entity ID or full name, e.g. 'DHS', 'BDC', 'Baroicha Diagnostic Center Ltd'"),
    },
    async (args) => {
      gitFetchIfStale(repoPath);
      const registry = readFullRegistryFromGit(repoPath) || readFullRegistry(repoPath);
      if (!registry) {
        return { content: [{ type: 'text', text: 'Error: could not read registry.json from git or disk.' }] };
      }

      const entities = registry.entities || {};
      const result = resolveEntity(entities, args.entity);
      if (!result) {
        const available = Object.keys(entities).join(', ') || '(none)';
        return {
          content: [{
            type: 'text',
            text: `Error: entity '${args.entity}' not found. Available entities: ${available}`,
          }],
        };
      }

      const [id, entity] = result;
      const sections = [];

      const recordLines = [`═══ Entity record: ${id} (registry) ═══`];
      recordLines.push(`full_name: ${entity.full_name}`);
      recordLines.push(`role: ${entity.role}`);
      if (entity.owned_by) recordLines.push(`owned_by: ${entity.owned_by} (${entity.ownership || 'n/a'})`);
      if (entity.market) recordLines.push(`market: ${entity.market}`);
      if (entity.location) recordLines.push(`location: ${entity.location}`);
      if (entity.activities?.length) recordLines.push(`activities: ${entity.activities.join(', ')}`);
      if (entity.tags?.length) recordLines.push(`tags: ${entity.tags.join(', ')}`);
      for (const r of entity.relationships || []) {
        recordLines.push(`relationship: ${r.rel} -> ${r.target}`);
      }
      sections.push(recordLines.join('\n'));

      if (entity.memory) {
        const memoryContent = gitReadFile(repoPath, entity.memory);
        sections.push(`═══ ${entity.memory} ═══\n${memoryContent ?? '(not found)'}`);
      }

      for (const [progId, prog] of Object.entries(registry.programs || {})) {
        if (prog.entity !== id) continue;
        sections.push(`═══ Program: ${progId} — ${prog.name} (stage: ${prog.stage}) ═══`);
        if (prog.memory) {
          const progContent = gitReadFile(repoPath, prog.memory);
          sections.push(progContent ?? `(${prog.memory} not found)`);
        }
      }

      const projectLines = [`═══ Projects owned by or serving ${id} ═══`];
      let projectCount = 0;
      for (const [projId, p] of Object.entries(registry.projects || {})) {
        const owns = p.entity === id;
        const serves = (p.serves || []).includes(id);
        if (!owns && !serves) continue;
        projectCount++;
        const link = owns && serves ? 'owns+serves' : owns ? 'owns' : 'serves';
        projectLines.push(`${projId} | ${p.short_name} | ${p.status} | ${link} | ${p.pillar ?? 'no-pillar'}/${p.product ?? 'no-product'} | ${p.role ?? ''}`);
      }
      if (projectCount === 0) projectLines.push('(none)');
      projectLines.push('');
      projectLines.push('Use get_project_memory for full detail on any project.');
      sections.push(projectLines.join('\n'));

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );
}
