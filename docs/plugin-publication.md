# Publishing the ChatGPT/Codex plugin

The root `plugin.json` is a portable Agent Plugins manifest. It automatically
includes the three folders under `skills/` and provides OpenAI listing metadata,
icons, starter prompts, and skill review prompts. Existing Claude Code marketplace,
Codex single-skill, Pi, and opencode installs remain supported.

## Build the submission artifact

From the repository root, with Node 18+ and Python 3.10+:

```sh
node scripts/gen-index.mjs --check
node scripts/check-plugin.mjs
node skills/grove-report/scripts/check-report.mjs skills/grove-report/example
node --test tests/*.test.cjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 scripts/package-plugin.py
```

The last command writes `dist/immediately-run-VERSION.zip` and prints its SHA-256.
`plugin.json` is at the archive root, not inside an extra parent directory. The
builder includes only explicitly enumerated distribution inputs and rejects
symlinks or paths escaping the package. The ZIP does not contain `.git`, local
credentials, `node_modules`, or previous builds. Build from the exact reviewed
release commit and retain the ZIP unchanged through submission.

The local checker verifies the fields and size limits used by this package. It is
not the OpenAI portal's validator and cannot establish directory approval. The
[rehearsal scenarios](skill-rehearsal.md) describe expected behavior and are marked
unrun; local tooling tests do not establish that a model passed them. Test relevant
workflows in a clean installation before submitting and report verification limits.

## Complete the public listing

The source package is installable, but public submission metadata is incomplete
until the publisher confirms the following values. Keep unknown fields absent:

- The intended verified individual or business identity, reflected in
  `extensions.com.openai.interface.developerName`.
- Published `privacyPolicyURL` and `termsOfServiceURL` covering this plugin.
  Along with `websiteURL` and `supportURL`, all four must be public HTTPS pages
  whose actual content has been checked. Optional portable fields can still be
  required for public submission. Do not invent policy commitments or URLs.
- `extensions.com.openai.review.commerce`, and a description if applicable.
- `extensions.com.openai.publication.countries`: confirmed country codes, or `[]`
  only when the publisher explicitly chooses all available countries.

Run `node scripts/check-plugin.mjs --submission` after populating these values.
This catches absent metadata, not inaccessible pages or missing portal approval.
Skills-only plugins need no MCP test cases, demo recording, or reviewer credentials.
Use `review.prompts` for natural workflow prompts. The standard icon and brand
color are included; separate dark-mode assets are optional.

## Submit and publish

Follow the current [package guidance](https://developers.openai.com/plugins/build/plugins)
and [submission instructions](https://developers.openai.com/plugins/deploy/submission).
The supported flow checked on 2026-11-19 is:

1. Use the publisher's verified developer identity in the correct OpenAI organization
   and project. The submitting account needs owner access or Apps Management Write.
   Keep the manifest's developer name consistent with the selected verified
   identity and verify the saved name; automatic name enforcement depends on the
   portal's current rollout.
2. Open [the plugin submission portal](https://platform.openai.com/plugins), choose
   **Upload new or existing plugin**, and upload the exact ZIP. This is a skills-only
   package, with no MCP connection to register.
3. Record the returned draft/plugin ID and review automated metadata and skill
   findings. Fix required issues in the source, increment the version for a revised
   release, regenerate the package, and update the same draft. After an uncertain
   upload, inspect existing drafts before creating another.
4. Verify imported metadata, resolve required scans, and have the authorized
   developer complete the legal/policy attestations. Reupload replaces the full
   bundle and resets attestations; inspect the existing draft before replacing it.
   Submit for review. A successful upload or a submitted review is not publication.
   Once approved, publish through the portal and record the returned public URL.
5. Only advertise the directory install link after its published state is confirmed.
   GitHub releases and local marketplace installation are separate distribution
   channels and do not create a directory listing.

This package does not require a local-only MCP server or assume desktop-only
execution. It does require an environment with code/file tools; GitHub publication
and live browser verification require the user's available integrations and access.
Do not claim ordinary chat without those tools can execute the entire workflow.

Keep credentials, identity-verification material, private draft URLs, and portal
session data out of commits and release assets. If access or review blocks a step,
report the actual state and the precise remaining action rather than marking the
plugin published.

## Release maintenance

Update `plugin.json` and `.claude-plugin/marketplace.json` to the same semantic
version, regenerate the skills index, run CI, and attach the ZIP and its digest to
the corresponding GitHub release. Skill or metadata changes require another
plugin-package upload; pushing GitHub alone does not update the directory version.
