import { z } from 'zod';
import { gitReadFile, gitListMdTree, gitFetchIfStale, parseFrontmatter } from '../lib/repo.js';

const MAX_CHARS = 40_000;

// Resolve a caller's loose name to a git path under wiki/.
// Accepts 'INDEX', 'INDEX.md', 'wiki/INDEX.md', or a frontmatter alias.
function resolvePage(repoPath, query, paths) {
  const q = query.trim().toLowerCase().replace(/^wiki\//, '').replace(/\.md$/, '');

  for (const p of paths) {
    const stem = p.replace(/^wiki\//, '').replace(/\.md$/, '');
    if (stem.toLowerCase() === q) return p;
  }
  for (const p of paths) {
    const content = gitReadFile(repoPath, p);
    if (!content) continue;
    const { meta } = parseFrontmatter(content);
    const aliases = [].concat(meta.aliases ?? []);
    if (aliases.some(a => String(a).toLowerCase() === q)) return p;
  }
  return null;
}

export function registerGetWikiPage(server, repoPath) {
  server.tool(
    'get_wiki_page',
    "Read a page from the Wiki — the layer holding synthesis drawn from Sources across DHS's repos, where every claim cites a Source card. Call with no argument to list every page plus the index. Returns the page plus its outbound links so you can follow the synthesis. Remember the Wiki CITES rather than asserts: for commercial claims the Authority is E:\\DHS-PACS, and if the two disagree the Source wins.",
    {
      page: z.string().optional()
        .describe("Page name, e.g. 'INDEX' or 'RULES'. Extension and the wiki/ prefix are optional. Omit to list all pages."),
    },
    async (args) => {
      gitFetchIfStale(repoPath);
      const paths = gitListMdTree(repoPath, 'wiki');

      if (!paths.length) {
        return {
          content: [{
            type: 'text',
            text: 'The Wiki is empty on origin/master. Either nothing has been written yet, or the '
                + 'work is committed locally but NOT PUSHED — this server reads origin/master, not '
                + 'your working tree.',
          }],
        };
      }

      if (!args.page) {
        const lines = [`═══ Wiki — ${paths.length} page(s) ═══`];
        for (const p of paths) {
          const content = gitReadFile(repoPath, p);
          const { meta, body } = parseFrontmatter(content ?? '');
          const heading = body.match(/^#\s+(.+)$/m)?.[1]?.trim();
          lines.push(`${p}${heading ? ` — ${heading}` : ''}${meta.status ? ` [${meta.status}]` : ''}`);
        }
        lines.push('', "Call get_wiki_page with a page name to read one. Start with 'INDEX'.");
        return { content: [{ type: 'text', text: lines.join('\n') }] };
      }

      const gitPath = resolvePage(repoPath, args.page, paths);
      if (!gitPath) {
        return {
          content: [{
            type: 'text',
            text: `Error: no Wiki page matching '${args.page}'.\nAvailable:\n${paths.join('\n')}`,
          }],
        };
      }

      const content = gitReadFile(repoPath, gitPath);
      if (!content) {
        return { content: [{ type: 'text', text: `Error: could not read ${gitPath} from git objects.` }] };
      }

      // Outbound links: wikilinks plus relative .md links, so the caller can traverse.
      const outbound = new Set();
      for (const m of content.matchAll(/\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]/g)) outbound.add(m[1].trim());
      for (const m of content.matchAll(/\[[^\]]*\]\(([^)\s]+\.md)(?:#[^)]*)?\)/g)) outbound.add(m[1]);

      const body = content.length > MAX_CHARS
        ? content.slice(0, MAX_CHARS) + `\n\n[...truncated at ${MAX_CHARS} chars]`
        : content;

      const sections = [`═══ ${gitPath} ═══`, body];
      sections.push(
        '═══ Outbound links ═══\n' +
        (outbound.size ? [...outbound].map(l => `- ${l}`).join('\n') : '(none)')
      );

      return { content: [{ type: 'text', text: sections.join('\n\n') }] };
    }
  );
}
