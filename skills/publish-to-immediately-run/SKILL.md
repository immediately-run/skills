---
name: publish-to-immediately-run
description: Publish or update an immediately.run project on GitHub and verify its reading link. Handles repository ownership, public/private visibility, existing repositories, the public GitHub Pages cache, and live app checks. Use when the user asks to publish or share an immediately.run app, Grove report, or Lodestar board.
---

# Publish to immediately.run

**`$SKILL` means the directory containing this file.** Read and follow
[references/publishing.md](references/publishing.md); the workflow and cache
template are self-contained in this skill.

immediately.run loads source from GitHub. Publishing an authorized project means
pushing its source to the intended repository and returning the reading link. The
public Pages cache improves anonymous loading; it is distinct from both app
verification and publication to the ChatGPT/Codex plugin directory.

Key decisions:

- Identify whether this is a content repo (`immediately.run.json` with `opensWith`)
  or an app (`package.json` and a root component such as `src/App.tsx`). Preserve it.
- Honor the user's repository, branch, visibility, and publication instructions.
  Resolve missing visibility before exposing content. Do not ask again when the
  user has already authorized public or private publication.
- Support existing repositories as well as new ones; preserve history and existing
  Pages workflows. A failed repository lookup does not prove the name is free.
- Use GitHub CLI or a suitable connected GitHub tool. Separate a network/sandbox
  failure from a confirmed authentication failure, and use the environment's
  supported approval mechanism when execution requires it.
- Run the checks the project actually provides. Do not require nonexistent lint
  scripts or rewrite history to squash drafts as a publication prerequisite.
- Publish a Pages cache only for public source, and verify its result separately
  from the app's rendered behavior. Never expose private source through Pages.
- Use supported browser tools and inspect the intended app inside its iframe.
  Existing authorized sessions may verify private apps; otherwise explain the
  access step that remains. Do not inspect browser credentials or session stores.

Report the reading link, repository link, visibility, cache result, and actual
render/interaction checks. If blocked, state the specific remaining step without
claiming publication or verification succeeded.
