const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory() && !fullPath.includes('node_modules') && !fullPath.includes('.next')) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let originalContent = content;

            // Shift all text grays up by one shade safely in descending order
            content = content.replace(/text-gray-600/g, 'text-gray-700');
            content = content.replace(/text-gray-500/g, 'text-gray-600');
            content = content.replace(/text-gray-400/g, 'text-gray-500');
            content = content.replace(/text-gray-300/g, 'text-gray-400');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated contrast in: ${fullPath}`);
            }
        }
    });
}

replaceInDir(path.join(__dirname, 'src'));
