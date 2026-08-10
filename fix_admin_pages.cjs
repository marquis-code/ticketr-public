const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.vue')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('/Users/marquis/tix-booking/public/pages/admin');
files.forEach(file => {
  if (file.includes('login.vue')) return; // skip login

  let content = fs.readFileSync(file, 'utf8');

  // Remove header tag and everything inside it
  content = content.replace(/<header[\s\S]*?<\/header>/, '');

  // Add layout meta to script setup
  if (!content.includes("definePageMeta")) {
    if (content.includes('<script setup>')) {
      content = content.replace('<script setup>', "<script setup>\ndefinePageMeta({ layout: 'admin' });\n");
    } else {
      content += "\n<script setup>\ndefinePageMeta({ layout: 'admin' });\n</script>\n";
    }
  }

  // Remove surrounding min-h-screen wrappers that were handled by layout
  content = content.replace(/<div class="min-h-screen[^>]*>/g, '<div>');

  // Fix main tags that had aggressive padding
  content = content.replace(/<main class="max-w-7xl mx-auto px-4 md:px-6 py-8 flex-grow w-full[^>]*>/, '<main class="w-full space-y-8">');

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
