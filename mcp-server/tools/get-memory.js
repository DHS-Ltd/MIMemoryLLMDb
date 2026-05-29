import { z } from 'zod';
import { resolveProject, getProjectGitPath, parseMemoryLinks, gitReadFile, gitFetchIfStale, readRegistryFromGit } from '../lib/repo.js';

export function registerGetMemory(server, repoPath, projects) {
  server.tool(
    'get_project_memory',
    "Retrieve the full memory context for a specific project, including its MEMORY.md index and all referenced detail files. Call this when working on a specific project and you need its architecture decisions, configs, or historical context. Accepts project ID (MIMP-001) or short name (mimp).",
    {
      project: z.string().describe('Project ID (MIMP-001) or short name (e.g. mimp, v1HMS)'),
      include_referenced_files: z.boolean().optional()
        .describe('If true, also return content of files referenced in MEMORY.md. Default: true'),
    },
    async (args) => {
      gitFetchIfStale(repoPath);
      const liveProjects = readRegistryFromGit(repoPath) || projects;
      const result = resolveProject(liveProjects, args.project);
      if (!result) {
        return {
          content: [{
            type: 'text',
            text: `Error: Project '${args.project}' not found in registry. Use list_projects to see available projects.`,
          }],
        };
      }

      const [id, project] = result;
      const gitFolder = getProjectGitPath(id, project.short_name);
      const memoryGitPath = `${gitFolder}/MEMORY.md`;
      const memoryContent = gitReadFile(repoPath, memoryGitPath);

      if (!memoryContent) {
        return {
          content: [{
            type: 'text',
            text: `Error: MEMORY.md not found for project ${id} at ${memoryGitPath}`,
          }],
        };
      }

      const sections = [];
      sections.push(`═══ MEMORY.md ═══\n${memoryContent}`);

      const includeReferenced = args.include_referenced_files !== false;
      if (includeReferenced) {
        const referencedFiles = parseMemoryLinks(memoryContent);
        for (const filename of referencedFiles) {
          const fileGitPath = `${gitFolder}/${filename}`;
          const fileContent = gitReadFile(repoPath, fileGitPath);
          if (fileContent) {
            sections.push(`═══ ${filename} ═══\n${fileContent}`);
          } else {
            sections.push(`═══ ${filename} ═══\n(file not found)`);
          }
        }
      }

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );
}
