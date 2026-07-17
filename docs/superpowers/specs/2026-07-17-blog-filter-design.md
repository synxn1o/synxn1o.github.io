# Blog Category & Tag Filter Design

**Date:** 2026-07-17
**Status:** Approved
**Author:** Claude (via brainstorming session)

## Overview

Add category and tag filtering to the blog page at `/blog`. Users can filter posts by category and/or tag using pill-button UI. Filters are URL-based for shareability and browser history support.

## Design Decisions

### 1. UI Style: Pill Buttons
- Thin uppercase labels (`CATEGORIES`, `TAGS`)
- Rounded pill buttons for filter options
- Selected state uses theme color
- Matches reference implementation at `/mnt/e/blog`

### 2. Schema: Optional Category Field
- Add `category: z.string().optional()` to blog content schema
- Posts without a category won't appear in any category filter
- Tags already exist in schema

### 3. Filtering: URL-Based
- Filters reflected in URL: `/blog?cat=research&tag=astro`
- Browser back/forward support
- Shareable filtered links
- State preserved on page refresh

### 4. Category "All" Behavior
- "All" pill always present for categories
- Clicking "All" clears category filter (shows all posts)
- Tags have no "All" option - toggle individual tags to select/deselect

### 5. Pagination: Client-Side
- Replace server-side pagination with single `/blog` page
- All posts rendered, filtered/show via JavaScript
- Initial page size: 10 posts
- "Load more" button loads 10 more posts
- Button shows remaining count: "Load more (X remaining)"
- Pagination resets when filters change

## Page Structure

```
/blog
├── Header
├── Main Content
│   ├── Title: "Lab News & Updates"
│   ├── Description paragraph
│   ├── CATEGORIES filter section
│   │   ├── "All" pill (default selected)
│   │   └── Category pills (derived from posts)
│   ├── TAGS filter section
│   │   └── Tag pills (derived from posts, with # prefix)
│   ├── Blog post list
│   │   └── Post cards (filtered by current filters)
│   └── Load more button
└── Footer
```

## Filter UI Specifications

### Categories
- Label: `CATEGORIES` (uppercase, 0.7rem, letter-spacing: 0.1em, color: #999)
- Container: flex wrap with 0.5rem gap
- Pills:
  - Padding: 0.3rem 0.85rem
  - Border: 1px solid #ddd (unselected) or 1px solid #333 (selected)
  - Border-radius: 999px (full rounded)
  - Font-size: 0.78rem
  - Unselected: color #666, transparent background
  - Selected: background #333, color white

### Tags
- Label: `TAGS` (uppercase, 0.7rem, letter-spacing: 0.1em, color: #999)
- Container: flex wrap with 0.5rem gap
- Pills:
  - Padding: 0.25rem 0.7rem
  - Border: 1px solid #ddd (unselected) or accent color (selected)
  - Border-radius: 999px
  - Font-size: 0.73rem
  - Prefix: `#` before tag name
  - Unselected: color #666
  - Selected: accent color text + border, font-weight: 500

## URL State Management

### URL Parameters
- `cat`: Category slug (lowercase, hyphenated)
- `tag`: Tag slug (lowercase, hyphenated)
- Example: `/blog?cat=research&tag=astro`

### State Sync
1. On filter click → update URL via `history.pushState()`
2. On page load → read URL params and apply filters
3. On browser back/forward → `popstate` event → update filters

### Filter Logic
```
if (category !== "All") {
  posts = posts.filter(post => post.category === category)
}
if (selectedTag) {
  posts = posts.filter(post => post.tags.includes(selectedTag))
}
```

## Data Flow

1. **Build time**: All posts fetched from content collection
2. **Render**: All posts rendered as HTML cards with data attributes
3. **Client-side**: JavaScript reads URL params, shows/hides cards based on filters

### Data Attributes on Post Cards
- `data-category="{category-slug}"` - post's category (if exists)
- `data-tags="{tag1} {tag2}"` - space-separated tag slugs

## Files to Modify

1. **`src/content.config.ts`**
   - Add `category: z.string().optional()` to blog schema

2. **`src/pages/blog/[...page].astro`** → **`src/pages/blog/index.astro`**
   - Remove server-side pagination
   - Render all posts
   - Add filter UI markup
   - Add client-side JavaScript for filtering

3. **Blog posts** (optional)
   - Add `category` field to existing posts

## Implementation Notes

### Helper Functions (in page or separate utility)
```javascript
// Derive all unique categories from posts
function allCategories(posts) {
  const cats = posts
    .filter(p => p.data.category)
    .map(p => ({ slug: slugify(p.data.category), name: p.data.category }));
  return [...new Map(cats.map(c => [c.slug, c])).values()];
}

// Derive all unique tags from posts
function allTags(posts) {
  const tags = posts.flatMap(p => p.data.tags || [])
    .map(t => ({ slug: slugify(t), name: t }));
  return [...new Map(tags.map(t => [t.slug, t])).values()];
}
```

### Filter State Management
```javascript
const stateFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    cat: params.get("cat") || "",
    tag: params.get("tag") || "",
  };
};

const writeUrl = (state) => {
  const params = new URLSearchParams();
  if (state.cat) params.set("cat", state.cat);
  if (state.tag) params.set("tag", state.tag);
  const query = params.toString();
  history.pushState(state, "", query ? `/blog/?${query}` : "/blog/");
};
```

## Success Criteria

1. ✅ Category pills render below description
2. ✅ Tag pills render below categories
3. ✅ "All" category pill clears category filter
4. ✅ Clicking tag toggles it on/off
5. ✅ Selected pills show theme color
6. ✅ URL updates when filters change
7. ✅ Filters persist on page refresh
8. ✅ Browser back/forward works
9. ✅ Posts filter correctly by category and/or tag
10. ✅ "Load more" pagination works with filters

## Out of Scope

- Server-side filtering (SEO benefit but more complex)
- Multiple tag selection (reference uses single tag toggle)
- Filter animations/transitions
- Mobile-specific filter UI (responsive by default)
