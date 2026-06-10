import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getConfig, readRegistry, gitFetchIfStale, gitReadFile } from './lib/repo.js';
import { registerListProjects } from './tools/list-projects.js';
import { registerGetMemory } from './tools/get-memory.js';
import { registerSearchMemory } from './tools/search-memory.js';
import { registerGetBusinessOverview } from './tools/get-business-overview.js';
import { registerGetEntity } from './tools/get-entity.js';
import { registerGetDecisions } from './tools/get-decisions.js';
import { registerWhatsNext } from './tools/whats-next.js';

async function main() {
  let config;
  try {
    config = getConfig();
  } catch (err) {
    console.error(`[mimp-memory] Startup error: ${err.message}`);
    process.exit(1);
  }

  const repoPath = config.repo_path;
  if (!repoPath) {
    console.error('[mimp-memory] repo_path is not set in ~/.mimp-config.json');
    process.exit(1);
  }

  let projects;
  try {
    projects = readRegistry(repoPath);
  } catch (err) {
    console.error(`[mimp-memory] Registry error: ${err.message}`);
    process.exit(1);
  }

  const server = new McpServer({
    name: 'mmp-memory',
    version: '1.0.0',
  });

  registerListProjects(server, repoPath, projects);
  registerGetMemory(server, repoPath, projects);
  registerSearchMemory(server, repoPath, projects);

  // Brain tools (Phase 2, step 1e) — surface org/ + registry v2.0 to the assistant
  registerGetBusinessOverview(server, repoPath);
  registerGetEntity(server, repoPath);
  registerGetDecisions(server, repoPath);
  registerWhatsNext(server, repoPath);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
