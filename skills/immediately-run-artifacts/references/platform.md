# Tested platform conventions

This reference records the route used for a self-contained React artifact, verified on 2026-11-18. It is a tested recipe, not an exhaustive or permanent platform specification. Inspect an existing working app and consult current official platform documentation for new capabilities or changed behavior.

Public example: [neumark/maxwell-equations](https://github.com/neumark/maxwell-equations), verified revision [`2d73e1e`](https://github.com/neumark/maxwell-equations/commit/2d73e1e).

Live example: [Maxwell — A field guide](https://immediately.run/present/github/neumark/maxwell-equations/main).

## Source and manifest

Start from a normal React/TypeScript/Vite project or an existing compatible app. Add this field to `package.json`, preserving the rest:

```json
{
  "immediately.run": {
    "$schema": "https://immediately.run/immediately-run-config.schema.json"
  }
}
```

The `$schema` URL is the configuration declaration used by the verified apps. This example does not demonstrate additional manifest fields. Do not invent entries for host permissions or copy a wiki's `immediately.run.json` into a React app: a wiki/open-task manifest represents a different artifact type.

The application entry must be usable as a component on its own:

```tsx
// src/App.tsx — the host renders this default export.
import './app.css';

export default function App() {
  return (
    <main className="artifact-root">
      <h1>Your subject</h1>
      {/* Explanation, visualizations, and ordinary React controls. */}
    </main>
  );
}
```

```tsx
// src/main.tsx — local Vite bootstrap; the host does not need this file.
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
```

Import CSS and initialize app behavior through `App.tsx` or its dependencies. Do not rely on a script in `index.html`, an initializer used only by `main.tsx`, or a locally running Vite server to supply production behavior. Vite-specific environment substitution and server routes also need separate host verification.

This route needs React and React DOM at runtime. Vite, TypeScript, their compatible React tooling, and any test tools are development dependencies. No SDK was needed for the example's in-memory sliders, tabs, quiz, and animation.

If TypeScript reports an undeclared CSS side-effect import in a Vite project, include the standard Vite client declaration, typically `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
```

## Styling and assets

In the first live check, the host's dark background and a colliding custom property made locally legible text unreadable. Defining colors only on `:root` was insufficient. The correction set the wrapper's palette, font, and background explicitly.

A minimal pattern, with a palette chosen for the actual artifact:

```css
.artifact-root {
  --artifact-paper: #f6f5ef;
  --artifact-ink: #253c36;
  --artifact-line: #d9ddd2;
  color-scheme: light;
  background: var(--artifact-paper);
  color: var(--artifact-ink);
  font-family: system-ui, sans-serif;
  min-height: 100vh;
}

.artifact-root .diagram-panel {
  border: 1px solid var(--artifact-line);
}
```

This demonstrates an explicitly light artifact; use a complete dark or adaptive palette if the user requests one. The lesson is ownership of the app's styling, not a required light theme.

The example initially imported Google Fonts over the network. The public host ran with network access disabled, so the final artifact embedded three Latin WOFF2 subsets in a CSS file imported by `App.tsx`:

```css
@font-face {
  font-family: 'Example Font';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url(data:font/woff2;base64,ACTUAL_ENCODED_FONT_BYTES) format('woff2');
}
```

The bytes above are schematic. Use actual licensed font data, the matching weight/style and subset declarations, and include its license. System fonts are simpler and often sufficient. Large binary assets need a platform-supported loading approach verified on the host, rather than indiscriminate base64 embedding.

## GitHub publication

Follow [publishing.md](publishing.md) for repository reuse, real branch names,
public-only Pages caching, and live verification. It is included alongside this
reference so the skill remains usable when installed by itself. `package.json`
may contain `"private": true` even for a public GitHub repository; the flag prevents
npm publication.

## What to verify

The example passed a production build, five numerical/sign tests, and three browser tests before final live verification. Those counts and tools are not requirements for other artifacts.

Useful behavior checks for a similar teaching app include:

- Changing a parameter updates the diagram and its explanatory values consistently.
- Known zero, negative, and limiting cases behave correctly.
- An animation can pause, remains paused, and initially respects reduced motion.
- Tab selection and controls work by keyboard; narrow layouts do not hide required content.
- A synthetic host background/token change does not make the app unreadable.

The live verification must look inside the sandbox frame. The public shell may show a source hash and a ready indicator while the embedded app is broken. Locate the frame by its actual content or observed URL; do not hardcode a changing sandbox hostname. Avoid inspecting unrelated authentication or reCAPTCHA frames.

In the verified final revision, the live app loaded without page errors, changing a law tab worked, the wrapper's computed background matched its palette, embedded fonts loaded, and a screenshot confirmed the result. When the environment cannot perform these checks, distinguish “built locally” from “verified on immediately.run.”
