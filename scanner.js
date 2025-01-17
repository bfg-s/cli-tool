const fs = require('fs');
const path = require('path');

/**
 * Функція для сканування директорії на наявність JS-файлів із класами.
 * @param {string} dirPath - Шлях до директорії для сканування.
 * @returns {Promise<string[]>} - Масив шляхів до JS-файлів, що містять клас.
 */
module.exports = async function findJsFilesWithClass(dirPath) {
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
