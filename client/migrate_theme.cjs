const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Text colors
  { regex: /\btext-white\b/g, replacement: 'text-slate-900' },
  { regex: /\btext-slate-50\b/g, replacement: 'text-slate-900' },
  { regex: /\btext-slate-300\b/g, replacement: 'text-slate-600' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-slate-500' },
  
  // Backgrounds
  { regex: /\bbg-slate-950\b/g, replacement: 'bg-slate-50' },
  { regex: /\bbg-slate-900\/50\b/g, replacement: 'bg-white' },
  { regex: /\bbg-slate-900\b/g, replacement: 'bg-white' },
  { regex: /\bbg-slate-800\/60\b/g, replacement: 'bg-white' },
  { regex: /\bbg-slate-800\/50\b/g, replacement: 'bg-slate-50' },
  { regex: /\bbg-slate-800\b/g, replacement: 'bg-white' },
  { regex: /\bbg-slate-700\b/g, replacement: 'bg-slate-100' },
  { regex: /\bbg-slate-500\/20\b/g, replacement: 'bg-slate-100' },
  { regex: /\bbg-green-500\/20\b/g, replacement: 'bg-green-100' },
  { regex: /\bbg-white\/5\b/g, replacement: 'bg-white' },
  { regex: /\bbg-white\/10\b/g, replacement: 'bg-slate-100' },

  // Hover states
  { regex: /\bhover:bg-white\/5\b/g, replacement: 'hover:bg-slate-50' },
  { regex: /\bhover:bg-white\/10\b/g, replacement: 'hover:bg-slate-100' },
  { regex: /\bhover:bg-white\/20\b/g, replacement: 'hover:bg-slate-200' },
  { regex: /\bhover:bg-slate-800\b/g, replacement: 'hover:bg-slate-100' },
  { regex: /\bhover:text-white\b/g, replacement: 'hover:text-slate-900' },

  // Borders
  { regex: /\bborder-white\/5\b/g, replacement: 'border-slate-200' },
  { regex: /\bborder-white\/10\b/g, replacement: 'border-slate-200' },
  { regex: /\bborder-slate-800\b/g, replacement: 'border-slate-300' },
  { regex: /\bborder-slate-700\b/g, replacement: 'border-slate-300' },
  { regex: /\bborder-slate-500\/30\b/g, replacement: 'border-slate-200' },

  // Shadows
  { regex: /shadow-\[0_0_15px_rgba\(170,59,255,0\.4\)\]/g, replacement: 'shadow-md' },
  { regex: /hover:shadow-\[0_0_25px_rgba\(170,59,255,0\.6\)\]/g, replacement: 'hover:shadow-lg' },
  
  // Custom specific replacements
  { regex: /text-green-400/g, replacement: 'text-green-700' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  for (const { regex, replacement } of replacements) {
    content = content.replace(regex, replacement);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

processDirectory(directoryPath);
console.log('Migration complete.');
