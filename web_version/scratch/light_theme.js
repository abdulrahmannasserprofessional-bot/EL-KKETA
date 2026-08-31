const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/Dell/AndroidStudioProjects/ELKKETA/web_version';
const files = fs.readdirSync(dir).filter(f => f.startsWith('admin-') && f.endsWith('.html'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    
    // Invert background
    content = content.replace(/background:\s*#0F1117/g, 'background: #F4F7FE');
    
    // Invert card backgrounds
    content = content.replace(/background:\s*#1A1D2E/g, 'background: #FFFFFF');
    content = content.replace(/background:\s*rgba\(0,0,0,0\.05\)/g, 'background: #FFFFFF');
    
    // Text colors
    content = content.replace(/color:\s*var\(--text-main\)/g, 'color: #1E293B');
    content = content.replace(/color:\s*rgba\(255,255,255,0\.([0-9]+)\)/g, 'color: rgba(0,0,0,0.$1)');
    content = content.replace(/color:\s*#A5B4FC/g, 'color: #4F46E5');
    
    // Borders
    content = content.replace(/border:\s*1px\s+solid\s+rgba\(255,255,255,0\.([0-9]+)\)/g, 'border: 1px solid rgba(0,0,0,0.$1)');
    content = content.replace(/border-top:\s*none/g, 'border-top: none'); // keep
    
    // Inputs
    content = content.replace(/background:\s*rgba\(255,255,255,0\.06\)/g, 'background: #F8FAFC');
    content = content.replace(/background:\s*rgba\(255,255,255,0\.1\)/g, 'background: #F1F5F9');
    
    fs.writeFileSync(path.join(dir, file), content);
    console.log('Updated', file);
});
