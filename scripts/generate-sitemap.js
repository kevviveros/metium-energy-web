const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://metium.energy/';
const ROOT_DIR = path.resolve(__dirname, '..');
const EXCLUDE_FILES = ['gracias.html', '404.html'];

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'css' && file !== 'js' && file !== 'img' && file !== 'scripts') {
                getFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html') && !EXCLUDE_FILES.includes(file)) {
            fileList.push(filePath);
        }
    });
    return fileList;
}

function generateSitemap() {
    const htmlFiles = getFiles(ROOT_DIR);
    const today = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    htmlFiles.forEach(file => {
        let relativePath = path.relative(ROOT_DIR, file).replace(/\\/g, '/');
        
        // Formatear la URL
        let url = BASE_URL + relativePath;
        if (relativePath === 'index.html') url = BASE_URL;
        
        let priority = 0.8;
        let changefreq = 'monthly';

        if (url === BASE_URL) {
            priority = 1.0;
            changefreq = 'weekly';
        } else if (relativePath.includes('xalapa')) {
            priority = 0.9;
        }

        xml += '  <url>\n';
        xml += `    <loc>${url}</loc>\n`;
        xml += `    <lastmod>${today}</lastmod>\n`;
        xml += `    <changefreq>${changefreq}</changefreq>\n`;
        xml += `    <priority>${priority}</priority>\n`;
        xml += '  </url>\n';
    });

    xml += '</urlset>';

    fs.writeFileSync(path.join(ROOT_DIR, 'sitemap.xml'), xml);
    console.log('✅ sitemap.xml generado con éxito.');
}

generateSitemap();
