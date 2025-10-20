// scripts/fixSitemap.cjs

const fs = require('fs');
const path = require('path');

// Caminhos possíveis do sitemap
const paths = [
  path.join(process.cwd(), 'public', 'sitemap.xml'),
  path.join(process.cwd(), 'dist', 'sitemap.xml')
];

// Faz o replace de todas as URLs sem www
paths.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    console.log(`Corrigindo sitemap em: ${filePath}`);

    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
      /https:\/\/simplificacifras\.com\.br/g,
      'https://www.simplificacifras.com.br'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Sitemap corrigido: ${filePath}`);
  }
});

console.log('Fix do sitemap concluído!');