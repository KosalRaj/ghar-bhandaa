import fs from 'node:fs';
import path from 'node:path';

const projectRoot = '/Volumes/Acasis2TB/playground/ghar-bhandaa';
const docFiles = [
  path.join(projectRoot, 'README.md'),
  path.join(projectRoot, 'docs/api-catalog.md'),
  path.join(projectRoot, 'docs/architecture.md'),
  path.join(projectRoot, 'docs/audit-report.md'),
  path.join(projectRoot, 'docs/developer-guide.md'),
];

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '') // remove html tags
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric except space and hyphen
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-'); // multiple hyphens to single
}

function extractHeadings(content) {
  const headings = new Set();
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^#{1,6}\s+(.+)$/);
    if (match) {
      const headingText = match[1].trim();
      const slug = slugify(headingText);
      headings.add(slug);
    }
  }
  return headings;
}

function extractLinks(filePath, content) {
  const links = [];
  // Regex for markdown links [text](url)
  const mdLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    const [fullMatch, text, url] = match;
    links.push({
      filePath,
      text,
      url: url.trim(),
      line: content.substring(0, match.index).split('\n').length,
    });
  }
  return links;
}

const report = {
  totalLinksChecked: 0,
  internalLinks: [],
  externalLinks: [],
  brokenLinks: [],
  validLinks: [],
};

const fileHeadingsCache = new Map();

for (const file of docFiles) {
  if (!fs.existsSync(file)) {
    console.error(`File does not exist: ${file}`);
    continue;
  }
  const content = fs.readFileSync(file, 'utf8');
  fileHeadingsCache.set(file, extractHeadings(content));
}

for (const file of docFiles) {
  if (!fs.existsSync(file)) continue;
  const content = fs.readFileSync(file, 'utf8');
  const links = extractLinks(file, content);

  for (const link of links) {
    report.totalLinksChecked++;
    const { url, filePath, text, line } = link;

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:')) {
      report.externalLinks.push(link);
      continue;
    }

    report.internalLinks.push(link);

    // Internal anchor in same file
    if (url.startsWith('#')) {
      const anchor = url.slice(1);
      const headings = fileHeadingsCache.get(filePath);
      if (!headings.has(anchor)) {
        report.brokenLinks.push({
          ...link,
          reason: `Anchor '#${anchor}' not found in ${path.relative(projectRoot, filePath)}`,
        });
      } else {
        report.validLinks.push(link);
      }
      continue;
    }

    // Relative file path, possibly with anchor
    const [relPath, anchor] = url.split('#');
    const targetPath = path.resolve(path.dirname(filePath), relPath);

    if (!fs.existsSync(targetPath)) {
      report.brokenLinks.push({
        ...link,
        reason: `Target file does not exist: ${targetPath} (relative: ${relPath})`,
      });
      continue;
    }

    if (anchor) {
      if (!fileHeadingsCache.has(targetPath)) {
        if (targetPath.endsWith('.md')) {
          const targetContent = fs.readFileSync(targetPath, 'utf8');
          fileHeadingsCache.set(targetPath, extractHeadings(targetContent));
        }
      }
      const targetHeadings = fileHeadingsCache.get(targetPath);
      if (targetHeadings && !targetHeadings.has(anchor)) {
        report.brokenLinks.push({
          ...link,
          reason: `Anchor '#${anchor}' not found in target file ${path.relative(projectRoot, targetPath)}`,
        });
      } else {
        report.validLinks.push(link);
      }
    } else {
      report.validLinks.push(link);
    }
  }
}

console.log(JSON.stringify(report, null, 2));
