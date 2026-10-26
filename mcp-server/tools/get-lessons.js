import { gitFetchIfStale, readRegistryFromGit, listLessons } from '../lib/repo.js';

export function registerGetLessons(server, repoPath, projects) {
  server.tool(
    'get_lessons',
    "List every Lesson from the Learning Tracks, one line each: Studied or not studied yet, track, title, and when it applies. Call this at session start in any project; when a Lesson applies to the work, say so in one line. get_project_memory already appends this list, so do not call both.",
    {},
    async () => {
      gitFetchIfStale(repoPath);
      const liveProjects = readRegistryFromGit(repoPath) || projects;
      const text = listLessons(repoPath, liveProjects) ?? 'No Lessons yet.';
      return { content: [{ type: 'text', text }] };
    }
  );
}
