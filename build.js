// build.js — genera posts/index.json automáticamente en cada deploy de Netlify
const fs   = require('fs');
const path = require('path');

const POSTS_DIR  = path.join(__dirname, 'posts');
const INDEX_FILE = path.join(POSTS_DIR, 'index.json');

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
