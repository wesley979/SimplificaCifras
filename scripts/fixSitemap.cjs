// scripts/fixSitemap.cjs
const fs = require('fs');
const path = require('path');

// Caminhos possíveis do sitemap
const paths = [
  path.join(process.cwd(), 'public', 'sitemap.xml'),
  path.join(process.cwd(), 'dist', 'sitemap.xml'),
];

paths.forEach((filePath) => {
  if (!fs.existsSync(filePath)) return;

  console.log(`Corrigindo sitemap em: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Força sempre https://www.simplificacifras.com.br
  content = content.replace(
    /https?:\/\/(www\.)?simplificacifras\.com(\.br)?/g,
    'https://www.simplificacifras.com.br'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Sitemap corrigido: ${filePath}`);
});

console.log('Fix do sitemap concluído!');