# Astro v7 Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade astro-scholar from Astro 6.4.5 to Astro 7.x while preserving math rendering, whitespace behavior, and full build integrity.

**Architecture:** The theme uses `remark-math` + `rehype-katex` via `unified()` from `@astrojs/markdown-remark` for LaTeX. Astro v7 switches the default Markdown processor to Sätteri, but the theme's explicit `processor: unified(...)` config is the recommended migration path — we just need to add the now-optional `@astrojs/markdown-remark` as a direct dependency. The `compressHTML` default changes from `true` to `'jsx'`, which strips whitespace between inline elements; we'll set `compressHTML: true` to preserve current behavior.

**Tech Stack:** Astro 7.x, @astrojs/mdx 7.x, @astrojs/markdown-remark (new direct dep), remark-math, rehype-katex

## Global Constraints

- Math rendering (inline `$...$` and block `$$...$$`) must continue working exactly as before
- Whitespace behavior must not change — set `compressHTML: true`
- Build must complete without errors (`npm run build` including postbuild pagefind step)
- No changes to blog content, data files, or component logic

---

### Task 1: Upgrade dependencies

**Files:**
- Modify: `package.json`
- Regenerate: `package-lock.json`

- [ ] **Step 1: Upgrade Astro and official integrations**

Run the official Astro upgrade tool:

```bash
npx @astrojs/upgrade
```

This will update `astro`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, and their transitive dependencies to v7-compatible versions.

- [ ] **Step 2: Add `@astrojs/markdown-remark` as explicit dependency**

In Astro v7, `@astrojs/markdown-remark` is no longer bundled by default. Since this theme imports `unified` from it in `astro.config.mjs`, it must be an explicit dependency:

```bash
npm install @astrojs/markdown-remark
```

- [ ] **Step 3: Verify package.json has correct versions**

Read `package.json` and confirm:
- `astro` is `^7.x.x`
- `@astrojs/mdx` is `^7.x.x` (or compatible)
- `@astrojs/markdown-remark` is present in `dependencies`
- `@astrojs/rss` and `@astrojs/sitemap` are updated

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade astro and integrations to v7"
```

---

### Task 2: Update astro.config.mjs

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Add `compressHTML: true` to preserve whitespace behavior**

Astro v7 changes the default `compressHTML` from `true` to `'jsx'`, which strips whitespace between inline elements. Add the explicit setting to preserve current behavior:

```js
export default defineConfig({
	site: 'https://shravangoswami.com',
	base: process.env.BASE_PATH || '/astro-scholar',
	compressHTML: true,  // preserve v6 whitespace behavior
	integrations: [
		mdx(),
		sitemap()
	],
	// ... rest unchanged
});
```

- [ ] **Step 2: Verify no other config changes needed**

The `markdown.processor: unified(...)` block, `shikiConfig`, and `build.inlineStylesheets` settings are all still valid in v7. No changes needed there.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "fix: set compressHTML: true to preserve v6 whitespace behavior"
```

---

### Task 3: Build and verify

**Files:**
- None (verification only)

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: Build completes without errors. Pagefind indexes successfully.

- [ ] **Step 2: Check for Rust compiler errors**

If the build fails with errors about unclosed tags or invalid HTML nesting, fix the offending templates. Common issues:
- Unclosed `<p>`, `<div>`, `<span>`, `<a>` tags in `.astro` components
- Invalid nesting like `<div>` inside `<p>` in blog content

- [ ] **Step 3: Preview the site and verify math rendering**

```bash
npm run preview
```

Open the LaTeX support post (`/astro-scholar/blog/latex-support/`) and verify:
- Inline math renders: `$E = mc^2$` should show as formatted equation
- Block math renders: `$$...$$` matrices and integrals should display correctly
- KaTeX CSS is loading (no unstyled math elements)

- [ ] **Step 4: Verify whitespace in blog posts**

Check a blog post for proper spacing between inline elements (links, emphasis, inline code). If spaces are missing, either fix templates or confirm `compressHTML: true` is in effect.

- [ ] **Step 5: Commit if any template fixes were needed**

```bash
git add -A
git commit -m "fix: resolve Rust compiler HTML strictness issues"
```

---

### Task 4: Update documentation

**Files:**
- Modify: `AGENTS.md`

- [ ] **Step 1: Update AGENTS.md with v7 information**

Update the Astro version reference and note the `@astrojs/markdown-remark` dependency requirement. Add a note about the `compressHTML: true` setting.

- [ ] **Step 2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: update AGENTS.md for Astro v7"
```
