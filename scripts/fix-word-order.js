const fs = require('fs');

let content = fs.readFileSync('scripts/reseed-exercises-properly.js', 'utf8');

// Tìm tất cả các bài word-order và thêm shuffleArray
const lines = content.split('\n');
const newLines = [];
let inWordOrder = false;
let skipNext = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes("type: 'word-order'")) {
    inWordOrder = true;
    newLines.push(line);
  } else if (inWordOrder && line.includes('words: [')) {
    // Tìm dòng words và wrap bằng shuffleArray
    const match = line.match(/(.*words: )(\[.*\])(.*)/);
    if (match) {
      newLines.push(match[1] + 'shuffleArray(' + match[2] + ')' + match[3]);
    } else {
      newLines.push(line);
    }
    inWordOrder = false;
  } else {
    newLines.push(line);
  }
}

fs.writeFileSync('scripts/reseed-exercises-properly.js', newLines.join('\n'));
console.log('✅ Fixed all word-order exercises');
