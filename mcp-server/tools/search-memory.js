import { z } from 'zod';
import { resolveProject, getProjectGitPath, gitReadFile, gitListProjectPaths, gitListMdPaths } from '../lib/repo.js';

const MAX_MATCHES = 20;

export function registerSearchMemory(server, repoPath, projects) {
  server.tool(
    'search_memories',
    "Search across all project memories for keywords or topics. Returns matching lines with surrounding context from any project. Call this when the user's question might be answered by knowledge from another project, or when looking for cross-project patterns like shared configs, similar setups, or reusable solutions.",
    {
      query: z.string().describe('Search query — keywords to find across all project memories'),
      project_filter: z.string().optional()
        .describe('Optional: limit search to a specific project ID or short name'),
    },
    async (args) => {
      const { query, project_filter } = args;
      if (!query || !query.trim()) {
        return { content: [{ type: 'text', text: 'Error: query is required' }] };
      }

      const words = query.trim().toLowerCase().split(/\s+/);

      let foldersToSearch;
      if (project_filter) {
        const result = resolveProject(projects, project_filter);
        if (!result) {
          return {
            content: [{
              type: 'text',
              text: `Error: Project '${project_filter}' not found in registry. Use list_projects to see available projects.`,
            }],
          };
        }
        const [id, project] = result;
        foldersToSearch = [getProjectGitPath(id, project.short_name)];
      } else {
        foldersToSearch = gitListProjectPaths(repoPath);
      }

      const matches = [];

      outer:
      for (const folder of foldersToSearch) {
        const mdPaths = gitListMdPaths(repoPath, folder);
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
        return { content: [{ type: 'text', text: `No matches found for "${query}"` }] };
      }

      const output = [`Found ${matches.length} match${matches.length === 1 ? '' : 'es'} for "${query}":\n`];
      for (const m of matches) {
        output.push(`── ${m.relPath} (line ${m.lineNum}) ──`);
        output.push(m.context);
        output.push('');
      }

      return { content: [{ type: 'text', text: output.join('\n').trimEnd() }] };
    }
  );
}
