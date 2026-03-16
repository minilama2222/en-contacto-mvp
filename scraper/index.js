/**
 * Scraper recursivo para en-contacto.net
 * Extrae todo el contenido del sitio web
 */

import puppeteer from 'puppeteer';
import TurndownService from 'turndown';
import slugify from 'slugify';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.en-contacto.net';
const OUTPUT_DIR = path.join(__dirname, 'output');
const CONTENT_DIR = path.join(__dirname, 'content');
const ASSETS_DIR = path.join(__dirname, 'assets', 'images');

const visited = new Set();
const toVisit = new Set();

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Mapeo de URLs a categorías
function getCategory(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;
  
  if (pathname.includes('/que-es-el-at/')) return 'analisis-transaccional';
  if (pathname.includes('/el-gabinete-de-at/entrenamiento')) return 'formacion';
  if (pathname.includes('/el-gabinete-de-at/psicoterapia')) return 'psicoterapia';
  if (pathname.includes('/certificacon')) return 'certificacion';
  if (pathname.includes('/blog/')) return 'blog';
  if (pathname === '/' || pathname === '') return 'inicio';
  if (pathname.includes('/el-gabinete-de-at/')) return 'gabinete';
  return 'general';
}

// Extraer slug de la URL
function getSlug(url) {
  const urlObj = new URL(url);
  let pathname = urlObj.pathname;
  
  // Quitar slashes finales
  pathname = pathname.replace(/\/$/, '');
  
  // Quitar extensiones
  pathname = pathname.replace(/\.html$/, '');
  
  // Obtener el último segmento
  const segments = pathname.split('/').filter(s => s);
  return segments.length > 0 ? segments[segments.length - 1] : 'index';
}

// Convertir HTML a Markdown
function htmlToMarkdown(html) {
  return turndownService.turndown(html);
}

// Limpiar texto
function cleanText(text) {
  return text?.replace(/\s+/g, ' ').trim() || '';
}

async function extractLinks(page) {
  return await page.evaluate(() => {
    const links = [];
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href.startsWith('/') || href.startsWith(BASE_URL))) {
        let fullUrl = href.startsWith('http') ? href : BASE_URL + href;
        // Quitar query params y hash
        fullUrl = fullUrl.split('?')[0].split('#')[0];
        if (fullUrl.startsWith(BASE_URL) && !fullUrl.includes('#') && !fullUrl.includes('?')) {
          links.push(fullUrl);
        }
      }
    });
    return [...new Set(links)];
  });
}

async function extractPageContent(page, url) {
  const category = getCategory(url);
  const slug = getSlug(url);
  
  try {
    // Obtener título
    const title = await page.title();
    
    // Obtener contenido principal
    const content = await page.evaluate(() => {
      // Intentar encontrar el contenido principal
      let mainContent = document.querySelector('article') || 
                        document.querySelector('main') || 
                        document.querySelector('.content') ||
                        document.querySelector('.entry-content') ||
                        document.querySelector('#content') ||
                        document.querySelector('.post-content') ||
                        document.querySelector('body');
      
      return mainContent ? mainContent.innerHTML : '';
    });
    
    // Obtener fecha de modificación
    const lastMod = await page.evaluate(() => {
      const meta = document.querySelector('meta[property="article:modified_time"]') ||
                   document.querySelector('meta[name="modified"]') ||
                   document.querySelector('[class*="modified"]');
      return meta ? meta.getAttribute('content') || meta.textContent : null;
    });
    
    // Obtener imagen principal
    const featuredImage = await page.evaluate(() => {
      const img = document.querySelector('article img') ||
                  document.querySelector('.featured-image img') ||
                  document.querySelector('.post-thumbnail img') ||
                  document.querySelector('meta[property="og:image"]');
      return img ? (img.getAttribute('content') || img.getAttribute('src')) : null;
    });
    
    // Obtener descripción
    const description = await page.evaluate(() => {
      const meta = document.querySelector('meta[name="description"]') ||
                   document.querySelector('meta[property="og:description"]');
      return meta ? meta.getAttribute('content') : null;
    });
    
    // Extraer nuevos enlaces
    const links = await extractLinks(page);
    
    const markdown = htmlToMarkdown(content);
    
    return {
      url,
      title: cleanText(title),
      slug,
      category,
      content: {
        html: content,
        markdown
      },
      metadata: {
        lastMod,
        featuredImage,
        description
      },
      links
    };
    
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error.message);
    return null;
  }
}

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    await fs.writeFile(filename, Buffer.from(buffer));
    console.log(`Downloaded: ${filename}`);
  } catch (error) {
    console.error(`Failed to download ${url}:`, error.message);
  }
}

