const fs = require('fs');
let content = fs.readFileSync('.gitignore', 'utf8');
content = content.replace('/public/build', '# /public/build');
fs.writeFileSync('.gitignore', content, 'utf8');
