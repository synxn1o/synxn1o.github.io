# Blog Category & Tag Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add category and tag filtering to the blog page with pill-button UI, URL-based state, and client-side pagination.

**Architecture:** Replace server-side paginated blog with single-page client-side filtering. Add optional `category` field to content schema. JavaScript handles filter state, URL sync, and "Load more" pagination.

**Tech Stack:** Astro, TypeScript, Content Collections API, Client-side JavaScript

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `src/content.config.ts` | Modify | Add optional `category` field to blog schema |
| `src/pages/blog/[...page].astro` | Delete | Remove server-side paginated blog |
| `src/pages/blog/index.astro` | Create | New single-page blog with filters |
| `src/content/blog/*.md` | Modify | Add category field to existing posts (optional) |

---

## Task 1: Add Category Field to Blog Schema

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Read current schema**

```bash
cat src/content.config.ts
```

Expected output shows blog schema without `category` field.

- [ ] **Step 2: Add optional category field**

Edit `src/content.config.ts` to add `category` after `tags`:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

type SchemaContext = { image: () => any };

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }: SchemaContext) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			authors: z.array(z.string()).optional(), // References 'id' in authors.json
			toc: z.boolean().optional(),
			tags: z.array(z.string()).optional(),
			category: z.string().optional(), // <-- ADD THIS LINE
		}),
});

export const collections = { blog };
```

- [ ] **Step 3: Verify schema change**

```bash
npm run build 2>&1 | head -20
```

Expected: Build succeeds without errors (category is optional, so existing posts still work).

- [ ] **Step 4: Commit schema change**

```bash
git add src/content.config.ts
git commit -m "feat: add optional category field to blog schema"
```

---

## Task 2: Create New Blog Page with Filter UI

**Files:**
- Create: `src/pages/blog/index.astro`
- Delete: `src/pages/blog/[...page].astro`

- [ ] **Step 1: Create new blog page**

Create `src/pages/blog/index.astro`:

```astro
---
import { Image } from 'astro:assets';
import { getCollection } from 'astro:content';
import BaseHead from '../../components/BaseHead.astro';
import Footer from '../../components/Footer.astro';
import FormattedDate from '../../components/FormattedDate.astro';
import Header from '../../components/Header.astro';
import AuthorLink from '../../components/AuthorLink.astro';
import { SITE_DESCRIPTION, SITE_TITLE } from '../../consts';
import { url } from '../../utils/paths';

