// build.js — ejecutado automáticamente en cada deploy de Netlify
// Genera: posts/index.json, sitemap.xml, robots.txt

const fs   = require('fs');
const path = require('path');

const POSTS_DIR  = path.join(__dirname, 'posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');
const DOMAIN     = 'https://atarazzia.com';

// ── 1. POSTS INDEX ──────────────────────────────────────────
function parseFrontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {} };
  const meta = {};
  match[1].split('\n').forEach(line => {
    const [k, ...v] = line.split(':');
    if (k && k.trim()) meta[k.trim()] = v.join(':').trim().replace(/^"|"$/g, '');
  });
  return { meta };
}

const files = fs.readdirSync(POSTS_DIR)
  .filter(f => f.endsWith('.md'))
  .sort().reverse();

const posts = files.map(file => {
  const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
  const { meta } = parseFrontmatter(content);
  return { file, title: meta.title || 'Sin título', date: meta.date || '', excerpt: meta.excerpt || '' };
});

fs.writeFileSync(INDEX_FILE, JSON.stringify(posts, null, 2), 'utf8');
console.log(`✓ index.json generado con ${posts.length} escrito(s).`);

// ── 2. SITEMAP.XML ───────────────────────────────────────────
const today = new Date().toISOString().split('T')[0];

const staticPages = [
  { url: '/',               priority: '1.0', freq: 'weekly'  },
  { url: '/blog/',          priority: '0.9', freq: 'weekly'  },
  { url: '/suscripcion/',   priority: '0.8', freq: 'monthly' },
  { url: '/contacto/',      priority: '0.6', freq: 'monthly' },
];

const postUrls = posts.map(p => ({
  url:      `/blog/#${p.file.replace('.md','')}`,
  priority: '0.7',
  freq:     'monthly',
  date:     p.date || today,
}));

const allUrls = [...staticPages, ...postUrls];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(p => `  <url>
    <loc>${DOMAIN}${p.url}</loc>
    <lastmod>${p.date || today}</lastmod>
    <changefreq>${p.freq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap, 'utf8');
console.log(`✓ sitemap.xml generado con ${allUrls.length} URLs.`);

// ── 3. ROBOTS.TXT ────────────────────────────────────────────
const robots = `User-agent: *
Allow: /
Disallow: /admin/

Sitemap: ${DOMAIN}/sitemap.xml`;

fs.writeFileSync(path.join(__dirname, 'robots.txt'), robots, 'utf8');
console.log('✓ robots.txt generado.');
