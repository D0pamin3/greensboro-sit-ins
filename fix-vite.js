const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\gabri\\Downloads\\greensboro-sit-ins_-digital-museum';
const newFile = path.join(dir, 'vite.config.ts.new');
const configFile = path.join(dir, 'vite.config.ts');

try {
  // Read the correct content from vite.config.ts.new
  const correctContent = fs.readFileSync(newFile, 'utf-8');
  
  // Write to vite.config.ts
  fs.writeFileSync(configFile, correctContent, 'utf-8');
  console.log('✓ vite.config.ts has been updated');
  
  // Delete vite.config.ts.new
  fs.unlinkSync(newFile);
  console.log('✓ vite.config.ts.new has been deleted');
  
  console.log('✓ Fix completed successfully');
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