const posts = (await getCollection('blog')).sort(
	(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
);

// Derive unique categories
const categoriesMap = new Map<string, string>();
posts.forEach((post) => {
	if (post.data.category) {
		const slug = post.data.category.toLowerCase().replace(/\s+/g, '-');
		categoriesMap.set(slug, post.data.category);
	}
});
const categories = Array.from(categoriesMap.entries()).map(([slug, name]) => ({ slug, name }));

// Derive unique tags
const tagsMap = new Map<string, string>();
posts.forEach((post) => {
	(post.data.tags || []).forEach((tag) => {
		const slug = tag.toLowerCase().replace(/\s+/g, '-');
		tagsMap.set(slug, tag);
	});
});
const tags = Array.from(tagsMap.entries()).map(([slug, name]) => ({ slug, name }));
---

<!doctype html>
<html lang="en">
	<head>
		<BaseHead title={SITE_TITLE} description={SITE_DESCRIPTION} />
		<style>
			.blog-list {
				display: flex;
				flex-direction: column;
				gap: 3rem;
				margin-top: 3rem;
			}
			.blog-post-card {
				display: flex;
				gap: 2.5rem;
				align-items: flex-start;
				padding-bottom: 3rem;
				border-bottom: 1px solid var(--color-border);
			}
			.blog-post-card:last-child {
				border-bottom: none;
			}

			.blog-thumb {
				width: 280px;
				flex-shrink: 0;
				border-radius: 8px;
				overflow: hidden;
				box-shadow: var(--shadow-md);
				aspect-ratio: 16/9;
				display: block;
				order: 2;
				align-self: flex-start;
			}
			.blog-thumb img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				transition: transform 0.4s ease, filter 0.3s ease;
			}
			.blog-post-card:hover .blog-thumb img {
				transform: scale(1.03);
				filter: brightness(1.05);
			}

			.blog-content {
				flex: 1;
				order: 1;
				padding-right: 1rem;
			}
			.blog-title {
				margin: -0.2rem 0 0.75rem 0;
				font-family: var(--font-serif);
				font-size: 1.75rem;
				line-height: 1.25;
				letter-spacing: -0.01em;
			}
			.blog-title a {
				color: var(--color-text-main);
				text-decoration: none;
				transition: color 0.2s;
			}
			.blog-title a:hover {
				color: var(--color-accent);
			}
			.blog-meta {
				font-size: 0.85rem;
				color: var(--color-text-muted);
				margin-bottom: 1rem;
				display: flex;
				flex-wrap: wrap;
				gap: 0.5rem;
				align-items: center;
				text-transform: uppercase;
				letter-spacing: 0.05em;
				font-weight: 500;
			}
			.meta-divider {
				color: #ddd;
			}
			.blog-desc {
				margin: 0 0 1.5rem 0;
				color: var(--color-text-muted);
				line-height: 1.7;
				font-size: 1.05rem;
			}
			.read-more {
				font-size: 0.9rem;
				font-weight: 700;
				color: var(--color-accent);
				display: inline-flex;
				align-items: center;
				text-decoration: none;
				border-bottom: 2px solid transparent;
				transition: border-color 0.2s;
			}
			.read-more:hover {
				border-bottom-color: var(--color-accent);
			}

			/* Filter styles */
			.filter-section {
				margin-bottom: 1.25rem;
			}
			.filter-label {
				font-size: 0.7rem;
				text-transform: uppercase;
				letter-spacing: 0.1em;
				color: var(--color-text-muted);
				margin-bottom: 0.6rem;
				font-weight: 600;
			}
			.filter-pills {
				display: flex;
				flex-wrap: wrap;
				gap: 0.5rem;
			}
			.filter-pill {
				padding: 0.3rem 0.85rem;
				border: 1px solid var(--color-border);
				border-radius: 999px;
				font-size: 0.78rem;
				color: var(--color-text-muted);
				cursor: pointer;
				transition: all 0.2s ease;
				text-decoration: none;
				background: transparent;
			}
			.filter-pill:hover {
				color: var(--color-text-main);
				border-color: var(--color-text-main);
			}
			.filter-pill.active {
				background: var(--color-text-main);
				border-color: var(--color-text-main);
				color: var(--color-bg);
			}
			.filter-pill.tag-pill {
				padding: 0.25rem 0.7rem;
				font-size: 0.73rem;
			}
			.filter-pill.tag-pill.active {
				background: transparent;
				border-color: var(--color-accent);
				color: var(--color-accent);
			}

			/* Empty state */
			.blog-empty {
				text-align: center;
				color: var(--color-text-muted);
				padding: 3rem 0;
			}

			/* Load more */
			.load-more-wrap {
				display: flex;
				justify-content: center;
				margin-top: 2.5rem;
			}
			.load-more-btn {
				padding: 0.5rem 1.2rem;
				border: 1px solid var(--color-border);
				border-radius: 8px;
				background: transparent;
				cursor: pointer;
				font-weight: 500;
				color: var(--color-text-main);
				font-size: 0.9rem;
				transition: all 0.2s ease;
			}
			.load-more-btn:hover {
				background: var(--color-text-main);
				color: var(--color-bg);
			}

			@media (max-width: 720px) {
				.blog-post-card {
					flex-direction: column-reverse;
					gap: 1.5rem;
					padding-bottom: 2rem;
				}
				.blog-thumb {
					width: 100%;
					height: auto;
					aspect-ratio: 16/9;
					box-shadow: var(--shadow-sm);
				}
				.blog-content {
					padding-right: 0;
				}
				.blog-title {
					font-size: 1.5rem;
				}
			}
		</style>
	</head>
	<body>
		<Header />
		<main data-blog>
			<h1>Lab News & Updates</h1>
			<p style="margin-bottom: 2rem; max-width: 700px; color: var(--color-text-muted);">
				Explore our latest research highlights, tutorials, and announcements.
			</p>

			{/* Category Filter */}
			{categories.length > 0 && (
				<div class="filter-section">
					<div class="filter-label">CATEGORIES</div>
					<div class="filter-pills" data-category-filters>
						<button class="filter-pill active" data-category-filter="">All</button>
						{categories.map((cat) => (
							<button class="filter-pill" data-category-filter={cat.slug}>{cat.name}</button>
						))}
					</div>
				</div>
			)}

			{/* Tag Filter */}
			{tags.length > 0 && (
				<div class="filter-section">
					<div class="filter-label">TAGS</div>
					<div class="filter-pills" data-tag-filters>
						{tags.map((tag) => (
							<button class="filter-pill tag-pill" data-tag-filter={tag.slug}>#{tag.name}</button>
						))}
					</div>
				</div>
			)}

			{/* Blog Post List */}
			<div class="blog-list" data-blog-list>
				{posts.map((post) => {
					const categorySlug = post.data.category
						? post.data.category.toLowerCase().replace(/\s+/g, '-')
						: '';
					const tagSlugs = (post.data.tags || [])
						.map((t) => t.toLowerCase().replace(/\s+/g, '-'))
						.join(' ');

					return (
						<article
							class="blog-post-card"
							data-post
							data-category={categorySlug}
							data-tags={tagSlugs}
						>
							<div class="blog-content">
								<h2 class="blog-title">
									<a href={url(`/blog/${post.id}/`)}>{post.data.title}</a>
								</h2>

								<div class="blog-meta">
									<FormattedDate date={post.data.pubDate} />

									{post.data.authors && post.data.authors.length > 0 && (
										<>
											<span class="meta-divider">&bull;</span>
											{post.data.authors.map((authorId, i) => (
												<span>
													<AuthorLink nameOrSlug={authorId} />
													{i < post.data.authors!.length - 1 ? ', ' : ''}
												</span>
											))}
										</>
									)}
									{post.data.tags && post.data.tags.length > 0 && (
										<>
											<span class="meta-divider">&bull;</span>
											<span class="blog-tags" style="display: inline-flex; gap: 0.25rem;">
												{post.data.tags.map((tag) => (
													<a href={url(`/tags/${tag}`)} style="text-decoration: none; color: var(--color-accent); font-weight: 600;">#{tag}</a>
												))}
											</span>
										</>
									)}
								</div>

								<p class="blog-desc">
									{post.data.description}
								</p>

								<a href={url(`/blog/${post.id}/`)} class="read-more">Read Article &rarr;</a>
							</div>

							<a href={url(`/blog/${post.id}/`)} class="blog-thumb">
								{post.data.heroImage ? (
									<Image width={560} height={315} src={post.data.heroImage} alt={post.data.title} />
								) : (
									<img src={url(`/blog/${post.id}.png`)} alt={post.data.title} />
								)}
							</a>
						</article>
					);
				})}
			</div>

			{/* Empty State */}
			<div class="blog-empty" data-blog-empty hidden>
				<p>No posts match the selected filters.</p>
			</div>

			{/* Load More */}
			<div class="load-more-wrap" data-load-more-wrap hidden>
				<button class="load-more-btn" data-load-more>Load more</button>
			</div>
		</main>
		<Footer />

		<script>
			const blogContainer = document.querySelector('[data-blog]');
			if (blogContainer) {
				const PAGE_SIZE = 10;

				const posts = [...blogContainer.querySelectorAll('[data-post]')];
				const categoryButtons = [...blogContainer.querySelectorAll('[data-category-filter]')];
				const tagButtons = [...blogContainer.querySelectorAll('[data-tag-filter]')];
				const emptyState = blogContainer.querySelector('[data-blog-empty]');
				const loadMoreWrap = blogContainer.querySelector('[data-load-more-wrap]');
				const loadMoreBtn = blogContainer.querySelector('[data-load-more]');

				let currentPage = 1;

				// Read state from URL
				const stateFromUrl = () => {
					const params = new URLSearchParams(window.location.search);
					return {
						cat: params.get('cat') || '',
						tag: params.get('tag') || '',
					};
				};

				// Write state to URL
				const writeUrl = (state: { cat: string; tag: string }) => {
					const params = new URLSearchParams();
					if (state.cat) params.set('cat', state.cat);
					if (state.tag) params.set('tag', state.tag);
					const query = params.toString();
					history.pushState(state, '', query ? `/blog/?${query}` : '/blog/');
				};

				// Filter posts
				const getFilteredPosts = (cat: string, tag: string) => {
					return posts.filter((post) => {
						const postCat = post.getAttribute('data-category') || '';
						const postTags = (post.getAttribute('data-tags') || '').split(' ');

						if (cat && postCat !== cat) return false;
						if (tag && !postTags.includes(tag)) return false;
						return true;
					});
				};

				// Render filtered posts
				const render = (state: { cat: string; tag: string }, resetPage = true) => {
					if (resetPage) currentPage = 1;

					const filtered = getFilteredPosts(state.cat, state.tag);
					const visibleCount = Math.min(filtered.length, currentPage * PAGE_SIZE);

					// Hide all posts
					posts.forEach((post) => (post as HTMLElement).hidden = true);

					// Show filtered posts
					filtered.slice(0, visibleCount).forEach((post) => (post as HTMLElement).hidden = false);

					// Update category button states
					categoryButtons.forEach((btn) => {
						const filterValue = btn.getAttribute('data-category-filter') || '';
						const isActive = filterValue === state.cat;
						btn.classList.toggle('active', isActive);
					});

					// Update tag button states
					tagButtons.forEach((btn) => {
						const filterValue = btn.getAttribute('data-tag-filter') || '';
						const isActive = filterValue === state.tag;
						btn.classList.toggle('active', isActive);
					});

					// Show/hide empty state
					if (emptyState) {
						(emptyState as HTMLElement).hidden = filtered.length > 0;
					}

					// Show/hide load more button
					if (loadMoreWrap) {
						(loadMoreWrap as HTMLElement).hidden = visibleCount >= filtered.length;
					}
					if (loadMoreBtn) {
						loadMoreBtn.textContent = `Load more (${filtered.length - visibleCount} remaining)`;
					}
				};

				// Category filter click
				categoryButtons.forEach((btn) => {
					btn.addEventListener('click', () => {
						const state = stateFromUrl();
						const newCat = btn.getAttribute('data-category-filter') || '';
						const newState = { ...state, cat: newCat };
						writeUrl(newState);
						render(newState);
					});
				});

				// Tag filter click
				tagButtons.forEach((btn) => {
					btn.addEventListener('click', () => {
						const state = stateFromUrl();
						const tagValue = btn.getAttribute('data-tag-filter') || '';
						const newTag = state.tag === tagValue ? '' : tagValue;
						const newState = { ...state, tag: newTag };
						writeUrl(newState);
						render(newState);
					});
				});

				// Load more click
				if (loadMoreBtn) {
					loadMoreBtn.addEventListener('click', () => {
						currentPage++;
						const state = stateFromUrl();
						render(state, false);
					});
				}

				// Browser back/forward
				window.addEventListener('popstate', () => {
					render(stateFromUrl());
				});

				// Initial render
				render(stateFromUrl());
			}
		</script>
	</body>