async function scrapePage(browser, page, url) {
  if (visited.has(url)) return;
  visited.add(url);
  
  console.log(`Scraping: ${url}`);
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    const data = await extractPageContent(page, url);
    
    if (data) {
      // Crear directorio de categoría
      const categoryDir = path.join(OUTPUT_DIR, data.category);
      await fs.ensureDir(categoryDir);
      
      // Guardar JSON
      const jsonPath = path.join(categoryDir, `${data.slug}.json`);
      await fs.writeJson(jsonPath, data, { spaces: 2 });
      
      // Guardar Markdown
      const mdContentDir = path.join(CONTENT_DIR, data.category);
      await fs.ensureDir(mdContentDir);
      
      // Crear frontmatter
      const frontmatter = `---
title: "${data.title}"
slug: "${data.slug}"
category: "${data.category}"
${data.metadata.lastMod ? `lastMod: "${data.metadata.lastMod}"` : ''}
${data.metadata.description ? `description: "${data.metadata.description}"` : ''}
${data.metadata.featuredImage ? `featuredImage: "${data.metadata.featuredImage}"` : ''}
---

`;
      
      const mdPath = path.join(mdContentDir, `${data.slug}.md`);
      await fs.writeFile(mdPath, frontmatter + data.content.markdown);
      
      console.log(`Saved: ${data.category}/${data.slug}`);
      
      // Añadir nuevos enlaces a la cola
      for (const link of data.links) {
        if (!visited.has(link) && link.startsWith(BASE_URL)) {
          toVisit.add(link);
        }
      }
      
      // Descargar imagen destacada si existe
      if (data.metadata.featuredImage) {
        const imgUrl = data.metadata.featuredImage;
        if (imgUrl.startsWith('http')) {
          const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
          const imgPath = path.join(ASSETS_DIR, `${data.slug}${ext}`);
          await downloadImage(imgUrl, imgPath);
        }
      }
    }
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
  } catch (error) {
    console.error(`Error scraping ${url}:`, error.message);
  }
}

async function run() {
  console.log('Starting scraper for en-contacto.net...\n');
  
  // Asegurar directorios
  await fs.ensureDir(OUTPUT_DIR);
  await fs.ensureDir(CONTENT_DIR);
  await fs.ensureDir(ASSETS_DIR);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Añadir URL inicial
  toVisit.add(BASE_URL);
  
  let count = 0;
  const maxPages = 100; // Límite para evitar scraping infinito
  
  while (toVisit.size > 0 && count < maxPages) {
    const url = toVisit.values().next().value;
    toVisit.delete(url);
    
    await scrapePage(browser, page, url);
    count++;
    
    // Log progreso cada 10 páginas
    if (count % 10 === 0) {
      console.log(`\n--- Progress: ${count} pages scraped, ${toVisit.size} pending ---\n`);
    }
  }
  
  await browser.close();
  
  console.log(`\n✅ Scraping complete! Total pages: ${count}`);
  console.log(`Output: ${OUTPUT_DIR}`);
  console.log(`Content: ${CONTENT_DIR}`);
}

run().catch(console.error);
