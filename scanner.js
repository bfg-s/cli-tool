const fs = require('fs');
const path = require('path');

module.exports = new class Scanner {

    async findJsFilesWithClass(dirPath) {
        const result = [];

        async function scanDirectory(currentPath) {
            const items = await fs.promises.readdir(currentPath, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(currentPath, item.name);
                const ext = path.extname(item.name);
                if (item.isDirectory()) {
                    await scanDirectory(fullPath);
                } else if (
                    item.isFile()
                    && (ext === '.js' || ext === '.cjs')
                ) {
                    const content = await fs.promises.readFile(fullPath, 'utf-8');
                    if (/class\s+\w+/.test(content)) {
                        result.push({
                            class: require(fullPath),
                            path: fullPath
                        });
                    }
                }
            }
        }

        if (fs.existsSync(dirPath)) {
            await scanDirectory(dirPath);
        }

        return result;
    }
}