</html>
```

- [ ] **Step 2: Delete old paginated blog page**

```bash
rm src/pages/blog/\[\.\.\.\page\].astro
```

- [ ] **Step 3: Verify build succeeds**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build completes successfully.

- [ ] **Step 4: Commit new blog page**

```bash
git add -A
git commit -m "feat: replace server-side blog with client-side filtered page"
```

---

## Task 3: Add Categories to Existing Blog Posts

**Files:**
- Modify: `src/content/blog/*.md`

- [ ] **Step 1: Review existing posts**

```bash
head -15 src/content/blog/advanced-markdown-features.md
head -15 src/content/blog/dynamic-og-image-generation.md
```

Note which tags each post has to assign appropriate categories.

- [ ] **Step 2: Add categories to posts**

For each post, add a `category` field after `tags`. Suggested categories:

**advanced-markdown-features.md:**
```yaml
category: Tutorial
tags:
  - markdown
  - writing
```

**dynamic-og-image-generation.md:**
```yaml
category: Tutorial
tags:
  - astro
  - SEO
```

**how-to-configure-astroscholar-theme.md:**
```yaml
category: Tutorial
tags:
  - astro
  - tutorial
```

**latex-support.md:**
```yaml
category: Tutorial
tags:
  - latex
  - writing
```

**markdown-showcase.md:**
```yaml
category: Tutorial
tags:
  - markdown
```

For any remaining posts, assign categories based on their content:
- Tutorial posts → `category: Tutorial`
- Research posts → `category: Research`
- News/announcements → `category: News`

- [ ] **Step 3: Verify build with categories**

```bash
npm run build 2>&1 | tail -10
```

Expected: Build succeeds with all posts having categories.

- [ ] **Step 4: Commit category additions**

```bash
git add src/content/blog/*.md
git commit -m "content: add category field to existing blog posts"
```

---

## Task 4: Test the Implementation

**Files:**
- None (manual testing)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: Dev server starts at http://localhost:4321

- [ ] **Step 2: Test category filter**

1. Open http://localhost:4321/blog
2. Click "Tutorial" category pill
3. Verify URL updates to `/blog?cat=tutorial`
4. Verify only Tutorial posts are shown
5. Click "All" to clear filter

- [ ] **Step 3: Test tag filter**

1. Click "#astro" tag pill
2. Verify URL updates to `/blog?tag=astro`
3. Verify only posts tagged "astro" are shown
4. Click "#astro" again to deselect

- [ ] **Step 4: Test combined filters**

1. Select "Tutorial" category
2. Select "#astro" tag
3. Verify URL is `/blog?cat=tutorial&tag=astro`
4. Verify only Tutorial posts with astro tag shown

- [ ] **Step 5: Test URL persistence**

1. Navigate to `/blog?cat=research&tag=seo`
2. Verify filters are applied on page load

- [ ] **Step 6: Test browser history**

1. Apply filters
2. Click browser back button
3. Verify filters return to previous state

- [ ] **Step 7: Test load more**

1. If more than 10 posts exist, verify "Load more" button appears
2. Click "Load more"
3. Verify additional posts appear

- [ ] **Step 8: Commit final state**

```bash
git add -A
git commit -m "feat: complete blog filter implementation"
```

---

## Task 5: Visual Polish (Optional)

**Files:**
- Modify: `src/pages/blog/index.astro`

- [ ] **Step 1: Add hover transitions**

The CSS already includes transitions, but verify they work smoothly:
- Filter pill hover: border-color and color change
- Blog post card hover: image scale and brightness

- [ ] **Step 2: Test responsive design**

1. Open browser DevTools
2. Toggle mobile viewport (320px, 768px, 1024px)
3. Verify filter pills wrap correctly
4. Verify blog cards stack vertically on mobile

- [ ] **Step 3: Commit polish**

```bash
git add src/pages/blog/index.astro
git commit -m "style: polish blog filter UI and responsive design"
```

---

## Commit Sequence

1. `feat: add optional category field to blog schema`
2. `feat: replace server-side blog with client-side filtered page`
3. `content: add category field to existing blog posts`
4. `feat: complete blog filter implementation`
5. `style: polish blog filter UI and responsive design`

---

## Success Criteria Checklist

- [ ] Category pills render below description
- [ ] Tag pills render below categories
- [ ] "All" category pill clears category filter
- [ ] Clicking tag toggles it on/off
- [ ] Selected pills show theme color (dark for categories, accent for tags)
- [ ] URL updates when filters change
- [ ] Filters persist on page refresh
- [ ] Browser back/forward works
- [ ] Posts filter correctly by category and/or tag
- [ ] "Load more" pagination works with filters
