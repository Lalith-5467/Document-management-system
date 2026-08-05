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
        } else { 
            if(file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, '../src'));
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace #FF6B00 in Tailwind classes
    content = content.replace(/\[#FF6B00\]/g, 'themePrimary');
    
    // Replace #FF8A00 (gradient ending) in Tailwind classes
    content = content.replace(/\[#FF8A00\]/g, 'themePrimary'); // Since we didn't define a secondary orange, we can just use primary or create a themePrimary-dark. Actually, replacing with themePrimary is fine for now, or just leave it.
    
    // Replace text-[#FF6B00] style inline strings (e.g., in style={{ color: '#FF6B00' }})
    content = content.replace(/'#FF6B00'/g, 'var(--theme-primary, #FF6B00)');
    content = content.replace(/"#FF6B00"/g, 'var(--theme-primary, #FF6B00)');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
    }
});

console.log(`Replaced colors in ${changedFiles} files.`);
