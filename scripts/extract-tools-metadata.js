const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Robust heuristic parser for flat config arrays
function parseFileForTools(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const tools = [];
  
  // Find all occurrences of "slug:"
  const slugRegex = /slug:\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = slugRegex.exec(content)) !== null) {
    const slug = match[1];
    const index = match.index;
    
    // Grab a window of text before and after the slug matching index to find name and description
    // Usually, name and description are within 300 characters of the slug in the same object.
    const startWindow = Math.max(0, index - 200);
    const endWindow = Math.min(content.length, index + 300);
    const windowText = content.substring(startWindow, endWindow);
    
    // Find name
    const nameMatch = windowText.match(/name:\s*['"`]([^'"`]+)['"`]/);
    // Find description
    const descMatch = windowText.match(/description:\s*['"`]([^'"`\\]*(?:\\.[^'"`\\]*)*)['"`]/);
    
    if (nameMatch) {
      // Avoid duplicate slugs from the same file
      if (!tools.some(t => t.slug === slug)) {
        tools.push({
          slug: slug,
          name: nameMatch[1],
          description: descMatch ? descMatch[1] : ''
        });
      }
    }
  }
  
  return tools;
}

function getBaseTools() {
  const filePath = path.join(ROOT_DIR, 'frontend', 'utils', 'tools.js');
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  
  const baseTools = [];
  const baseToolsSectionMatch = content.match(/const baseTools = \[\s*([\s\S]*?)\s*\];/);
  if (baseToolsSectionMatch) {
    const section = baseToolsSectionMatch[1];
    
    // Find all slug matches in baseTools
    const slugRegex = /slug:\s*['"`]([^'"`]+)['"`]/g;
    let match;
    while ((match = slugRegex.exec(section)) !== null) {
      const slug = match[1];
      const index = match.index;
      const start = Math.max(0, index - 150);
      const end = Math.min(section.length, index + 150);
      const windowText = section.substring(start, end);
      
      const nameMatch = windowText.match(/name:\s*['"`]([^'"`]+)['"`]/);
      const categoryMatch = windowText.match(/category:\s*['"`]([^'"`]+)['"`]/);
      const descMatch = windowText.match(/description:\s*['"`]([^'"`]+)['"`]/);
      
      if (nameMatch && categoryMatch) {
        baseTools.push({
          name: nameMatch[1],
          slug: slug,
          category: categoryMatch[1],
          description: descMatch ? descMatch[1] : ''
        });
      }
    }
  }
  return baseTools;
}

function run() {
  const baseTools = getBaseTools();
  console.log(`Extracted ${baseTools.length} base tools from tools.js.`);
  
  const suites = [
    { file: 'textSuiteConfig.js', category: 'Text Tools' },
    { file: 'imageSuiteConfig.js', category: 'Image Tools' },
    { file: 'developerSuiteConfig.js', category: 'Developer Tools' },
    { file: 'securitySuiteConfig.js', category: 'Security Tools' },
    { file: 'utilitySuiteConfig.js', category: 'Utility Tools' },
    { file: 'socialSuiteConfig.js', category: 'Social Media Tools' }
  ];
  
  let allTools = [...baseTools];
  
  for (const suite of suites) {
    const filePath = path.join(ROOT_DIR, 'frontend', 'components', 'tools', 'configs', suite.file);
    const suiteTools = parseFileForTools(filePath);
    console.log(`Extracted ${suiteTools.length} tools from ${suite.file} for category ${suite.category}.`);
    
    for (const tool of suiteTools) {
      const existingIdx = allTools.findIndex(t => t.slug === tool.slug);
      if (existingIdx > -1) {
        allTools[existingIdx].description = tool.description || allTools[existingIdx].description;
      } else {
        allTools.push({
          name: tool.name,
          slug: tool.slug,
          category: suite.category,
          description: tool.description
        });
      }
    }
  }
  
  // Custom SEO Tools mappings:
  const seoSlugs = [
    'keyword-density-checker',
    'readability-checker',
    'slug-generator',
    'robots-txt-checker',
    'malware-url-scanner',
    'url-safety-checker',
    'hashtag-generator',
    'text-hashtag-generator'
  ];
  
  allTools = allTools.map(tool => {
    if (seoSlugs.includes(tool.slug)) {
      return { ...tool, category: 'SEO Tools' };
    }
    return tool;
  });
  
  // Sort tools by name
  allTools.sort((a, b) => a.name.localeCompare(b.name));
  
  // Ensure the chrome-extension directory exists
  const extDir = path.join(ROOT_DIR, 'chrome-extension');
  if (!fs.existsSync(extDir)) {
    fs.mkdirSync(extDir);
  }
  
  fs.writeFileSync(
    path.join(extDir, 'tools.json'),
    JSON.stringify(allTools, null, 2),
    'utf8'
  );
  
  console.log(`Total tools written to chrome-extension/tools.json: ${allTools.length}`);
}

run();
