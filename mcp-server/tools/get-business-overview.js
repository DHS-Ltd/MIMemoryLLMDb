import { gitReadFile, gitFetchIfStale, readFullRegistryFromGit, readFullRegistry } from '../lib/repo.js';

export function registerGetBusinessOverview(server, repoPath) {
  server.tool(
    'get_business_overview',
    "Get the whole-business brain overview for DHS: business identity and flywheel thesis (org/business.md), current north-star, all entities with their roles, all programs, the typed relationship map, and a one-line map of every registered project. Call this when the user asks about the business, strategy, 'the big picture', how projects relate to the company, or before reasoning about priorities.",
    {},
    async () => {
      gitFetchIfStale(repoPath);
      const registry = readFullRegistryFromGit(repoPath) || readFullRegistry(repoPath);
      if (!registry) {
        return { content: [{ type: 'text', text: 'Error: could not read registry.json from git or disk.' }] };
      }

      const sections = [];

      const business = gitReadFile(repoPath, 'org/business.md');
      sections.push(`═══ org/business.md ═══\n${business ?? '(not found)'}`);

      const northStar = gitReadFile(repoPath, 'org/north-star.md');
      sections.push(`═══ org/north-star.md ═══\n${northStar ?? '(not found)'}`);

      const entityLines = ['═══ Entities (registry) ═══'];
      for (const [id, e] of Object.entries(registry.entities || {})) {
        entityLines.push(`${id} | ${e.full_name} | ${e.role}`);
        if (e.owned_by) entityLines.push(`  owned_by: ${e.owned_by} (${e.ownership || 'n/a'})`);
        if (e.activities?.length) entityLines.push(`  activities: ${e.activities.join(', ')}`);
        for (const r of e.relationships || []) {
          entityLines.push(`  ${r.rel} -> ${r.target}`);
        }
        if (e.memory) entityLines.push(`  memory: ${e.memory} (use get_entity for full detail)`);
      }
      sections.push(entityLines.join('\n'));

      const programLines = ['═══ Programs (registry) ═══'];
      for (const [id, p] of Object.entries(registry.programs || {})) {
        programLines.push(`${id} | ${p.name} | entity: ${p.entity} | stage: ${p.stage}`);
      }
      sections.push(programLines.join('\n'));

      // Products (registry v2.1) — the commercial layer between pillars and projects.
      const productLines = ['═══ Products (registry) ═══'];
      for (const [id, pr] of Object.entries(registry.products || {})) {
        const star = pr.north_star ? '  ★ NORTH STAR' : '';
        productLines.push(
          `${id} | ${pr.name} | pillar: ${pr.pillar ?? '?'} | ${pr.provenance ?? '?'} | ` +
          `status: ${pr.status ?? '?'}${star}`
        );
        if (pr.role) productLines.push(`  role: ${pr.role}`);
        if (pr.revenue_line) productLines.push(`  revenue: ${pr.revenue_line}`);
        if (pr.vendor) productLines.push(`  vendor: ${pr.vendor}`);
        if (pr.build_state) productLines.push(`  build: ${pr.build_state}`);
        if (pr.commercial === false) productLines.push(`  NOT COMMERCIAL: ${pr.commercial_note ?? ''}`);
        if (pr.succeeded_by) productLines.push(`  succeeded_by: ${pr.succeeded_by}`);
        if (pr.succeeds) productLines.push(`  succeeds: ${pr.succeeds}`);
        if (pr.proof) {
          for (const [tier, evidence] of Object.entries(pr.proof)) {
            productLines.push(`  proves ${tier}: ${evidence}`);
          }
        }
        if (pr.projects?.length) productLines.push(`  projects: ${pr.projects.join(', ')}`);
        for (const risk of pr.risks || []) productLines.push(`  RISK: ${risk}`);
      }
      sections.push(productLines.join('\n'));

      const relationships = gitReadFile(repoPath, 'org/relationships.md');
      sections.push(`═══ org/relationships.md ═══\n${relationships ?? '(not found)'}`);

      const projectLines = ['═══ Projects (registry, one line each — use get_project_memory for detail) ═══'];
      for (const [id, p] of Object.entries(registry.projects || {})) {
        const edges = (p.relationships || [])
          .map(r => `${r.rel}->${r.target}${r.deadline ? ` (deadline ${r.deadline})` : ''}`)
          .join('; ');
        projectLines.push(
          `${id} | ${p.short_name} | ${p.status} | entity: ${p.entity ?? 'personal'} | ` +
          `${p.pillar ?? 'no-pillar'}/${p.product ?? 'no-product'} | ${p.role ?? ''}${edges ? ` | ${edges}` : ''}`
        );
      }
      sections.push(projectLines.join('\n'));

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );
}
