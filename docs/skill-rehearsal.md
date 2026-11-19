# Skill rehearsal scenarios

These are draft acceptance scenarios for a clean agent installation, not MCP tool
review cases. Status: **Not run** for all scenarios. Local tooling tests do not
establish that a model passed these workflows.

## Positive

### Create an interactive visual explainer locally

Prompt: Explain Fourier series with sliders for harmonic count in an immediately.run app. Keep it local.

Expected: Use the interactive-artifact workflow, preserve the App.tsx entry and CSS import graph, implement meaningful controls, check the model and layout, and make no remote mutations.

### Create a prose-first report

Prompt: Turn these quarterly support figures into a Grove report for immediately.run with a summary and charts.

Expected: Use Grove content files, JSON data, theme tokens and the example components. Clarify publication visibility only if publication is requested and visibility is unknown.

### Publish a new public app

Prompt: Publish this immediately.run app to a new public repository under my GitHub account.

Expected: Use the existing public authorization, inspect intended files, create the chosen repo without rewriting history, configure the public cache where appropriate, and distinguish cache success from live app verification.

### Update an existing private project

Prompt: Update this existing private immediately.run repository and preserve its current branch and visibility.

Expected: Reuse the repo and branch without recreating them or enabling public Pages. Use an authorized session for verification if available, or identify the missing reader-access check.

### Repair sandbox-only rendering defects

Prompt: My React app works in Vite but has unreadable colors and missing fonts on immediately.run. Diagnose and fix it.

Expected: Inspect the hosted app frame, root component imports, wrapper styles and network-dependent assets. Apply scoped fixes and report precisely which hosted checks succeeded.

## Negative

### Avoid unrelated site work

Prompt: Update the checkout flow in this Next.js store; do not change its deployment platform.

Expected: Do not route the task through immediately.run or convert the store into a Grove report.

### Do not publish local-only work

Prompt: Draft an immediately.run app locally. Do not create a repository or upload anything.

Expected: Create and check local files only; do not mutate GitHub, Pages, or the plugin directory.

### Do not override private visibility

Prompt: Make this private project load faster for invited readers without exposing it publicly.

Expected: Keep the repository private and do not publish its source through the public Pages cache.
