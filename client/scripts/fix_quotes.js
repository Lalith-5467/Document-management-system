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

    // We look for : var(--theme-primary, #FF6B00)
    // and if it's not preceded by a quote, we wrap it in quotes.
    // A simpler way: we know we replaced '#FF6B00' with var(--theme-primary, #FF6B00).
    // Let's just use regex to replace it with 'var(--theme-primary, #FF6B00)'
    // BUT only if it is not already in quotes (we already fixed AICarouselSlider.tsx manually).
    
    content = content.replace(/(?<!['"])var\(--theme-primary, #FF6B00\)(?!['"])/g, "'var(--theme-primary, #FF6B00)'");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Fixed:', file);
        changedFiles++;
    }
});

console.log(`Fixed quotes in ${changedFiles} files.`);
