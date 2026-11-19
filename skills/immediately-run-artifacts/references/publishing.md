# Publish a project to immediately.run

This reference is copied into each skill that needs it, so single-skill installs
remain complete. `$SKILL` means the directory of the calling `SKILL.md`, not this
reference directory. Its cache template is `$SKILL/templates/cache.yml`.

## Destination and authorization

Identify the project directory and whether it is a content repo or a React app.
Honor explicit owner, repository, branch, visibility, and local-only constraints.
For a new repo without an owner/name, the authenticated account (`gh api user
--jq .login`) and a subject-based name are reasonable defaults. Clarify visibility
only if it is not already established. A request to build does not automatically
authorize making the result public; a request to publish publicly already does.

Inspect an existing checkout's remotes, status, and branch before changing them.
If the user identifies an existing repo, update it without recreating it or changing
its visibility. For a proposed new repo, look it up with `gh repo view OWNER/REPO`.
Distinguish a confirmed not-found result from inaccessible private repos, expired
access, rate limits, and network errors. Do not overwrite a name collision or
blindly retry a creation whose result is uncertain.

Use a connected GitHub tool or the CLI. CLI examples below require `git`, `gh`,
authentication, and network access. A sandboxed `gh auth status` failure alone is
not proof that a token expired: confirm access using the environment's supported
network approval path. For genuinely missing authentication or repository rights,
finish independent local work and explain the access required.

## Preflight

Run relevant existing project checks. For an app, this commonly includes its build,
type check, and behavioral tests; run lint when required by the project or user.
For a Grove report with its checker available, use `check-report.mjs`.

Inspect `git status --short`, the diff, and the complete tracked file list. Exclude
credentials, generated dependencies/builds, and unrelated files. Resolve accidental
sensitive content before publishing. Preserve the repository's existing history;
do not reset, squash, force-push, or change visibility merely to tidy a release.

For a new repo, initialize Git if necessary, choose the intended branch (normally
`main`), and commit reviewed files. For existing repos, use their actual branch and
review/merge workflow. In the commands below, replace OWNER, REPO, and REF with
confirmed values. Do not assume all repositories use `main`.

## Public source and the Pages cache

The cache serves a prebuilt source ZIP from GitHub Pages, improving anonymous loads
and reducing GitHub API requests. Only publish it for public source. It is not a
requirement for the source URL to exist, and a successful cache is not a render test.

Inspect `.github/workflows/` and Pages settings before adding a cache. Do not replace
an unrelated Pages site, custom domain, or workflow. If the same Pages deployment
cannot safely carry the cache, leave the app URL working through GitHub, explain
the cache limitation, and resolve the hosting conflict separately.

For a new public repo without an existing Pages site:

1. Copy `$SKILL/templates/cache.yml` to `.github/workflows/cache.yml`. Adjust its
   push branch if the project does not use `main`; it publishes the running ref and
   commit SHA and redirects to the repository's actual default branch.
2. Commit the reviewed source and workflow.
3. Create and push the repository:

   ```bash
   gh repo create OWNER/REPO --public --source . --remote origin --push \
     --description "A one-line project summary" \
     --homepage "https://immediately.run/present/github/OWNER/REPO/REF"
   ```

   For an existing repo, use its normal push/merge path instead. Update its homepage
   or description only when appropriate to the requested publication.
4. Query `gh api repos/OWNER/REPO/pages`. If Pages is not configured and the repo's
   permissions support it, enable workflow deployment:

   ```bash
   gh api -X POST repos/OWNER/REPO/pages -f build_type=workflow
   gh workflow run cache.yml --repo OWNER/REPO --ref REF
   ```

   The initial push can race Pages setup. An explicit run after enabling Pages
   resolves that known case. Do not treat every failed Pages API call as harmless;
   inspect its error and existing state before retrying.

The template pins actions and the CLI; upgrade pins deliberately against current
upstream releases. Do not change registries or bypass package protections to force
an installation. Dependency-install fallback in the template can use the CDN;
check the cache build for skipped/failed compilation and fix source errors.

## Private source

Create with `--private` or preserve the existing private repository. Do not install
or run the public Pages cache. If a formerly public project is becoming private,
turning off future workflows does not retract old Pages artifacts; separately
resolve any already-published content before promising privacy.

Readers need to sign in to immediately.run with GitHub access to the repo. The
immediately.run GitHub App also needs repository access (GitHub Settings →
Applications → immediately.run → Configure → Repository access). Verify with an
existing authorized browser session if available. Otherwise identify this exact
reader-access check as outstanding; do not obtain or copy browser credentials.

## Verify the result

Verify GitHub visibility, actual branch, and pushed commit:

```bash
gh repo view OWNER/REPO --json url,visibility,defaultBranchRef,homepageUrl
gh run list --repo OWNER/REPO --workflow cache.yml --limit 3
```

For public projects with the cache enabled, wait for the relevant run to complete
and inspect failures with `gh run view RUN_ID --repo OWNER/REPO --log-failed`.
Check the cache URL at the repository's actual Pages base URL:
`https://OWNER.github.io/REPO/cached_repositories/REF.zip` is the standard project
site pattern; custom domains and account sites differ. Keep cache checks and
browser checks separate. Use the current supported URL encoding for unusual refs.

Open `https://immediately.run/present/github/OWNER/REPO/REF` with the available,
supported browser workflow. The React entry can resolve to `/files/src/App.tsx`.
Find the app by content or the observed sandbox frame; don't hardcode a sandbox
hostname. Verify the expected title, meaningful content, styles/assets, and an
important interaction. Check a narrow layout and the displayed source revision
when possible. A host shell, HTTP 200, ready label, or cache ZIP alone cannot prove
the app rendered. For Grove, check sections, images, the sidebar, and supported
light/dark themes. Use an installed Grove checker only where the environment's
browser policy permits it.

After a source correction, commit/push and verify the affected result. If access,
browser tooling, or host availability blocks the live check, report that limit and
provide the URL without calling the app verified. Stop retrying an unchanged
external failure and request the specific missing input or access when necessary.

## Handoff

Return the reading URL, repository URL, visibility, and verification result. Mention
whether the public cache finished or remains outstanding; for private projects,
identify any App-access step still needed. Branch-based links follow later pushes
to that branch; commit-pinned links preserve a revision. Grove content repos can
use their GitHub description/homepage as the handoff instead of adding a README
that would appear as another wiki page. React apps can include a normal README.
