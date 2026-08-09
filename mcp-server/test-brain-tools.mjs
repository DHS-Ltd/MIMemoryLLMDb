// Ad-hoc test harness for the step-1e brain tools. Run: node test-brain-tools.mjs
// Spawns the real server over stdio and calls each new tool, printing truncated output.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const PREVIEW_CHARS = 900;

function preview(result, label) {
  const text = result.content?.[0]?.text ?? '(no text content)';
  console.log(`\n########## ${label} — ${text.length} chars ##########`);
  console.log(text.slice(0, PREVIEW_CHARS));
  if (text.length > PREVIEW_CHARS) console.log(`... [truncated, total ${text.length} chars]`);
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['index.js'],
  cwd: import.meta.dirname,
});
const client = new Client({ name: 'brain-tools-test', version: '0.0.1' });
await client.connect(transport);

const tools = await client.listTools();
console.log('Registered tools:', tools.tools.map(t => t.name).join(', '));

preview(await client.callTool({ name: 'get_business_overview', arguments: {} }), 'get_business_overview');
preview(await client.callTool({ name: 'get_entity', arguments: { entity: 'bdc' } }), "get_entity('bdc')");
preview(await client.callTool({ name: 'get_entity', arguments: { entity: 'nope' } }), "get_entity('nope') [expect error]");
preview(await client.callTool({ name: 'get_decisions', arguments: { summaries_only: true } }), 'get_decisions(summaries_only)');
preview(await client.callTool({ name: 'get_decisions', arguments: { scope: 'mcp-server' } }), "get_decisions(scope='mcp-server')");
preview(await client.callTool({ name: 'get_decisions', arguments: { tag: 'pacs', since: '2026-06-01' } }), "get_decisions(tag='pacs', since='2026-06-01') [expect none]");
preview(await client.callTool({ name: 'whats_next', arguments: {} }), 'whats_next');

// ── Phase 3: Wiki retrieval ────────────────────────────────────────────────
preview(await client.callTool({ name: 'get_wiki_page', arguments: {} }), 'get_wiki_page() [list]');
preview(await client.callTool({ name: 'get_wiki_page', arguments: { page: 'INDEX' } }), "get_wiki_page('INDEX')");
preview(await client.callTool({ name: 'get_wiki_page', arguments: { page: 'RULES.md' } }), "get_wiki_page('RULES.md') [extension tolerated]");
preview(await client.callTool({ name: 'get_wiki_page', arguments: { page: 'nope' } }), "get_wiki_page('nope') [expect error]");

// scope: org/ and wiki/ were unsearchable before Phase 3
preview(await client.callTool({ name: 'search_memories', arguments: { query: 'surgeon' } }), "search_memories('surgeon') [scope=all]");
preview(await client.callTool({ name: 'search_memories', arguments: { query: 'north star', scope: 'org' } }), "search_memories('north star', scope='org')");
preview(await client.callTool({ name: 'search_memories', arguments: { query: 'Inobitec', scope: 'cards' } }), "search_memories('Inobitec', scope='cards')");
preview(await client.callTool({ name: 'search_memories', arguments: { query: 'orthanc', scope: 'projects' } }), "search_memories('orthanc', scope='projects') [legacy behaviour]");

await client.close();
console.log('\nAll calls completed.');
console.log(
  '\nNOTE: this server reads origin/master, not the working tree. Anything committed but not\n' +
  'pushed will be absent above — that is correct behaviour, not a failure.'
);
