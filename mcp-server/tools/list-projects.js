import { z } from 'zod';
import { getProjectGitPath, gitReadFile, gitFetchIfStale, readRegistryFromGit } from '../lib/repo.js';

export function registerListProjects(server, repoPath, projects) {
  server.tool(
    'list_projects',
    "List all registered projects in the MIMemoryLLMDb memory system. Returns project IDs, names, and brief summaries. Call this when you need to know what projects exist, or when the user mentions a project you don't have context for.",
    {
      status_filter: z.enum(['active', 'archived', 'all'])
        .optional()
        .describe('Filter by project status. Default: active'),
    },
    async (args) => {
      gitFetchIfStale(repoPath);
      const liveProjects = readRegistryFromGit(repoPath) || projects;
      const filter = args.status_filter || 'active';

      const entries = Object.entries(liveProjects).filter(([, p]) => {
        if (filter === 'all') return true;
        return p.status === filter;
      });

      if (entries.length === 0) {
        return { content: [{ type: 'text', text: `No projects found with status: ${filter}` }] };
      }

      const lines = [];
      for (const [id, project] of entries) {
        lines.push(`${id} | ${project.short_name} | ${project.full_name} | ${project.status}`);

        const gitPath = getProjectGitPath(id, project.short_name);
        const memoryContent = gitReadFile(repoPath, `${gitPath}/MEMORY.md`);
        if (memoryContent) {
          const summary = extractSummary(memoryContent);
          lines.push(`  Summary: ${summary}`);
        } else {
          lines.push(`  Summary: (no MEMORY.md found)`);
        }
        lines.push('');
      }

      return { content: [{ type: 'text', text: lines.join('\n').trimEnd() }] };
    }
  );
}

function extractSummary(content) {
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('|')) {
      const cell = trimmed.replace(/^\|\s*/, '').split('|')[0].trim();
      if (cell && cell !== '---' && !cell.startsWith('File')) return cell.slice(0, 120);
      continue;
    }
    if (trimmed.startsWith('- ')) {
      return trimmed.slice(2).replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').slice(0, 120);
    }
    return trimmed.slice(0, 120);
  }
  return '(empty)';
}
