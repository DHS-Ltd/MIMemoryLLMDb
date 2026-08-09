import { z } from 'zod';
import { resolveProject, getProjectGitPath, gitReadFile, gitListProjectPaths, gitListMdPaths, gitListMdTree, gitFetchIfStale, readRegistryFromGit } from '../lib/repo.js';

const MAX_MATCHES = 20;

export function registerSearchMemory(server, repoPath, projects) {
  server.tool(
    'search_memories',
    "Search the whole DHS brain for keywords or topics — project memories, the Wiki (Sourced synthesis), the org layer (business, north-star, entities, programs, decisions), and Source cards. Returns matching lines with surrounding context. Call this when the user's question might be answered by knowledge from another project, when looking for cross-project patterns, or when checking what the brain already records about a business topic. Note org/ and wiki/ were previously unsearchable — use scope to narrow if project results are being drowned out.",
    {
      query: z.string().describe('Search query — keywords to find across the brain'),
      project_filter: z.string().optional()
        .describe('Optional: limit search to a specific project ID or short name. Implies scope=projects.'),
      scope: z.enum(['all', 'projects', 'wiki', 'org', 'cards']).optional()
        .describe("Where to search. 'all' (default) covers everything; 'projects' is the pre-2026-08 behaviour; 'org' is business/strategy/decisions; 'wiki' is Sourced synthesis; 'cards' is Source card abstracts."),
    },
    async (args) => {
      gitFetchIfStale(repoPath);
      const liveProjects = readRegistryFromGit(repoPath) || projects;
      const { query, project_filter } = args;
      const scope = args.scope ?? (project_filter ? 'projects' : 'all');
      if (!query || !query.trim()) {
        return { content: [{ type: 'text', text: 'Error: query is required' }] };
      }

      const words = query.trim().toLowerCase().split(/\s+/);

      // Each entry is [gitFolder, isProjectFolder]. Project folders are depth-1;
      // org/ and wiki/ need a recursive listing.
      let foldersToSearch = [];
      if (project_filter) {
        const result = resolveProject(liveProjects, project_filter);
        if (!result) {
          return {
            content: [{
              type: 'text',
              text: `Error: Project '${project_filter}' not found in registry. Use list_projects to see available projects.`,
            }],
          };
        }
        const [id, project] = result;
        foldersToSearch = [[getProjectGitPath(id, project.short_name), true]];
      } else {
        if (scope === 'all' || scope === 'projects') {
          foldersToSearch.push(...gitListProjectPaths(repoPath).map(f => [f, true]));
        }
        if (scope === 'all' || scope === 'org') foldersToSearch.push(['org', false]);
        if (scope === 'all' || scope === 'wiki') foldersToSearch.push(['wiki', false]);
        if (scope === 'all' || scope === 'cards') foldersToSearch.push(['raw/_cards', false]);
      }

      const matches = [];

      outer:
      for (const [folder, isProject] of foldersToSearch) {
        const mdPaths = isProject ? gitListMdPaths(repoPath, folder) : gitListMdTree(repoPath, folder);
        for (const gitPath of mdPaths) {
          const content = gitReadFile(repoPath, gitPath);
          if (!content) continue;

          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            const lineLower = lines[i].toLowerCase();
            if (words.every(w => lineLower.includes(w))) {
              const start = Math.max(0, i - 2);
              const end = Math.min(lines.length - 1, i + 2);
              const contextLines = lines.slice(start, end + 1);
              const relPath = gitPath.replace(/^projects\//, '');
              matches.push({ relPath, lineNum: i + 1, context: contextLines.join('\n') });
              if (matches.length >= MAX_MATCHES) break outer;
            }
          }
        }
      }

      if (matches.length === 0) {
        return { content: [{ type: 'text', text: `No matches found for "${query}" (scope: ${scope})` }] };
      }

      const output = [`Found ${matches.length} match${matches.length === 1 ? '' : 'es'} for "${query}" (scope: ${scope}):\n`];
      for (const m of matches) {
        output.push(`── ${m.relPath} (line ${m.lineNum}) ──`);
        output.push(m.context);
        output.push('');
      }

      return { content: [{ type: 'text', text: output.join('\n').trimEnd() }] };
    }
  );
}
