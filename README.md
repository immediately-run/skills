# immediately.run skills

Agent skills for creating and publishing on [immediately.run](https://immediately.run),
which runs a GitHub repo in the reader's browser. Public projects have shareable
reading and fork links; private projects require reader access. No separate hosted
backend is needed for the self-contained apps and reports in these workflows.

| Skill | What it does |
| --- | --- |
| [`immediately-run-artifacts`](skills/immediately-run-artifacts/SKILL.md) | Builds interactive React apps, visual explanations, and simulations with custom controls, sandbox-safe styling/assets, and live verification. |
| [`grove-report`](skills/grove-report/SKILL.md) | Writes a polished, artifact-style report as a [Grove](https://github.com/immediately-run/grove) wiki: one small MDX file per section composed into one page, figures as JSON data, themed stat tiles, charts and cards. The source can be your research, notes, data, an HTML page, a Claude artifact or a ChatGPT, Codex or Gemini canvas. |
| [`publish-to-immediately-run`](skills/publish-to-immediately-run/SKILL.md) | Publishes a project as a GitHub repo with an immediately.run link, public or private, with the Pages cache that keeps it fast for anonymous readers. |

Ask your agent something like *"explain Fourier series with interactive sliders on
immediately.run"*, *"write up our Q3 support numbers as a Grove report"*, or
*"publish this app to my existing private repository"*. Choose the interactive app
skill when controls and exploration are central; choose Grove when prose and
figures lead. The publishing skill supports either format.

**Needs:** a code execution environment and the project's compatible Node toolchain.
Repository helpers require Node 18+; packaging uses Python 3.10+ (no third-party
packages). Publication uses authenticated GitHub CLI or a suitable GitHub connector.
Live verification needs supported browser tools; the optional Grove headless
checker uses Playwright and Chrome/Chromium where permitted. A local platform
preview can use `npx @immediately-run/cli`. No immediately.run SDK is needed for
ordinary React controls and diagrams.

The skills are written to the open [Agent Skills](https://agentskills.io) format, so
they work in any agent that reads `SKILL.md`. `skills/grove-report/example/` is a
complete sample report the skill copies from.

## Install

### Any agent, with the `skills` CLI

```bash
npx skills add immediately-run/skills
```

It asks which agents to install into (Claude Code, Codex, Antigravity, Pi, opencode
and many more); `-a <agent>` picks one without asking, and `-g` installs for your user
instead of the current project.

### Claude Code

```
/plugin marketplace add immediately-run/skills
/plugin install immediately-run@immediately-run-plugins
```

Update with `/plugin marketplace update immediately-run-plugins`.

### Codex

Inside a Codex session:

```
$skill-installer install https://github.com/immediately-run/skills/tree/main/skills/immediately-run-artifacts
$skill-installer install https://github.com/immediately-run/skills/tree/main/skills/grove-report
$skill-installer install https://github.com/immediately-run/skills/tree/main/skills/publish-to-immediately-run
```

or copy the desired skill folders under `skills/` into `~/.agents/skills/` (for you) or a
project's `.agents/skills/`. Codex discovers installed skills automatically; restart
if one does not appear. Use the environment's supported approval flow when network
or browser execution requires it. Existing publication authorization is retained.

### Antigravity

`npx skills add immediately-run/skills -a antigravity`, or copy the desired skill folders under
`skills/` into `~/.gemini/antigravity/skills/` (for you) or a workspace's
`.agents/skills/`.

### Pi

```bash
pi install git:github.com/immediately-run/skills
```

Pi finds the skills in the repo's `skills/` folder. Add `-l` to install for the
current project only.

### opencode

Add the skills URL to `opencode.json` (project) or `~/.config/opencode/opencode.json`
(global):

```json
{
  "skills": {
    "urls": ["https://raw.githubusercontent.com/immediately-run/skills/main/skills/"]
  }
}
```

opencode reads `skills/index.json` there and re-downloads a skill when its `version`
changes. For a local checkout instead: `{ "skills": { "paths": ["<checkout>/skills"] } }`.

### ChatGPT/Codex plugin package

`plugin.json` packages all three skills using the portable Agent Plugins format,
with listing metadata and the existing immediately.run logo. It is a skills-only
plugin: no bundled MCP server, credentials, or lifecycle hooks.

GitHub availability and a plugin ZIP do not imply a public directory listing.
See [plugin publication](docs/plugin-publication.md) for package generation,
validation, and the OpenAI submission/review steps.

## Working on the skills

Each skill is a self-contained folder under `skills/`, because most installers copy
one folder at a time; a skill may not reach into another's files. Where two skills need
the same file, each carries a copy, and the check below keeps the copies identical.

After changing anything under `skills/`:

```bash
node scripts/gen-index.mjs           # regenerate skills/index.json (opencode)
node scripts/gen-index.mjs --check   # index, marketplace and shared copies agree
node scripts/check-plugin.mjs        # manifest, listing, assets, versions and references
node skills/grove-report/scripts/check-report.mjs skills/grove-report/example
node --test tests/*.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts/package-plugin.py    # writes dist/immediately-run-VERSION.zip
```

Bump `version` in both `plugin.json` and `.claude-plugin/marketplace.json` with each
release. The checks keep them aligned; opencode versions are content hashes and
update automatically. The package builder ships only the manifest, license,
listing assets, and indexed skill files; it excludes repository metadata and
workspace/build files, and produces a reproducible ZIP with a SHA-256 digest.

Try an edit before publishing it: `claude --plugin-dir .` from this checkout, or point
any other agent's skills path at `skills/`. To see the sample report on the real host,
commit a copy of `skills/grove-report/example/` into its own git repo and run
`npx @immediately-run/cli dev` there.

The first skill published here, `create-immediately-run-artifact`, turned a Claude
artifact into a standalone app; its last version is at
commit [`f801bfc`](https://github.com/immediately-run/skills/tree/f801bfc). Grove remains
the prose-first route. The interactive app workflow returns as a complementary
skill, informed by the independently developed
[Maxwell field guide](https://github.com/neumark/maxwell-equations), including its
real-host styling, font, and iframe-verification lessons.

## License

MIT for the skills and tooling. The unmodified immediately.run logo retains its
upstream Apache-2.0 license; see [asset provenance](assets/NOTICE.md).
