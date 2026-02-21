const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Map the colors (text-gray-400 -> text-gray-500, text-gray-500 -> text-gray-600)
            content = content.replace(/text-gray-500/g, 'text-gray-600');
            content = content.replace(/text-gray-400/g, 'text-gray-500');
            // Also replace border-gray-100 with border-gray-200 to give borders more definition
            content = content.replace(/border-gray-100/g, 'border-gray-200');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    });
}

replaceInDir(path.join(__dirname, 'src'));
