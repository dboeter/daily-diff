### Highlights

- Create, install and share [Desktop plugins](https://opencode.ai/v2/docs/build/plugins/gui) (experimental) ([#55246](https://github.com/anomalyco/opencode/pull/55246), [#59469](https://github.com/anomalyco/opencode/pull/59469), [#59489](https://github.com/anomalyco/opencode/pull/59489))
- Refreshed the desktop app experience ([#56898](https://github.com/anomalyco/opencode/pull/56898), [#58865](https://github.com/anomalyco/opencode/pull/58865), [#55838](https://github.com/anomalyco/opencode/pull/55838), [#57962](https://github.com/anomalyco/opencode/pull/57962))
- Add experimental image and decision generation APIs to plugins and sdk, allowing image generation or decision model (think typesafe, clef, etc) workflows. ([#59190](https://github.com/anomalyco/opencode/pull/59190), [#59380](https://github.com/anomalyco/opencode/pull/59380), [#58758](https://github.com/anomalyco/opencode/pull/58758))
- Plugins can now attach and update keyed session instructions with ctx.session.instructions.entry.put/list/remove. Instead of editing the system prompt and busting the prompt cache, each change is added as a small update at the next step. The entries also survive compaction and reverts, and they don't start an extra model turn. ([#56550](https://github.com/anomalyco/opencode/pull/56550))
- Restored the Todo tool in desktop via opt-in ([#59092](https://github.com/anomalyco/opencode/pull/59092))
- Add configurable prompt cache TTLs per provider/model ([#59157](https://github.com/anomalyco/opencode/pull/59157))

### Breaking changes

#### `@opencode/ai` root is now the Promise API

`@opencode/ai` now works like `@opencode/sdk` and `@opencode/client`: the package root exports the Promise API, and the Effect API moved to `@opencode/ai/effect`. `@opencode/ai/promise` is removed, and the wildcard subpath export is replaced with an explicit list of provider and protocol entry points. ([#58847](https://github.com/anomalyco/opencode/pull/58847), [#59183](https://github.com/anomalyco/opencode/pull/59183))

```diff
-import { AI } from "@opencode/ai/promise"
-import { LLM } from "@opencode/ai"
+import { AI } from "@opencode/ai"
+import { LLM } from "@opencode/ai/effect"
```

#### The OpenCode GitHub Action is removed

The OpenCode GitHub Action is no longer published. Remove it from your workflows. ([#59032](https://github.com/anomalyco/opencode/pull/59032))

#### TUI plugins require OpenTUI 0.7

`@opencode/plugin` now requires `@opentui/core` and `@opentui/solid` 0.7.0, up from 0.6.8 or later. Plugins that depend on OpenTUI 0.6 fail to install until they upgrade. In OpenTUI 0.7, custom renderables read their hooks from their class at construction: assign `renderBefore`, `renderAfter`, and `onLifecyclePass` in the constructor instead of as class fields, call `refreshHooks()` after adding a hook by reflection, and replace `defineNativeIntegration()` with a `static nativeIntegration` declaration. See the [OpenTUI 0.7.0 release notes](https://opentui.com/docs/releases/0.7.0). ([#59295](https://github.com/anomalyco/opencode/pull/59295))

### Core

#### Improvements

- Add experimental image and decision generation API endpoints. ([#59190](https://github.com/anomalyco/opencode/pull/59190))
- Add image and decision entrypoints for catalog providers. ([#59380](https://github.com/anomalyco/opencode/pull/59380))
- Improve integration rebuild performance. ([#59402](https://github.com/anomalyco/opencode/pull/59402))
- Let custom model configuration set a model type. ([#59388](https://github.com/anomalyco/opencode/pull/59388))
- Reduce memory use when code search finds very large lines. ([#59205](https://github.com/anomalyco/opencode/pull/59205))
- Add experimental content-addressed blob storage for session media behind `experimental.media_blob`. ([#58656](https://github.com/anomalyco/opencode/pull/58656), [#58741](https://github.com/anomalyco/opencode/pull/58741))

### SDK

#### Bug fixes

- Fix generated Promise client input types for TypeScript consumers. ([#58875](https://github.com/anomalyco/opencode/pull/58875))
- Restore running sessions created while an SDK client was disconnected. ([#53012](https://github.com/anomalyco/opencode/pull/53012))
