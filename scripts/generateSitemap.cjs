// scripts/generateSitemap.cjs (CommonJS)
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Domínio do site
const SITE_URL = 'https://simplificacifras.com';

// Coleção no Firestore
const COLLECTION_NAME = 'cifras';

// Usa o slug “bonito” quando existir; fallback para o ID
function getCifraPath(docId, data) {
  if (data?.slug) return `/cifra/${data.slug}`;
  return `/cifra/${docId}`;
}

// Converte updatedAt/createdAt para ISO; fallback para agora
function toISO(tsA, tsB) {
  const ts = tsA || tsB;
  try {
    if (ts?.toDate) return ts.toDate().toISOString();
    if (typeof ts === 'string') return new Date(ts).toISOString();
  } catch (e) {}
  return new Date().toISOString();
}

async function generateSitemap() {
  console.log('Gerando sitemap...');

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // Página inicial
  sitemap += `  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <lastmod>${new Date().toISOString()}</lastmod>
  </url>\n`;

  // Páginas estáticas (adicione se quiser)
  // const staticPages = [
  //   { url: '/sobre', changefreq: 'monthly', priority: '0.7' },
  //   { url: '/contato', changefreq: 'monthly', priority: '0.5' },
  // ];
  // for (const p of staticPages) {
  //   sitemap += `  <url>
  //   <loc>${SITE_URL}${p.url}</loc>
  //   <changefreq>${p.changefreq}</changefreq>
  //   <priority>${p.priority}</priority>
  //   <lastmod>${new Date().toISOString()}</lastmod>
  // </url>\n`;
  // }

  // Cifras
  const snapshot = await db.collection(COLLECTION_NAME).get();
  console.log(`Encontradas ${snapshot.size} cifras.`);

  snapshot.forEach((doc) => {
    const data = doc.data();
    const urlPath = getCifraPath(doc.id, data);
    const lastmod = toISO(data?.updatedAt, data?.createdAt);

    sitemap += `  <url>
    <loc>${SITE_URL}${urlPath}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <lastmod>${lastmod}</lastmod>
  </url>\n`;
  });

  sitemap += `</urlset>\n`;

  const outputPath = path.join(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap, 'utf8');
  console.log(`Sitemap criado em: ${outputPath}`);
  console.log('Pronto!');
}

generateSitemap().catch((err) => {
  console.error('Erro ao gerar sitemap:', err);
  process.exit(1);
});