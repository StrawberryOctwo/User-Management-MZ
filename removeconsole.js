const fs = require('fs');
const path = require('path');

const removeConsoleLogs = (dir) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      removeConsoleLogs(fullPath); // Recursively process directories
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/console\.log\(.*?\);?/g, ''); // Regex to remove console.log
      fs.writeFileSync(fullPath, content, 'utf8');
    }
  });
};

// Replace with your app's src directory
removeConsoleLogs('./src');
console.log('All console.log statements removed!');
