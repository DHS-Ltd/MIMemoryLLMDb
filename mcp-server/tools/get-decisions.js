import { z } from 'zod';
import { gitReadFile, gitListMdPaths, gitFetchIfStale, parseFrontmatter, extractTitle } from '../lib/repo.js';

const DECISIONS_FOLDER = 'org/decisions';

export function registerGetDecisions(server, repoPath) {
  server.tool(
    'get_decisions',
    "Query the architecture/business decision log (ADRs in org/decisions/). Each ADR records what was decided, why, the rejected alternatives, and the path-impact. Filter by scope (e.g. infra, projects, MIMP-005, mcp-server), tag (e.g. pacs, sparse-checkout), date, or status. Call this when the user asks why something was done a certain way, what was decided about a topic, or before revisiting/reversing a past choice.",
    {
      scope: z.string().optional()
        .describe("Filter: only ADRs whose scope includes this token (e.g. 'infra', 'projects', 'MIMP-005', 'mcp-server')"),
      tag: z.string().optional()
        .describe("Filter: only ADRs whose tags include this token (e.g. 'pacs', 'mcp', 'fork')"),
      since: z.string().optional()
        .describe('Filter: only ADRs dated on/after this date (YYYY-MM-DD)'),
      status: z.enum(['proposed', 'accepted', 'superseded', 'reversed']).optional()
        .describe('Filter by ADR status'),
      summaries_only: z.boolean().optional()
        .describe('If true, return one line per ADR (id, date, status, title, scope, tags) instead of full text. Default: false'),
    },
    async (args) => {
      gitFetchIfStale(repoPath);

      const mdPaths = gitListMdPaths(repoPath, DECISIONS_FOLDER)
        .filter(p => !p.toLowerCase().includes('_template'));

      if (mdPaths.length === 0) {
        return { content: [{ type: 'text', text: `No ADRs found under ${DECISIONS_FOLDER}/` }] };
      }

      const adrs = [];
      for (const gitPath of mdPaths) {
        const content = gitReadFile(repoPath, gitPath);
        if (!content) continue;
        const { meta, body } = parseFrontmatter(content);
        adrs.push({
          gitPath,
          id: meta.id || gitPath,
          date: meta.date || '',
          status: meta.status || 'unknown',
          scope: (meta.scope || []).map(s => s.toLowerCase()),
          tags: (meta.tags || []).map(t => t.toLowerCase()),
          supersedes: meta.supersedes || null,
          superseded_by: meta.superseded_by || null,
          title: extractTitle(body) || meta.id || gitPath,
          body: body.trim(),
        });
      }

      const filtered = adrs.filter(adr => {
        if (args.scope && !adr.scope.includes(args.scope.trim().toLowerCase())) return false;
        if (args.tag && !adr.tags.includes(args.tag.trim().toLowerCase())) return false;
        if (args.since && adr.date && adr.date < args.since) return false;
        if (args.status && adr.status !== args.status) return false;
        return true;
      });

      if (filtered.length === 0) {
        const applied = ['scope', 'tag', 'since', 'status']
          .filter(k => args[k]).map(k => `${k}=${args[k]}`).join(', ');
        return {
          content: [{
            type: 'text',
            text: `No ADRs match the filters (${applied}). ${adrs.length} ADRs exist — call without filters or with summaries_only=true to list them.`,
          }],
        };
      }

      filtered.sort((a, b) => a.id.localeCompare(b.id));

      const output = [`${filtered.length} of ${adrs.length} ADRs:\n`];
      for (const adr of filtered) {
        if (args.summaries_only) {
          output.push(`${adr.id} | ${adr.date} | ${adr.status} | ${adr.title} | scope: [${adr.scope.join(', ')}] | tags: [${adr.tags.join(', ')}]`);
        } else {
          const chain = [
            adr.supersedes ? `supersedes: ${adr.supersedes}` : null,
            adr.superseded_by ? `superseded_by: ${adr.superseded_by}` : null,
          ].filter(Boolean).join(' | ');
          output.push(`═══ ${adr.id} (${adr.date}, ${adr.status})${chain ? ` | ${chain}` : ''} ═══`);
          output.push(adr.body);
          output.push('');
        }
      }

      return { content: [{ type: 'text', text: output.join('\n').trimEnd() }] };
    }
  );
}
