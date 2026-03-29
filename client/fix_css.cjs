const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

const replacements = [
    ['chat-primaryHover', 'chat-primary-hover'],
    ['chat-textMuted', 'chat-text-muted'],
    ['chat-bubbleMine', 'chat-bubble-mine'],
    ['chat-bubbleOther', 'chat-bubble-other'],
];

files.forEach(file => {
    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    replacements.forEach(([oldStr, newStr]) => {
        content = content.split(oldStr).join(newStr);
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
});
