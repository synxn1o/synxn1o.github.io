// @ts-check

import fs from 'node:fs';
import path from 'node:path';
import { unified } from '@astrojs/markdown-remark';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { ChangeFreqEnum } from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

function getBlogDates() {
	const blogDir = './src/content/blog';
	const dates = {};
	try {
		const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
		for (const file of files) {
			const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');
			const match = content.match(/^---\n([\s\S]*?)\n---/);
			if (!match) continue;
			const fm = match[1];
			const slug = file.replace(/\.(md|mdx)$/, '').toLowerCase();
			const pub = fm.match(/pubDate:\s*(.+)/)?.[1]?.trim();
			const upd = fm.match(/updatedDate:\s*(.+)/)?.[1]?.trim();
			const lastmod = upd || pub;
			if (lastmod) {
				dates[slug] = new Date(lastmod).toISOString().slice(0, 10);
			}
		}
	} catch {}
	return dates;
}

const blogDates = getBlogDates();

// https://astro.build/config
export default defineConfig({
	site: 'https://synxn1o.github.io',
	output: "static",
	compressHTML: true,
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !page.includes('/404'),
			changefreq: ChangeFreqEnum.MONTHLY,
			priority: 0.5,
			serialize(item) {
				const url = item.url;

				if (/\/blog\/.+/.test(url)) {
					const slug = url.replace(/\/$/, '').split('/').pop().toLowerCase();
					item.changefreq = ChangeFreqEnum.MONTHLY;
					item.priority = 0.8;
					if (blogDates[slug]) {
						item.lastmod = blogDates[slug];
					}
				} else if (/\/blog\/?$/.test(url)) {
					item.changefreq = ChangeFreqEnum.WEEKLY;
					item.priority = 0.8;
				} else if (/\/projects\/?$/.test(url)) {
					item.changefreq = ChangeFreqEnum.MONTHLY;
					item.priority = 0.7;
				} else if (/\/publications\/?$/.test(url)) {
					item.changefreq = ChangeFreqEnum.MONTHLY;
					item.priority = 0.7;
				} else if (/\/about\/?$/.test(url)) {
					item.changefreq = ChangeFreqEnum.MONTHLY;
					item.priority = 0.6;
				} else if (/\/tags/.test(url)) {
					item.changefreq = ChangeFreqEnum.WEEKLY;
					item.priority = 0.5;
				} else if (/\/archive\/?$/.test(url)) {
					item.changefreq = ChangeFreqEnum.MONTHLY;
					item.priority = 0.5;
				} else if (/\/$/.test(url)) {
					item.changefreq = ChangeFreqEnum.WEEKLY;
					item.priority = 1.0;
				}

				return item;
			},
		})
	],
	markdown: {
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
		},
		processor: unified({
			remarkPlugins: [remarkMath],
			rehypePlugins: [rehypeKatex],
		}),
	},
	build: {
		inlineStylesheets: 'always',
	},
});
