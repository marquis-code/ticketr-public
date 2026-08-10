const fs = require('fs');
const path = require('path');

const files = [
  '/Users/marquis/tix-booking/public/pages/index.vue',
  '/Users/marquis/tix-booking/public/pages/my-tickets.vue',
  '/Users/marquis/tix-booking/public/pages/event/[slug].vue'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Remove header tag and everything inside it
  content = content.replace(/<header[\s\S]*?<\/header>/, '');

  // Add layout meta to script setup
  if (!content.includes("definePageMeta")) {
    if (content.includes('<script setup>')) {
      content = content.replace('<script setup>', "<script setup>\ndefinePageMeta({ layout: 'default' });\n");
    } else {
      content += "\n<script setup>\ndefinePageMeta({ layout: 'default' });\n</script>\n";
    }
  }

  // Remove surrounding min-h-screen wrappers that were handled by layout
  content = content.replace(/<div class="min-h-screen[^>]*>/, '<div>');

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
