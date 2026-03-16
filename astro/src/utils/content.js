import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ruta base del contenido scrapeado
const CONTENT_BASE = path.join(__dirname, '..', '..', 'scraper', 'content');

// Sanitizar slug para URL válida
function sanitizeSlug(slug) {
  let s = slug
    .toLowerCase()
    .replace(/á|à|ä|â|ã/gi, 'a')
    .replace(/é|è|ë|ê/gi, 'e')
    .replace(/í|ì|ï|î/gi, 'i')
    .replace(/ó|ò|ö|ô|õ/gi, 'o')
    .replace(/ú|ù|ü|û/gi, 'u')
    .replace(/ñ/gi, 'n')
    .replace(/[%,]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s;
}

// Decodificar nombre de archivo
function decodeFilename(filename) {
  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

// Leer contenido de una categoría
export function getContent(category) {
  const contentPath = path.join(CONTENT_BASE, category);
  
  if (!fs.existsSync(contentPath)) {
    return [];
  }
  
  const files = fs.readdirSync(contentPath).filter(f => f.endsWith('.md'));
  
  return files.map(file => {
    const filePath = path.join(contentPath, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Decodificar nombre de archivo y sanitizar
    const rawSlug = decodeFilename(file.replace('.md', ''));
    const slug = sanitizeSlug(rawSlug);
    
    // Extraer frontmatter
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    let frontmatter = {};
    let body = content;
    
    if (frontmatterMatch) {
      const frontmatterStr = frontmatterMatch[1];
      body = content.replace(frontmatterMatch[0], '').trim();
      
      frontmatterStr.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
          frontmatter[key.trim()] = value;
        }
      });
    }
    
    return {
      rawSlug,
      slug,
      ...frontmatter,
      body
    };
  });
}

// Obtener todas las categorías disponibles
export function getCategories() {
  const contentPath = CONTENT_BASE;
  
  if (!fs.existsSync(contentPath)) {
    return [];
  }
  
  return fs.readdirSync(contentPath).filter(item => {
    return fs.statSync(path.join(contentPath, item)).isDirectory();
  });
}

// Obtener una página específica
export function getPage(category, slug) {
  const contentPath = path.join(CONTENT_BASE, category);
  
  if (!fs.existsSync(contentPath)) {
    return null;
  }
  
  const files = fs.readdirSync(contentPath).filter(f => f.endsWith('.md'));
  
  const matchedFile = files.find(f => {
    const rawSlug = decodeFilename(f.replace('.md', ''));
    return sanitizeSlug(rawSlug) === slug;
  });
  
  if (!matchedFile) {
    return null;
  }
  
  const filePath = path.join(contentPath, matchedFile);
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  let frontmatter = {};
  let body = content;
  
  if (frontmatterMatch) {
    const frontmatterStr = frontmatterMatch[1];
    body = content.replace(frontmatterMatch[0], '').trim();
    
    frontmatterStr.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        frontmatter[key.trim()] = value;
      }
    });
  }
  
  return {
    ...frontmatter,
    body
  };
}
